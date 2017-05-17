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

        public string Send(NotificationModel data)
        {
            string str = "";

            try
            {
                // Create a request using the URL to the FCM API for sending push notifications
                WebRequest request = WebRequest.Create(_url);

                // Start set headers
                request.Method = "POST";

                request.ContentType = "application/json;charset=UTF-8";

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
                            String responseFromServer = reader.ReadToEnd();
                            str = responseFromServer;
                        }
                    }
                }
            }
            catch (WebException ex)
            {
                string responseFromServer = new StreamReader(ex.Response.GetResponseStream()).ReadToEnd();
                Console.WriteLine(responseFromServer);
                str = ex.Message;
            }

            return str;
        }
    }
}
