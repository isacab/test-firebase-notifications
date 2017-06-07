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
using TestFirebaseNotificationsAPI.Repository;

namespace TestFirebaseNotificationsAPI.Controllers
{
    [Route("api/[controller]")]
    public class TestPushNotificationsController : Controller
    {
        private readonly PushRegistrationRepository _registrations;
        private readonly TestRepository _tests;
        private readonly TestNotifactionContentRepository _notifications;

        public TestPushNotificationsController(
            PushNotificationService pushNotificationService, 
            PushRegistrationRepository pushRegistrationRepository,
            TestRepository testRepository,
            TestNotifactionContentRepository testNotifactionContentRepository)
        {
            this._registrations = pushRegistrationRepository;
            this._tests = testRepository;
            this._notifications = testNotifactionContentRepository;
        }

        // GET api/testpushnotifications?token={token}
        [HttpGet]
        public IActionResult List()
        {
            if (!Request.Query.Keys.Contains("token"))
                return BadRequest(new { Message = "Token is required" });

            string token = Request.Query["token"].ToString();
            
            PushRegistrationModel reg = _registrations.Get(token);

            if (reg == null)
                return BadRequest(new { Message = "Resource not found" });

            IEnumerable<TestModel> list = _tests.List(token);

            var json = Json(list);
            return json;
        }

        // GET api/testpushnotifications/{id}
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            TestModel model = _tests.Get(id);

            if (model == null)
                return BadRequest(new { Message = "Resource not found" });

            var json = Json(model);
            return json;
        }

        // POST api/testpushnotifications/start
        [HttpPost("start/{token}")]
        public IActionResult Start([FromBody]TestModel data, string token)
        {
            if (data == null)
                return BadRequest(new { Message = "Data is null" });

            if (!ModelState.IsValid)
                return BadRequest(new { Message = ModelState.Values.First().Errors.First().ErrorMessage });

            PushRegistrationModel reg = _registrations.Get(token);

            if (reg == null)
                return BadRequest(new { Message = "Token not found" });

            if (!reg.Enabled)
                return BadRequest(new { Message = "Notifications are disabled" });

            int id = reg.Id;

            data.PushRegistrationId = id;

            _tests.Insert(data);
            _tests.SaveChanges();

            TestApplication testApp = new TestApplication(data);

            TestApplication existingApp = GlobalStore.RunningTests.GetOrAdd(id, testApp);

            if (existingApp != testApp)
                return BadRequest(new { Message = "Test is running" });

            Task.Run((Action)testApp.Run).ContinueWith((t) =>
            {
                GlobalStore.RunningTests.TryRemove(id, out testApp);
            });

            var ok = Ok();
            return ok;
        }

        // POST api/testpushnotifications/stop
        [HttpPost("stop/{token}")]
        public IActionResult Stop(string token)
        {
            PushRegistrationModel reg = _registrations.Get(token);

            if (reg == null)
                return BadRequest(new { Message = "Token not found" });

            int id = reg.Id;

            TestApplication testApp;

            if (!GlobalStore.RunningTests.TryGetValue(id, out testApp))
                return BadRequest(new { Message = "No running test found" });

            testApp.Stop = true;

            GlobalStore.RunningTests.TryRemove(id, out testApp);

            var ok = Ok();
            return ok;
        }

        // POST api/testpushnotifications/stoptimer
        [HttpPost("stoptimer")]
        public IActionResult StopTimer([FromBody]TestNotifactionContentModel data)
        {
            DateTime stopped = DateTime.UtcNow;

            if (data == null)
                return BadRequest(new { Message = "Data is null" });

            if (!ModelState.IsValid)
                return BadRequest(new { Message = ModelState.Values.First().Errors.First().ErrorMessage });

            //TODO: some kind of auth

            TimeSpan latancy = stopped.Subtract(data.Sent);
            data.Latancy = Convert.ToInt64(latancy.TotalMilliseconds);

            _notifications.Insert(data);

            try
            {
                _notifications.SaveChanges();
            }
            catch(Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                if(ex.InnerException is Microsoft.Data.Sqlite.SqliteException)
                    return BadRequest(new { Message = "TestId not found" });
                throw ex;
            }

            var json = Json(data);
            return json;
        }
    }
}
