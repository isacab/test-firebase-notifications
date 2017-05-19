using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class TestNotifactionContentModel : NotificationContentModel
    {
        public int SequenceNumber { get; set; }
        public DateTime Sent { get; set; }
        public long Latancy { get; set; }
        public long AppToServerRTT { get; set; }
        public int NumRetries { get; set; }
    }
}
