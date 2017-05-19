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

        public static ConcurrentDictionary<string, Object> RunningTestLocks = new ConcurrentDictionary<string, Object>();
    }
}
