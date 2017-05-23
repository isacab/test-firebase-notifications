using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.TestFirebaseNotifications
{
    public struct StopTest
    {
        int TestID;
        bool Stop;

        public StopTest(int testId, bool stop)
        {
            TestID = testId;
            Stop = stop;
        }
    }
}
