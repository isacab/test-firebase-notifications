using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Services;

namespace TestFirebaseNotificationsAPI.Controllers
{
    public class PushRegistrionsController : Controller
    {
        private PushRegistrationService _service;

        public PushRegistrionsController(PushRegistrationService pushRegistrationService)
        {
            this._service = pushRegistrationService;
        }

        // GET api/values/5
        [HttpGet("{token}")]
        public IActionResult Get(string token)
        {
            PushRegistrationModel model = _service.Get(token);

            return Json(model.ToJson());
        }

        // POST api/values
        [HttpPost]
        public IActionResult Post([FromBody]PushRegistrationModel data)
        {
            _service.Insert(data);
            _service.SaveChanges();
            return Json(data.ToJson());
        }

        // PUT api/values
        [HttpPost]
        public IActionResult Put([FromBody]PushRegistrationModel data)
        {
            _service.Update(data);
            _service.SaveChanges();
            return Json(data.ToJson());
        }

        // DELETE api/values
        [HttpPost]
        public IActionResult Registrations([FromBody]PushRegistrationModel data)
        {
            _service.Delete(data.Token);
            _service.SaveChanges();

            return Json(new { ok = true });
        }
    }
}
