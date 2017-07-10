using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Exceptions;
using TestFirebaseNotificationsAPI.Lib;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Services
{
    public class FcmConfiguration
    {
        private const string _defaultUrl = "https://fcm.googleapis.com/fcm/send";

        public FcmConfiguration(string serverKey, string url = _defaultUrl)
        {
            ServerKey = serverKey;
            Url = url;
        }

        public string Url { get; private set; }

        public string ServerKey { get; private set; }
    }

    public class FcmApiService
    {
        private readonly HttpClient _http;

        private readonly FcmConfiguration _fcmConfig;

        public FcmApiService(FcmConfiguration configuration)
        {
            _fcmConfig = configuration;

            _http = new HttpClient();
            _http.DefaultRequestHeaders.Accept.Clear();
            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _http.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", "key=" + configuration.ServerKey);
        }

        public async Task<HttpResponseMessage> Send(NotificationModel notification)
        {
            var json = notification.ToJson();

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Send a post request
            HttpResponseMessage response = await _http.PostAsync(_fcmConfig.Url, content);

            return response;
        }
    }
}
