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

namespace TestFirebaseNotificationsAPI.Services
{
    public class PushNotificationService
    {
        private static HttpClient http = new HttpClient();

        private const string _url = "https://fcm.googleapis.com/fcm/send";
        
        private readonly string _serverKey = ConfigurationManager.AppSettings["FCMServerKey"];

        private readonly ExponentialBackOff backoff = new ExponentialBackOff();

        private FcmResponseModel Send(NotificationModel data, int retryAttempt)
        {
            FcmResponseModel fcmResponse = null;

            try
            {
                // Create a request using the URL to the FCM API for sending push notifications
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(_url);

                // Start set headers
                request.Method = "POST";
                request.Accept = "application/json";
                request.ContentType = "application/json; charset=UTF-8";
                request.Headers.Add(string.Format("Authorization: vkey={0}", _serverKey));

                JsonSerializerSettings serializerSettings = new JsonSerializerSettings()
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };
                string json = JsonConvert.SerializeObject(data, serializerSettings);
                Byte[] byteArray = Encoding.UTF8.GetBytes(json);
                request.ContentLength = byteArray.Length;
                // End set headers

                // Get the request stream.  
                using (Stream dataStream = request.GetRequestStream())
                {
                    // Write the data to the request stream.  
                    dataStream.Write(byteArray, 0, byteArray.Length);
                }

                // Get the response.  
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    // Get the stream containing content returned by the server.  
                    using (Stream dataStreamResponse = response.GetResponseStream())
                    {
                        // Open the stream using a StreamReader for easy access.  
                        using (StreamReader reader = new StreamReader(dataStreamResponse))
                        {
                            // Read the content.  
                            string responseFromServer = reader.ReadToEnd();

                            // Deserialize the content to a FcmResponseModel
                            FcmResponseModel fcmResponseModel = JsonConvert.DeserializeObject<FcmResponseModel>(responseFromServer);
                            fcmResponseModel.status = response.StatusCode;
                            fcmResponse = fcmResponseModel;

                            if (fcmResponse != null && fcmResponse.failure > 0)
                                return handleFailedResults(fcmResponseModel, data);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // The time to wait until resend, if this variable remains null no resend will be done.
                TimeSpan? timeToWait = null;

                if(ex is FcmFailureException)
                {

                }
                var response = ((HttpWebResponse)ex.Response);


                if (response != null)
                {
                    int status = Convert.ToInt32(response.StatusCode);

                    // Check if response contains a Retry-After header
                    string retryAfter = response.GetResponseHeader("Retry-After");
                    if (retryAfter.Length != 0)
                    {
                        timeToWait = retryAfterStringToTimeSpan(retryAfter);
                    }
                    else if (status >= 500 && status <= 599)
                    {
                        // Resend using exponential backoff
                        timeToWait = backoff.CalcNextBackoff(retryAttempt);
                    }
                }
                else
                {
                    throw ex;
                }

                if (timeToWait != null)
                {

                }
            }

            return fcmResponse;
        }

        private bool shouldRemoveRegistration(FcmResultModel result)
        {
            return result.error == "NotRegistrated";
        }

        private FcmResponseModel handleFailedResults(FcmResponseModel response, NotificationModel sentData, int retryAttempt)
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
                }
            }

            string jsonString = JsonConvert.SerializeObject(sentData);
            NotificationModel notification = JsonConvert.DeserializeObject<NotificationModel>(jsonString);
            notification.To = null;
            notification.RegistrationIds = resendToList;

            return Send(notification, retryAttempt);
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
                    //"DeviceMessageRateExceeded",
                    //"TopicsMessageRateExceeded"
                };

            return errorList.Contains(result.error);
        }
    }
}
