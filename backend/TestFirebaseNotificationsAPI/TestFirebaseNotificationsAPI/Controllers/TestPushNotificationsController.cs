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
using System.Configuration;
using Newtonsoft.Json.Linq;
using TestFirebaseNotificationsAPI.Lib;

namespace TestFirebaseNotificationsAPI.Controllers
{
    [Route("api/[controller]")]
    public class TestPushNotificationsController : Controller
    {
        private readonly FcmService _pushService;
        private readonly PushRegistrationRepository _registrations;
        private readonly TestRepository _tests;
        private readonly TestNotifactionContentRepository _notifications;

        public TestPushNotificationsController(
            FcmService pushNotificationService, 
            PushRegistrationRepository pushRegistrationRepository,
            TestRepository testRepository,
            TestNotifactionContentRepository testNotifactionContentRepository)
        {
            _pushService = pushNotificationService;
            _registrations = pushRegistrationRepository;
            _tests = testRepository;
            _notifications = testNotifactionContentRepository;
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

        // POST api/testpushnotifications/send
        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody]NotificationModel data)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { Message = ModelState.Values.First().Errors.First().ErrorMessage });

            if (data == null)
                return BadRequest(new { Message = "Data is null" });

            JsonResult json;

            if(data.IsTopicMessage())
            {
                var fcmResponse = await _pushService.SendToTopic(data);
                json = Json(fcmResponse);
            }
            else
            {
                var fcmResponse = await _pushService.SendToDevice(data);
                json = Json(fcmResponse);
            }
            
            return json;
        }

        // POST api/testpushnotifications/start
        [HttpPost("start/{token}")]
        public IActionResult Start([FromBody]TestModel data, string token)
        {
            try
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
                data.Running = true;
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

                var json = Json(data);
                return json;
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException.Message);
            }
        }

        // POST api/testpushnotifications/stop
        [HttpPost("stop/{testId}")]
        public IActionResult Stop(int testId)
        {
            TestModel test = _tests.Get(testId);

            if (test == null)
                return BadRequest(new { Message = "Test not found" });

            PushRegistrationModel reg = _registrations.Get(test.PushRegistrationId);

            if (reg == null)
                return BadRequest(new { Message = "PushRegistration not found" });

            TestApplication testApp;

            if(GlobalStore.RunningTests.TryGetValue(reg.Id, out testApp))
            {
                testApp.Stop = true;
                GlobalStore.RunningTests.TryRemove(reg.Id, out testApp);
            }

            test.Running = false;
            _tests.Update(test);
            _tests.SaveChanges();

            var json = Json(test);
            return json;
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

            if(!data.Obsolete)
            {
                TimeSpan latency = stopped.Subtract(data.Sent);
                data.Latency = Convert.ToInt64(latency.TotalMilliseconds);
            }

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
