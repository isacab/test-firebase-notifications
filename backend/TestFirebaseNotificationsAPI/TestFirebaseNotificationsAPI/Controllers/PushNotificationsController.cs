using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

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
        [HttpPost]
        public IActionResult Post([FromBody]NotificationModel data)
        {
            _notificationService.Send(data);
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
