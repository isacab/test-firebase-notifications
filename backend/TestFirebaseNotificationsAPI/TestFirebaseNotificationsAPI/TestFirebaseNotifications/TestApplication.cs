using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Services;
using TestFirebaseNotificationsAPI.TestFirebaseNotifications;

namespace TestFirebaseNotificationsAPI.TestFirebaseNotifications
{
    public class TestApplication
    {
        private readonly TestContext _context;
        private readonly PushNotificationService _pushService;
        private readonly PushRegistrationService _regService;

        private readonly Object _testContextLock = new Object();
        private readonly ConcurrentDictionary<int, Object> _sentNotificationLocks = new ConcurrentDictionary<int, Object>(); // sequence number as key

        public TestApplication(TestModel test, PushNotificationService pushService, PushRegistrationService regService)
        {
            this._context = new TestContext()
            {
                SentNotifications = new List<NotificationContext>(),
                Test = new TestModel(test)
            } ?? throw new ArgumentNullException("Test is null");
            this._pushService = pushService ?? throw new ArgumentNullException("PushService is null");
            this._regService = regService ?? throw new ArgumentNullException("RegService is null");
        }

        public void Run()
        {
            bool running;
            Object tcLock;
            PushRegistrationModel reg = this._regService.Get(regId);

            if (reg == null)
                throw new InvalidOperationException("Push registration does not exist");

            tcLock = GlobalStore.RunningTestLocks.GetOrAdd(this._context, new Object());

            lock(tcLock)
            {
                running = !Finished(_context);
            }

            while(running)
            {
                int interval;

                lock (tcLock)
                {
                    TestModel test = _context.Test;
                    for (int i = 0; i < test.NumNotificationsPerInterval; i++)
                    {
                        int seqNumber = _context.SentNotifications.Count + 1;
                        DateTime sent = DateTime.Now;
                        NotificationModel notification = new NotificationModel()
                        {
                            To = test.Token,
                            Data = new TestNotifactionContentModel()
                            {
                                Title = "Test firebase notifications",
                                Body = "Test body",
                                Sent = sent,
                                SequenceNumber = seqNumber,
                            }
                        };

                        Stopwatch stopWatch = new Stopwatch();
                        NotificationContext notificationContext = new NotificationContext()
                        {
                            Notification = notification,
                            StopWatch = stopWatch
                        };
                        _context.SentNotifications.Add(notificationContext);
                        GlobalStore.SentNotificationLocks.GetOrAdd(notificationContext, new Object());
                        stopWatch.Start();
                        string response = this._pushService.Send(notification);
                    }
                    interval = test.Interval;
                } 

                Thread.Sleep(interval);

                lock (tcLock)
                {
                    running = !Finished(_context);
                }
            }
        }

        public void stop()
        {
            // TODO
            // Stop application from running
        }

        public void stopTimer(int sequenceNumber)
        {
            var nLock = this._sentNotificationLocks.GetOrAdd(sequenceNumber, new Object());

            lock(nLock)
            {
                // TODO
                // Get notification context
                // Stop timer
                // Set latancy on notification
                // Set response
            }

            //return response
        }

        private bool Finished(TestContext context)
        {
            return context.Stop || context.SentNotifications.Count >= CountTotalNumNotificationsToSend(context.Test);
        }

        private int CountTotalNumNotificationsToSend(TestModel test)
        {
            return test.NumIntervals * test.NumNotificationsPerInterval;
        }
    }
}
