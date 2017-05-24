using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TestFirebaseNotificationsAPI.Services;
using TestFirebaseNotificationsAPI.Model;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TestFirebaseNotificationsAPI.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class PushRegistrationsController : Controller
    {
        private PushRegistrationService _service;

        public PushRegistrationsController(PushRegistrationService pushRegistrationService)
        {
            this._service = pushRegistrationService;
        }

        // GET api/pushregistrations/{deviceId}
        [HttpGet("{token}")]
        public IActionResult Get(string token)
        {
            PushRegistrationModel model = _service.Get(token);

            if(model == null)
                return Json(new { Ok = false, Message = "No resource found" });

            return Json(new { Ok = true, Data = model });
        }

        // POST api/pushregistrations
        [HttpPost]
        public IActionResult Post([FromBody]PushRegistrationModel data)
        {
            if (!ModelState.IsValid)
                return Json(new { Ok = false, Message = ModelState.Values.First().Errors.First().ErrorMessage });

            // Check if token is already registrated
            PushRegistrationModel model = _service.Get(data.Token);

            if (model != null)
                _service.Delete(data.Token); // Delete existing entries with the same token

            // Insert new data
            _service.Insert(data);
            _service.SaveChanges();

            return Json(new { Ok = true, Data = data });
        }

        // PUT api/pushregistrations/{token}
        [HttpPut("{token}")]
        public IActionResult Put([FromBody]PushRegistrationModel data, string token)
        {
            if (!ModelState.IsValid)
                return Json(new { Ok = false, Message = ModelState.Values.First().Errors.First().ErrorMessage });

            PushRegistrationModel model = _service.Get(token);

            if (model == null)
                return Json(new { Ok = false, Message = "Resource does not exist" });

            model.Token = data.Token;
            model.Enabled = data.Enabled;

            _service.Update(model);
            _service.SaveChanges();

            return Json(new { Ok = true, Data = data });
        }

        // DELETE api/pushregistrations/{token}
        [HttpDelete("{token}")]
        public IActionResult Registrations(string token)
        {
            PushRegistrationModel model = _service.Get(token);

            if (model == null)
                return Json(new { Ok = false, Message = "Resource does not exist" });

            _service.Delete(model);
            _service.SaveChanges();

            return Json(new { Ok = true });
        }
    }
}
