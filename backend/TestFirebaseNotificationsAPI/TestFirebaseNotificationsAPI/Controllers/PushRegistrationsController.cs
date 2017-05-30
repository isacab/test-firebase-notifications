﻿using System;
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
                return BadRequest(new { Message = "No resource found" });

            return Json(model);
        }

        // POST api/pushregistrations
        [HttpPost]
        public IActionResult Post([FromBody]PushRegistrationModel data)
        {
            if (data == null)
                return BadRequest(new { Message = "Data is null" });

            if (!ModelState.IsValid)
                return BadRequest(new { Message = ModelState.Values.First().Errors.First().ErrorMessage });

            // Check if token is already registrated
            PushRegistrationModel model = _service.Get(data.Token);

            if (model != null)
                _service.Delete(data.Token); // Delete existing entries with the same token

            // Insert new data
            _service.Insert(data);
            _service.SaveChanges();

            return Json(data);
        }

        // PUT api/pushregistrations/{token}
        [HttpPut("{token}")]
        public IActionResult Put([FromBody]PushRegistrationModel data, string token)
        {
            if (data == null)
                return BadRequest(new { Message = "Data is null" });

            if (!ModelState.IsValid)
                return BadRequest(new { Message = ModelState.Values.First().Errors.First().ErrorMessage });

            PushRegistrationModel model = _service.Get(token);

            if (model == null)
                return BadRequest(new { Message = "Resource not found" });

            model.Token = data.Token;
            model.Enabled = data.Enabled;

            _service.Update(model);
            _service.SaveChanges();

            return Json(data);
        }

        // DELETE api/pushregistrations/{token}
        [HttpDelete("{token}")]
        public IActionResult Registrations(string token)
        {
            PushRegistrationModel model = _service.Get(token);

            if (model == null)
                return BadRequest(new { Message = "Resource not found" });

            _service.Delete(model);
            _service.SaveChanges();

            return Ok();
        }
    }
}
