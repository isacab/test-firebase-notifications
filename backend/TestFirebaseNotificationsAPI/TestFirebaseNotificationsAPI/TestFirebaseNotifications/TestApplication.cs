using System;
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
        public TestApplication(TestContext context, PushNotificationService pushService)
        {
            this._context = context ?? throw new ArgumentNullException("Context is null");
            this._pushService = pushService ?? throw new ArgumentNullException("PushService is null");
        }

        private readonly TestContext _context;
        private readonly PushNotificationService _pushService;

        public TestContext Context
        {
            get { return _context; }
        }

        public void Run()
        {
            bool running = !Finished(Context);

            while(running)
            {
                TestModel test = Context.Test;
                for(int i = 0; i < test.NumNotificationsPerInterval; i++)
                {
                    int seqNumber = Context.SentNotifications.Count + 1;
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
                    Context.SentNotifications.Add(notificationContext);
                    stopWatch.Start();
                    string response = this._pushService.Send(notification);
                }

                Thread.Sleep(test.Interval);

                running = !Finished(Context);
            }
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
