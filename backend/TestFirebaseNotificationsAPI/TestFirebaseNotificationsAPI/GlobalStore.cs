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
        public static ConcurrentDictionary<int, TestApplication> RunningTests = new ConcurrentDictionary<int, TestApplication>();

        public static ConcurrentDictionary<TestApplication, Object> RunningTestLocks = new ConcurrentDictionary<TestApplication, Object>();
    }
}
