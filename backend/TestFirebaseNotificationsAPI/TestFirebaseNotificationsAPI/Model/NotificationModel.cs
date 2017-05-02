using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class NotificationModel
    {
        public string To { get; set; }
        public NotificationContentModel Notification { get; set; }
    }
}
