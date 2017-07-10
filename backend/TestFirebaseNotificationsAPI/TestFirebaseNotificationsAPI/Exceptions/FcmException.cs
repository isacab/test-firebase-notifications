using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Exceptions
{
    public class FcmException : Exception
    {
        public FcmException()
        { }

        public FcmException(string message)
        : base(message)
        { }

        public FcmException(string message, Exception inner)
        : base(message, inner)
        { }

        public NotificationModel Notification { get; set; }

        public HttpStatusCode StatusCode { get; set; }

        public RetryConditionHeaderValue RetryAfter { get; set; }
    }

    public enum FcmErrorCode
    {
        Unknown,
        MissingRegistration,
        InvalidRegistration,
        NotRegistered,
        InvalidPackageName,
        InvalidParameters,
        MessageTooBig,
        InvalidDataKey,
        InvalidTtl,
        Unavailable,
        InternalServerError,
        DeviceMessageRateExceeded,
        TopicsMessageRateExceeded,
        InvalidApnsCredential
    }
}
