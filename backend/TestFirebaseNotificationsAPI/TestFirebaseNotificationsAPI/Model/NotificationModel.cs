using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class NotificationModel : Model
    {
        // Targets

        public string To { get; set; }

        public IEnumerable<string> RegistrationIds { get; set; }

        public string Condition { get; set; }

        // Options

        public string CollapseKey { get; set; }

        public string Priority { get; set; }

        public bool ContentAvailable { get; set; }

        public bool MutableContent { get; set; }

        public int TimeToLive { get; set; }

        public string RestrictedPackageName { get; set; }

        public bool DryRun { get; set; }

        // Payload

        public object Data { get; set; }

        public NotificationContentModel Notification { get; set; }
    }
}
