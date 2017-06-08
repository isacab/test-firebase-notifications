using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Repository;
using TestFirebaseNotificationsAPI.Services;
using TestFirebaseNotificationsAPI.TestFirebaseNotifications;

namespace TestFirebaseNotificationsAPI.TestFirebaseNotifications
{
    public class TestApplication
    {
        private readonly TestModel _test; // a copy of the TestModel passed in constructor
        private readonly DatabaseContext _databaseContext;
        private readonly PushNotificationService _pushService;
        private readonly PushRegistrationRepository _regService;

        public TestApplication(TestModel test)
        {
            this._test = new TestModel(test) ?? throw new ArgumentNullException("Test is null");
            this._pushService = new PushNotificationService();
            this._databaseContext = DatabaseContext.CreateDefault();
            this._regService = new PushRegistrationRepository(_databaseContext);
        }

        #region Properties

        // These properties are thread safe

        private bool _started;
        private readonly Object _startedLock = new Object();
        public bool Started
        {
            get
            {
                lock(_startedLock)
                {
                    return _started;
                }
            }
            private set
            {
                lock(_startedLock)
                {
                    _started = value;
                }
            }
        }

        private bool _stop;
        private readonly Object _stopLock = new Object();
        public bool Stop
        {
            get
            {
                lock (_stopLock)
                {
                    return _stop;
                }
            }
            set
            {
                lock (_stopLock)
                {
                    _stop = value;
                }
            }
        }

        #endregion

        public void Run()
        {
            if (Started)
                throw new InvalidOperationException("TestApplication has already been started.");

            Started = true;
            
            int seqNumber = 0;

            while(Continue(seqNumber))
            {
                PushRegistrationModel reg = _regService.Get(_test.PushRegistrationId);
                for (int i = 0; i < _test.NumNotificationsPerInterval; i++)
                {
                    seqNumber++;
                    NotificationModel notification = new NotificationModel()
                    {
                        To = reg.Token,
                        Data = new TestNotifactionContentModel()
                        {
                            Title = "Test firebase notifications",
                            Body = "Test body",
                            SequenceNumber = seqNumber,
                            Sent = DateTime.UtcNow,
                            TestId = _test.Id
                        }
                    };
                    object response = this._pushService.Send(notification);
                }

                Thread.Sleep(_test.Interval);
            }
        }

        public void StopTimer(TestNotifactionContentModel notificationContent)
        {
            DateTime received = DateTime.UtcNow;
            TimeSpan latancy = notificationContent.Sent.Subtract(received);
            notificationContent.Latancy = latancy.Milliseconds;
        }

        private bool Continue(int seqNumber)
        {
            return seqNumber < TotalNumNotificationsToSend() && !Stop;
        }

        private int TotalNumNotificationsToSend()
        {
            return _test.NumIntervals * _test.NumNotificationsPerInterval;
        }
    }
}
