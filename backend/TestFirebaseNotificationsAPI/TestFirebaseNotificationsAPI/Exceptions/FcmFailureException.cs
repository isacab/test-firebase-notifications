using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
