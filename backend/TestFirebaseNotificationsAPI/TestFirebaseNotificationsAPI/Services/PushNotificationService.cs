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

namespace TestFirebaseNotificationsAPI.Services
{
    public class PushNotificationService
    {
        private const string _url = "https://fcm.googleapis.com/fcm/send";
        
        private string _serverKey = ConfigurationManager.AppSettings["FCMServerKey"];

        private readonly ExponentialBackOff backoff = new ExponentialBackOff();

        public string Send(NotificationModel data)
        {
            string str = "";

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
                            str = responseFromServer;
                            FcmResponseModel fcmResponse = JsonConvert.DeserializeObject<FcmResponseModel>(responseFromServer);

                            if (fcmResponse.failure > 0)
                                throw new Exception("failure is " + fcmResponse.failure);
                            else if (fcmResponse.results.Any(x => x.error != null))
                                throw new Exception("error in result: " + fcmResponse.results.First(x => x.error != null).error);
                        }
                    }
                }
            }
            catch (WebException ex)
            {
                var response = ((HttpWebResponse)ex.Response);

                if(response != null)
                {
                    string retryAfter = response.GetResponseHeader("Retry-After");
                    if(retryAfter.Length > 0)
                    {
                        this.retryAfter(retryAfter);
                    }
                }
                str = ex.Message;
            }
            catch (Exception ex)
            {
                str = ex.Message;
            }

            return str;
        }
        
        private void retryAfter(string retryAfter)
        {
            int seconds;
            DateTime dateTime;
            TimeSpan delay = new TimeSpan();
            if (Int32.TryParse(retryAfter, out seconds))
            {
                delay = TimeSpan.FromSeconds(seconds);
            }
            else if (DateTime.TryParse(retryAfter, out dateTime))
            {
                delay = DateTime.Now - dateTime;
            }

            if (delay == null)
                throw new Exception("");

            System.Threading.Thread.Sleep(Convert.ToInt32(delay.TotalMilliseconds));
        }
    }
}
