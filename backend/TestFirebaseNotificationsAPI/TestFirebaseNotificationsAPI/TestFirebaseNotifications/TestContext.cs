using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.TestFirebaseNotifications
{
    public class TestContext
    {
        public bool Stop { get; set; }

        public int IntervalCounter { get; set; }

        public TestModel Test { get; set; }

        public IList<NotificationContext> SentNotifications { get; set; }
    }
}
