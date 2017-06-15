using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Lib;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Exceptions
{
    public class FcmFailureException : Exception
    {
        public FcmFailureException()
        { }

        public FcmFailureException(string message)
        : base(message)
        { }

        public FcmFailureException(string message, Exception inner)
        : base(message, inner)
        { }

        public NotificationModel Notification { get; set; }

        public FcmMulticastMessageResponseModel Response { get; set; }

        public RetryConditionHeaderValue RetryAfter { get; set; }
    }
}
