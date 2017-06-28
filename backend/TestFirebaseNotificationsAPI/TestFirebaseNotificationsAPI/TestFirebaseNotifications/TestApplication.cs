using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Repository;
using TestFirebaseNotificationsAPI.Services;
using TestFirebaseNotificationsAPI.TestFirebaseNotifications;
using TestFirebaseNotificationsAPI.Lib;

namespace TestFirebaseNotificationsAPI.TestFirebaseNotifications
{
    public class TestApplication
    {
        private readonly TestModel _test; // a copy of the TestModel passed in constructor
        private readonly DatabaseContext _databaseContext;
        private readonly FcmService _pushService;
        private readonly SyncFcmService _syncPushService;
        private readonly PushRegistrationRepository _registrations;
        private readonly TestRepository _tests;
        private readonly int _initialDelay;

        public TestApplication(TestModel test, int initialDelay = 0)
        {
            _test = (TestModel)test.Clone() ?? throw new ArgumentNullException("Test is null");
            _initialDelay = initialDelay;
            _databaseContext = DatabaseContext.CreateDefault();
            _registrations = new PushRegistrationRepository(_databaseContext);
            _tests = new TestRepository(_databaseContext);
            string serverKey = ConfigurationManager.AppSettings["FCMServerKey"];
            _pushService = new FcmService(new FcmConfiguration(serverKey), _registrations);
            _syncPushService = new SyncFcmService(new FcmConfiguration(serverKey), _registrations);
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

            setRunning(true);

            Started = true;

            Thread.Sleep(_initialDelay);

            int seqNumber = 0;

            Stopwatch sw = Stopwatch.StartNew();

            while(Continue(seqNumber))
            {
                PushRegistrationModel reg = _registrations.Get(_test.PushRegistrationId);
                for (int i = 0; i < _test.NumNotificationsPerInterval; i++)
                {
                    seqNumber++;
                    NotificationModel notification = new NotificationModel()
                    {
                        To = reg.Token,
                        Data = new TestNotifactionContentModel()
                        {
                            SequenceNumber = seqNumber,
                            Sent = DateTime.UtcNow,
                            TestId = _test.Id
                        },
                        Notification = new NotificationContentModel()
                        {
                            Title = "Test firebase notifications",
                            Body = "Test body",
                        },
                        Priority = "high"
                    };
                    SendNotification(notification);
                }

                Thread.Sleep(_test.Interval);
            }

            long runTime = sw.ElapsedMilliseconds;
            Console.WriteLine("Run Time: {0}", runTime);

            setRunning(false);
        }

        private async void SendNotification(NotificationModel notification)
        {
            await _pushService.SendToDevice(notification);
            //_syncPushService.SendToDevice(notification);
        }

        private void setRunning(bool running)
        {
            _test.Running = running;
            _tests.Update(_test);
            _tests.SaveChanges();
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
