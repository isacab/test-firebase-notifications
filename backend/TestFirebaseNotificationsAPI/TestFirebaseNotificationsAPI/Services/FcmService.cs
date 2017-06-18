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

namespace TestFirebaseNotificationsAPI.Services
{
    public class FcmConfiguration
    {
        private const string _defaultUrl = "https://fcm.googleapis.com/fcm/send";

        public FcmConfiguration(string serverKey, string url = _defaultUrl)
        {
            Url = url;
            ServerKey = serverKey;
        }

        public string Url { get; private set; }

        public string ServerKey { get; private set; }
    }

    public class FcmService
    {
        private readonly HttpClient _http;

        private readonly FcmConfiguration _fcmConfig;

        private readonly PushRegistrationRepository _registrations;

        public FcmService(FcmConfiguration configuration, PushRegistrationRepository registrations)
        {
            _fcmConfig = configuration;
            _registrations = registrations;

            _http = new HttpClient();
            _http.DefaultRequestHeaders.Accept.Clear();
            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _http.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", "key=" + configuration.ServerKey);
        }

        public async Task<FcmMulticastMessageResponseModel> SendToDevice(NotificationModel notification)
        {
            var response = await Send(notification);
            
            var fcmResponse = await response.Content.ReadAsAsync<FcmMulticastMessageResponseModel>();

            checkPushRegistrations(fcmResponse, notification);

            return fcmResponse;

            /*if (response.IsSuccessStatusCode)
                await onResponseOk(response, data, backoff);
            else
                await onResponseError(response, data, backoff);*/
        }

        public async Task<FcmTopicMessageResponseModel> SendToTopic(NotificationModel notification)
        {
            var response = await Send(notification);

            var fcmResponse = await response.Content.ReadAsAsync<FcmTopicMessageResponseModel>();

            return fcmResponse;
        }

        protected async Task<HttpResponseMessage> Send(NotificationModel notification)
        {
            var json = notification.ToJson();

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Send a post request
            HttpResponseMessage response = await _http.PostAsync(_fcmConfig.Url, content);

            response.EnsureSuccessStatusCode();

            return response;
        }

        /**
         * Removes pushRegistrations with invalid tokens and updates pushRegistrations with a cannonical token
         */
        private void checkPushRegistrations(FcmMulticastMessageResponseModel fcmResponse, NotificationModel notification)
        {
            if (fcmResponse.CanonicalIds > 0 || fcmResponse.Failure > 0)
            {
                var targetTokens = notification.GetTargetTokens();
                var notRegistratedTokens = new List<string>();
                int i = 0;
                foreach (var result in fcmResponse.Results)
                {
                    string oldRegistrationToken = targetTokens[i];
                    if (result.RegistrationId != null)
                    {
                        var reg = _registrations.Get(oldRegistrationToken);
                        reg.Token = result.RegistrationId;
                        _registrations.Update(reg);
                    }
                    else if (result.Error == "NotRegistrated")
                    {
                        notRegistratedTokens.Add(oldRegistrationToken);
                    }
                    i++;
                }
                if (notRegistratedTokens.Count != 0)
                {
                    _registrations.Delete(notRegistratedTokens);
                }
                _registrations.SaveChanges();
            }
        }

        /*protected async Task onResponseError(HttpResponseMessage response, NotificationModel data, IBackOff backoff)
        {
            int statusCode = (int)response.StatusCode;

            if (statusCode >= 500 && statusCode <= 599)
            {
                // Copy data
                NotificationModel copy = (NotificationModel)data.Clone();
                
                TimeSpan? bo = retryBackOff(response.Headers.RetryAfter, backoff);
                if (bo.HasValue && bo.Value.TotalMilliseconds < backoff.MaxInterval)
                    await Retry(copy, bo.Value);
            }

            response.EnsureSuccessStatusCode();
        }

        private async Task Retry(NotificationModel notification, TimeSpan backoff)
        {
            // Specific for the test
            if (notification.Data is TestNotifactionContentModel)
            {
                var testData = (TestNotifactionContentModel)notification.Data;
                testData.NumRetries++;
            }

            await Task.Delay(backoff);
            await Send(notification);
        }

        private TimeSpan? retryBackOff(RetryConditionHeaderValue retryAfter, IBackOff backoff = null)
        {
            TimeSpan? timeToWait = null;

            if (backoff != null)
            {
                // Next backoff
                timeToWait = backoff.NextBackOff();
            }

            // Check retry-after
            if (retryAfter != null && retryAfter.Delta.HasValue)
            {
                // Retry after has always highes prio if it has a value
                timeToWait = retryAfter.Delta.Value;
            }

            return timeToWait;
        }

        protected async Task onResponseOk(HttpResponseMessage response, NotificationModel data, IBackOff backoff)
        {
            response.EnsureSuccessStatusCode();

            if (data.IsTopicMessage())
            {
                FcmTopicMessageResponseModel topicResponse = await response.Content.ReadAsAsync<FcmTopicMessageResponseModel>();
            }
            else
            {
                FcmMessageResponseModel fcmResponse = await response.Content.ReadAsAsync<FcmMessageResponseModel>();

                if(fcmResponse.Failure > 0 || fcmResponse.CanonicalIds > 0)
                {
                    var retryList = new List<string>();
                    var removeList = new List<string>();
                    var results = (List<FcmResultModel>)fcmResponse.Results;
                    var registrationIds = data.GetReceivers();

                    for (int i = 0; i < results.Count; i++)
                    {
                        var result = results[i];

                        if (result.RegistrationId != null)
                        {
                            // replace registration id
                            PushRegistrationModel reg = _registrations.Get(registrationIds[i]);
                            reg.Token = result.RegistrationId;
                            _registrations.Update(reg);
                        }
                        else if (shouldRetry(result))
                        {
                            retryList.Add(registrationIds[i]);
                        }
                        else if (shouldRemoveRegistration(result))
                        {
                            removeList.Add(registrationIds[i]);
                        }
                    }

                    if(removeList.Count != 0)
                    {
                        // delete registrations from removeList
                        _registrations.Delete(removeList);
                    }

                    _registrations.SaveChanges();

                    if(retryList.Count != 0)
                    {
                        // Resend notification with registration ids from retryList
                        NotificationModel copy = (NotificationModel)data.Clone();
                        copy.To = null;
                        copy.RegistrationIds = retryList;

                        TimeSpan? bo = retryBackOff(response.Headers.RetryAfter, backoff);
                        if (bo.HasValue && bo.Value.TotalMilliseconds < backoff.MaxInterval)
                            await Retry(copy, bo.Value);
                    }
                }
            }

        }

        private bool shouldRemoveRegistration(FcmResultModel result)
        {
            return result.Error == "NotRegistrated";
        }

        private bool shouldRetry(FcmResultModel result)
        {
            // List of error messages where the app server should retry sending the message,
            // according to the reference at: https://firebase.google.com/docs/cloud-messaging/http-server-ref
            List<string> errorList = new List<string>()
                {
                    "Unavailable",
                    "InternalServerError",
                    //"DeviceMessageRateExceeded",
                    "TopicsMessageRateExceeded"
                };

            return errorList.Contains(result.Error);
        }*/

        /*private FcmResponseModel handleFailedResults(FcmResponseModel response, NotificationModel sentData, int retryAttempt)
        {
            List<string> resendToList = new List<string>();
            if (sentData.To != null)
            {
                resendToList.Add(sentData.To);
            }
            else
            {
                for (int i = 0; i < response.results.Count(); i++)
                {
                    var result = response.results.ElementAt(i);
                    if (shouldRetry(result))
                    {
                        resendToList.Add(sentData.RegistrationIds.ElementAt(i));
                    }
                    else if (shouldRemoveRegistration(result))
                    {
                        //remove registration
                    }
                    else if(result.)
                }
            }

            string jsonString = JsonConvert.SerializeObject(sentData);
            NotificationModel notification = JsonConvert.DeserializeObject<NotificationModel>(jsonString);
            notification.To = null;
            notification.RegistrationIds = resendToList;

            return Send(notification, retryAttempt);
        }
        
        private TimeSpan retryAfterStringToTimeSpan(string retryAfter)
        {
            int seconds;
            DateTime dateTime;
            TimeSpan timeToWait = new TimeSpan(0);
            if (Int32.TryParse(retryAfter, out seconds))
            {
                timeToWait = TimeSpan.FromSeconds(seconds);
            }
            else if (DateTime.TryParse(retryAfter, out dateTime))
            {
                timeToWait = DateTime.Now - dateTime;
            }

            return timeToWait;
        }*/
    }
}
