using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class TestNotifactionContentModel : NotificationContentModel
    {
        [Required]
        public int SequenceNumber { get; set; }

        [Required]
        public DateTime Sent { get; set; }
        
        public long Latancy { get; set; }
        
        public long AppToServerRTT { get; set; }
        
        public int NumRetries { get; set; }
    }
}
