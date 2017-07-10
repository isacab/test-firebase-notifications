using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using TestFirebaseNotificationsAPI.Model;
using System.Configuration;
using System.Threading;
using TestFirebaseNotificationsAPI.Exceptions;
using System.Net.Http;
using TestFirebaseNotificationsAPI.Lib;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Repository;
using Microsoft.Practices.EnterpriseLibrary.TransientFaultHandling;
using Serilog;

namespace TestFirebaseNotificationsAPI.Services
{
    public class FcmService
    {
        private readonly FcmApiService _fcmApiService;

        private readonly PushRegistrationRepository _registrations;

        private readonly ILogger _logger;

        private readonly RetryPolicy<FcmTransientErrorDetectionStrategy> _retryPolicy;

        private readonly Object _registrationsLock = new Object();

        public FcmService(FcmApiService fcmApiService, PushRegistrationRepository registrations, ILogger logger, RetryStrategy retryStrategy)
        {
            _fcmApiService = fcmApiService;
            _registrations = registrations;
            _logger = logger;
            _retryPolicy = new RetryPolicy<FcmTransientErrorDetectionStrategy>(retryStrategy);
            _retryPolicy.Retrying += OnRetrying;
        }

        public async Task Send(NotificationModel notification)
        {
            if (notification.IsTopicMessage())
                await SendToTopic(notification);
            else
                await SendToDevice(notification);
        }

        private async Task SendToDevice(NotificationModel notification)
        {
            NotificationModel originalNotification = notification;
            Dictionary<string, FcmResultModel> failedResults = new Dictionary<string, FcmResultModel>(); // token, error
            
            try
            {
                await _retryPolicy.ExecuteAsync(
                  async () =>
                  {
                      var response = await _fcmApiService.Send(notification);

                      if (response.IsSuccessStatusCode)
                      {
                          FcmMulticastMessageResponseModel fcmResponse = await response.Content.ReadAsAsync<FcmMulticastMessageResponseModel>();

                          if (fcmResponse.Failure > 0 || fcmResponse.CanonicalIds > 0 || failedResults.Any())
                          {

                              Dictionary<string, FcmResultModel> success, cannonical, failure;

                              CategorizeResults(fcmResponse, notification, out success, out failure, out cannonical);

                              // Update database with by replacing old tokens with new ones and remove invalid tokens
                              UpdatePushRegistrations(cannonical, failure);

                              // Remove successful tokens from failedResults
                              if (fcmResponse.Success > 0)
                                  failedResults = failedResults
                                      .Except(success)
                                      .ToDictionary(x => x.Key, x => x.Value);

                              if (fcmResponse.Failure > 0)
                              {
                                  // Add failure items to failedResults
                                  AddOrReplace(failedResults, failure);

                                  // Query all tokens associated with results with retryable error codes
                                  List<string> retryableTokens = failure
                                    .Where(FcmTransientErrorDetectionStrategy.IsTransientError)
                                    .Select(x => x.Key)
                                    .ToList();

                                  if (retryableTokens.Any())
                                  {
                                      // Clone notification and set registrationids to the ones that are retryable
                                      // This notification will be sent if the retrypolicy decides it should retry this execution action
                                      notification = (NotificationModel)notification.Clone();
                                      notification.To = null;
                                      notification.RegistrationIds = retryableTokens;
                                  }

                                  throw new FcmMulticastException()
                                  {
                                      Notification = originalNotification,
                                      Failed = failedResults,
                                      StatusCode = response.StatusCode,
                                      RetryAfter = response.Headers.RetryAfter
                                  };
                              }
                          }
                      }
                      else
                      {
                          string message = await ReadErrorMessageAsync(response);

                          throw new FcmException(message)
                          {
                              Notification = notification,
                              StatusCode = response.StatusCode,
                              RetryAfter = response.Headers.RetryAfter
                          };
                      }
                  });
            }
            catch (Exception ex) { await HandleException(ex); }
        }

        private async Task SendToTopic(NotificationModel notification)
        {
            try
            {
                await _retryPolicy.ExecuteAsync(
                  async () =>
                  {
                      var response = await _fcmApiService.Send(notification);

                      string error;

                      if (response.IsSuccessStatusCode)
                      {
                          FcmTopicMessageResponseModel fcmResponse = await response.Content.ReadAsAsync<FcmTopicMessageResponseModel>();
                          error = fcmResponse.Error;
                      }
                      else
                      {
                          error = await ReadErrorMessageAsync(response);
                      }

                      if(error != null)
                      {
                          throw new FcmException(error)
                          {
                              Notification = notification,
                              StatusCode = response.StatusCode,
                              RetryAfter = response.Headers.RetryAfter
                          };
                      }
                  });
            }
            catch (Exception ex) { await HandleException(ex); }
        }

        private async Task HandleException(Exception ex)
        {
            var fcmException = ex as FcmException;

            if(fcmException == null)
            {
                _logger.Error(ex, "Unexpected exception.");
                throw ex;
            }

            var retryAfter = fcmException.RetryAfter;
            var notification = fcmException.Notification;

            if (retryAfter != null && retryAfter.Delta.HasValue)
            {
                _logger.Warning(fcmException, @"Could not send notification to all receivers. Response contained retry-after header.
                    \n\tNotification: {A}
                    \n\tRetryAfter: {B}
                    \n\tStatusCode: {C}", 
                    fcmException.Notification.ToJson(), fcmException.RetryAfter, fcmException.StatusCode);
                await Task.Delay(retryAfter.Delta.Value);
                await Send(notification);
            }
            else
            {
                _logger.Error(fcmException, @"Could not send notification to all receivers.
                    \n\tNotification: {A}
                    \n\tRetryAfter: {B}
                    \n\tStatusCode: {C}",
                    fcmException.Notification.ToJson(), fcmException.RetryAfter, fcmException.StatusCode);
                throw ex;
            }
        }

        private void OnRetrying(object sender, RetryingEventArgs e)
        {
            _logger.Warning(e.LastException, "Retrying\n\tRetryCount: {A}\n\tDelay: {B}", e.CurrentRetryCount, e.Delay.ToString());
        }

        private void UpdatePushRegistrations(Dictionary<string, FcmResultModel> cannonical, Dictionary<string, FcmResultModel> failure)
        {
            lock(_registrationsLock)
            {
                // Update tokens
                foreach (var entry in cannonical)
                {
                    string oldToken = entry.Key;
                    string newToken = entry.Value.RegistrationId;
                    var reg = _registrations.Get(oldToken);
                    reg.Token = newToken;
                    _registrations.Update(reg);
                    _logger.Information("Fcm response result contained a canonical id.\n\tOld token: {A}\n\tNew token: {B}", oldToken, newToken);
                }

                // Remove not registrated tokens
                var notRegistratedTokens = failure.Where(x => x.Value.Error == "InvalidRegistration").Select(x => x.Key);
                _registrations.Delete(notRegistratedTokens);

                // Save all changes
                _registrations.SaveChanges();
            }
        }

        private void AddOrReplace<T1, T2>(Dictionary<T1, T2> dict1, Dictionary<T1, T2> dict2)
        {
            foreach (var pair in dict2)
            {
                dict1[pair.Key] = pair.Value;
            }
        }

        private async Task<string> ReadErrorMessageAsync(HttpResponseMessage response)
        {
            string strResponseContent = await response.Content.ReadAsStringAsync();

            string title = Helpers.GetHtmlTitle(strResponseContent);

            string message = title.Length > 0 ? title : strResponseContent;

            return message;
        }

        private void CategorizeResults(FcmMulticastMessageResponseModel fcmResponse, NotificationModel notification,
            out Dictionary<string, FcmResultModel> success, out Dictionary<string, FcmResultModel> failed, out Dictionary<string, FcmResultModel> cannonical)
        {
            success = new Dictionary<string, FcmResultModel>();
            failed = new Dictionary<string, FcmResultModel>();
            cannonical = new Dictionary<string, FcmResultModel>();
            var targetTokens = notification.GetTargets();
            int i = 0;
            foreach (var result in fcmResponse.Results)
            {
                string token = targetTokens[i];

                if (result.RegistrationId != null)
                    cannonical.Add(token, result);
                else if (result.Error != null)
                    failed.Add(token, result);
                else
                    success.Add(token, result);

                i++;
            }
        }
    }
}
