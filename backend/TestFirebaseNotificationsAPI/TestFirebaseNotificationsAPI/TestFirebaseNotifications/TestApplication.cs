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
using Serilog;
using Microsoft.Practices.EnterpriseLibrary.TransientFaultHandling;

namespace TestFirebaseNotificationsAPI.TestFirebaseNotifications
{
    public class TestApplication
    {
        private readonly TestModel _test; // a copy of the TestModel passed in constructor
        private readonly PushRegistrationRepository _registrations;
        private readonly FcmService _fcmService;
        private readonly TestRepository _tests;
        private readonly int _initialDelay;

        public TestApplication(TestModel test, int initialDelay = 0)
        {
            _test = (TestModel)test.Clone() ?? throw new ArgumentNullException("Test is null");
            _initialDelay = initialDelay;
            var databaseContext = DatabaseContext.CreateDefault();
            _registrations = new PushRegistrationRepository(databaseContext);
            _tests = new TestRepository(databaseContext);

            // Init fcm service
            string serverKey = ConfigurationManager.AppSettings["FCMServerKey"];
            var configuration = new FcmConfiguration(serverKey);
            var fcmApiService = new FcmApiService(configuration);
            databaseContext = DatabaseContext.CreateDefault();
            var regRepository = new PushRegistrationRepository(databaseContext);
            var retryStrategy = RetryStrategy.NoRetry;
            ILogger logger = new LoggerConfiguration()
                 .WriteTo.RollingFile("Logs/fcmservice-{Date}.txt")
                 .CreateLogger();
            _fcmService = new FcmService(fcmApiService, regRepository, logger, retryStrategy);
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

        public async void Run()
        {
            if (Started)
                throw new InvalidOperationException("TestApplication has already been started.");

            SetRunning(true);

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
                            Sent = Helpers.EpochTime(),
                            TestId = _test.Id
                        },
                        Notification = new NotificationContentModel()
                        {
                            Title = "Test firebase notifications",
                            Body = "Test body"
                        },
                        Priority = "high"
                    };
                    await SendNotification(notification);
                    Thread.Sleep(10);
                }

                Thread.Sleep(_test.Interval);
            }

            long runTime = sw.ElapsedMilliseconds;
            Console.WriteLine("Run Time: {0}", runTime);

            SetRunning(false);
        }

        private async Task SendNotification(NotificationModel notification)
        {
            try
            {
                await _fcmService.Send(notification);
                //_syncPushService.SendToDevice(notification);
            } catch (Exception ex)
            {
            }
        }

        private void SetRunning(bool running)
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
