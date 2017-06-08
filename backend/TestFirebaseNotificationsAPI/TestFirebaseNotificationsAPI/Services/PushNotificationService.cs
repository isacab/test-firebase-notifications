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

namespace TestFirebaseNotificationsAPI.Services
{
    public class PushNotificationService
    {
        private const string _url = "https://fcm.googleapis.com/fcm/send";
        
        private readonly string _serverKey = ConfigurationManager.AppSettings["FCMServerKey"];

        private readonly ExponentialBackOff backoff = new ExponentialBackOff();

        private object Send(NotificationModel data, int retryAttempt)
        {
            object fcmResponse = null;

            try
            {
                // Create a request using the URL to the FCM API for sending push notifications
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(_url);

                // Start set headers
                request.Method = "POST";

                request.Accept = "application/json";
                request.ContentType = "application/json; charset=UTF-8";

                JsonSerializerSettings serializerSettings = new JsonSerializerSettings()
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };
                string json = JsonConvert.SerializeObject(data, serializerSettings);
                Byte[] byteArray = Encoding.UTF8.GetBytes(json);
                request.ContentLength = byteArray.Length;

                request.Headers.Add(string.Format("Authorization: key={0}", _serverKey));
                // End set headers

                // Get the request stream.  
                using (Stream dataStream = request.GetRequestStream())
                {
                    // Write the data to the request stream.  
                    dataStream.Write(byteArray, 0, byteArray.Length);
                }

                // Get the response.  
                using (WebResponse response = request.GetResponse())
                {
                    // Get the stream containing content returned by the server.  
                    using (Stream dataStreamResponse = response.GetResponseStream())
                    {
                        // Open the stream using a StreamReader for easy access.  
                        using (StreamReader reader = new StreamReader(dataStreamResponse))
                        {
                            // Read the content.  
                            string responseFromServer = reader.ReadToEnd();
                            FcmResponseModel fcmResponseModel = JsonConvert.DeserializeObject<FcmResponseModel>(responseFromServer);
                            fcmResponse = fcmResponseModel;

                            if (fcmResponseModel.failure > 0)
                                throw new FcmFailureException("failure is " + fcmResponseModel.failure);
                        }
                    }
                }
            }
            catch (WebException ex)
            {
                var response = ((HttpWebResponse)ex.Response);

                if (response != null)
                {
                    string retryAfter = response.GetResponseHeader("Retry-After");
                    if (retryAfter.Length != 0)
                    {
                        TimeSpan timeToWait = retryAfterStringToTimeSpan(retryAfter);
                        retryAttempt++;
                        return Send(data, retryAttempt);
                    }
                    else // go through the failures and decide action
                    {
                        FcmResponseModel fcmResponseModel = null;
                        // Get the stream containing content returned by the server.  
                        using (Stream dataStreamResponse = response.GetResponseStream())
                        {
                            // Open the stream using a StreamReader for easy access.  
                            using (StreamReader reader = new StreamReader(dataStreamResponse))
                            {
                                // Read the content.  
                                string responseFromServer = reader.ReadToEnd();
                                fcmResponseModel = JsonConvert.DeserializeObject<FcmResponseModel>(responseFromServer);
                                fcmResponse = fcmResponseModel;
                            }
                        }

                        if(fcmResponse != null)
                        {
                            /*List<string> resendTo = new List<string>();
                            for(int i = 0; i < fcmResponseModel.results.Count(); i++)
                            {
                                var result = fcmResponseModel.results.ElementAt(i);
                                if(shouldRetry(result))
                                {
                                    resendTo.Add()
                                }
                            }
                            TimeSpan timeToWait = backoff.CalcNextBackoff(retryAttempt);
                            retryAttempt++;
                            return Send(data, retryAttempt);*/
                        }
                    }
                }
                else
                {
                    throw ex;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return fcmResponse;
        }

        public object Send(NotificationModel data)
        {
            return Send(data, 0);
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
        }

        private bool shouldRetry(FcmResultModel result)
        {
            // List of error messages where the app server should retry sending the message,
            // according to the reference at: https://firebase.google.com/docs/cloud-messaging/http-server-ref
            List<string> errorList = new List<string>()
                {
                    "Unavailable",
                    "InternalServerError",
                    "DeviceMessageRateExceeded",
                    "TopicsMessageRateExceeded"
                };

            return errorList.Contains(result.error);
        }
    }
}
