using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.TestFirebaseNotifications;

namespace TestFirebaseNotificationsAPI
{
    public static class GlobalStore
    {
        public static ConcurrentDictionary<string, TestContext> RunningTests = new ConcurrentDictionary<string, TestContext>();

        public static ConcurrentDictionary<TestContext, Object> RunningTestLocks = new ConcurrentDictionary<TestContext, Object>();

        public static ConcurrentDictionary<NotificationContext, Object> SentNotificationLocks = new ConcurrentDictionary<NotificationContext, Object>();

        public static ConcurrentDictionary<TestApplication, Object> TestApplicationLocks = new ConcurrentDictionary<TestApplication, Object>();
    }
}
