using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace TestFirebaseNotificationsAPI.Controllers
{
    [Route("api/[controller]")]
    public class TestController : Controller
    {
        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
            //Start test
        }
    }
}
