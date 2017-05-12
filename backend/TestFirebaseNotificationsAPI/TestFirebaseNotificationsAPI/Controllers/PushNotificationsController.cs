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
        private PushNotificationService _pushNotificationService;
        private PushRegistrationService _pushRegistrationService;

        public PushNotificationsController(PushNotificationService pushNotificationService, PushRegistrationService pushRegistrationService)
        {
            this._pushNotificationService = pushNotificationService;
            this._pushRegistrationService = pushRegistrationService;
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
            _pushNotificationService.Send(data);
            return Json(new { ok = true });
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
