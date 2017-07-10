using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Lib;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Exceptions
{
    public class FcmMulticastException : FcmException
    {
        public FcmMulticastException()
        { }

        public FcmMulticastException(string message)
        : base(message)
        { }

        public FcmMulticastException(string message, Exception inner)
        : base(message, inner)
        { }

        public Dictionary<string, FcmResultModel> Failed { get; set; }
    }
}
