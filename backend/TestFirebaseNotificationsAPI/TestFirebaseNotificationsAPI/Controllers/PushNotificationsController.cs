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

        public PushNotificationsController(PushNotificationService pushNotificationService, PushRegistrationService pushRegistrationService)
        {
            this._notificationService = pushNotificationService;
            this._registrationService = pushRegistrationService;
        }

        // GET api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // POST api/values
        [HttpPost("start/{token}")]
        public IActionResult Post([FromBody]TestModel data, string token)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { Message = ModelState.Values.First().Errors.First().ErrorMessage });

            PushRegistrationModel reg = _registrationService.Get(token);

            if (reg == null)
                return NotFound(new { Message = "Token not found" });

            if (!reg.Enabled)
                return BadRequest(new { Message = "Notifications are disabled" });

            TestContext context = new TestContext()
            {
                Test = data,
                SentNotifications = new List<NotificationContext>()
            };

            Object tcLock = GlobalStore.RunningTestLocks.GetOrAdd(token, new Object());
            TestContext t = GlobalStore.RunningTests.GetOrAdd(token, context);

            TestApplication testApp;

            // Stop already existing test
            lock (tcLock)
            {
                if (t != context)
                {
                    t.Stop = true;
                }

                testApp = new TestApplication(context, _notificationService);
            }

            Task.Run((Action)testApp.Run);

            return Json(new { ok = true });
        }

        // POST api/values
        [HttpPost("{token}")]
        public IActionResult Post(string token)
        {
            PushRegistrationModel reg = _registrationService.Get(token);

            if (reg == null)
                return NotFound(new { Message = "Token not found" });

            if (!reg.Enabled)
                return BadRequest(new { Message = "Notifications are disabled" });

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

            return Ok();
        }

        /*
        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
        */
    }
}
