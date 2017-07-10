using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Repository;

namespace TestFirebaseNotificationsAPI.Services
{
    public class SyncApiFcmService
    {
        private readonly FcmConfiguration _fcmConfig;

        private readonly PushRegistrationRepository _registrations;

        public SyncApiFcmService(FcmConfiguration configuration, PushRegistrationRepository registrations)
        {
            _fcmConfig = configuration;
            _registrations = registrations;
        }

        public FcmMulticastMessageResponseModel SendToDevice(NotificationModel notification)
        {
            string body = Send(notification);

            // Deserialize the content to a FcmResponseModel
            FcmMulticastMessageResponseModel fcmResponseModel = JsonConvert.DeserializeObject<FcmMulticastMessageResponseModel>(body);

            //if (fcmResponseModel != null && fcmResponseModel.Failure > 0)
                //handleFailedResults(fcmResponseModel, notification);

            return fcmResponseModel;
        }

        public FcmTopicMessageResponseModel SendToTopic(NotificationModel notification)
        {
            string body = Send(notification);

            // Deserialize the content to a FcmResponseModel
            FcmTopicMessageResponseModel fcmResponseModel = JsonConvert.DeserializeObject<FcmTopicMessageResponseModel>(body);

            return fcmResponseModel;
        }

        protected string Send(NotificationModel notification)
        {
            string body = "";

            try
            {
                // Create a request using the URL to the FCM API for sending push notifications
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(_fcmConfig.Url);

                // Start set headers
                request.Method = "POST";
                request.Accept = "application/json";
                request.ContentType = "application/json; charset=UTF-8";
                request.Headers.Add(string.Format("Authorization: key={0}", _fcmConfig.ServerKey));

                JsonSerializerSettings serializerSettings = new JsonSerializerSettings()
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };
                string json = JsonConvert.SerializeObject(notification, serializerSettings);
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
                            body = reader.ReadToEnd();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
                /*
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

                }*/
            }

            return body;
        }
    }
}
