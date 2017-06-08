using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class FcmTopicResponseModel
    {
        public long message_id { get; set; }

        public string error { get; set; }
    }
}
