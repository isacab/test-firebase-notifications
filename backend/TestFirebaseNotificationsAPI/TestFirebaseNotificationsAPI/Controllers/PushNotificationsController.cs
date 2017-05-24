using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using TestFirebaseNotificationsAPI.TestFirebaseNotifications;

namespace TestFirebaseNotificationsAPI.Controllers
{
    [Route("api/[controller]")]
    public class PushNotificationsController : Controller
    {
        private PushNotificationService _notificationService;
        private PushRegistrationService _registrationService;
        private IServiceProvider _provider;

        public PushNotificationsController(IServiceProvider provider, PushNotificationService pushNotificationService, PushRegistrationService pushRegistrationService)
        {
            this._notificationService = pushNotificationService;
            this._registrationService = pushRegistrationService;
            this._provider = provider;
        }

        // GET api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // POST api/pushnotifications/start
        [HttpPost("start/{token}")]
        public IActionResult Start([FromBody]TestModel data, string token)
        {
            if (!ModelState.IsValid)
                return Json(new { Ok = false, Message = ModelState.Values.First().Errors.First().ErrorMessage });

            PushRegistrationModel reg = _registrationService.Get(token);

            if (reg == null)
                return Json(new { Ok = false, Message = "Token not found" });

            if (!reg.Enabled)
                return Json(new { Ok = false, Message = "Notifications are disabled" });

            data.PushRegistrationId = reg.Id;

            TestApplication testApp = new TestApplication(data);

            Task.Run((Action)testApp.Run);

            return Json(new { Ok = true });
        }

        // POST api/pushnotifications/stop
        [HttpPost("stop/{token}")]
        public IActionResult Stop(string token)
        {
            PushRegistrationModel reg = _registrationService.Get(token);

            if (reg == null)
                return Json(new { Ok = false, Message = "Token not found" });

            int id = reg.Id;

            TestApplication testApp;

            if (!GlobalStore.RunningTests.TryGetValue(id, out testApp))
                return Json(new { Ok = false, Message = "No running test found" });

            testApp.Stop = true;

            GlobalStore.RunningTests.TryRemove(id, out testApp);

            return Json(new { Ok = true });
        }

        // POST api/pushnotifications/stoptimer
        [HttpPost("stoptimer/{token}")]
        public IActionResult StopTimer([FromBody]TestNotifactionContentModel data)
        {
            if (!ModelState.IsValid)
                return Json(new { Ok = false, Message = ModelState.Values.First().Errors.First().ErrorMessage });

            DateTime now = DateTime.UtcNow;
            TimeSpan latancy = data.Sent.Subtract(now);
            data.Latancy = latancy.Milliseconds;

            return Json(new { Ok = true, Data = data });
        }

        // POST api/pushnotifications
        [HttpPost("{token}")]
        public IActionResult Post(string token)
        {
            PushRegistrationModel reg = _registrationService.Get(token);

            if (reg == null)
                return Json(new { Ok = false, Message = "Token not found" });

            if (!reg.Enabled)
                return Json(new { Ok = false, Message = "Notifications are disabled" });

            NotificationModel notification = new NotificationModel()
            {
                To = token,
                Data = new {
                    Title = "Hello",
                    Body = "There!",
                    Sent = DateTime.Now
                }
            };

            _notificationService.Send(notification);

            return Json(new { Ok = false });
        }
    }
}
