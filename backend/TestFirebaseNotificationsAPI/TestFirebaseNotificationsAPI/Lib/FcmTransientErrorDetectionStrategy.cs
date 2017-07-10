using Microsoft.Practices.EnterpriseLibrary.TransientFaultHandling;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Exceptions;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Lib
{
    public class FcmTransientErrorDetectionStrategy : ITransientErrorDetectionStrategy
    {
        public bool IsTransient(Exception ex)
        {
            FcmException fcmException = ex as FcmException;
            FcmMulticastException fcmMulticastException = ex as FcmMulticastException;

            if (fcmException == null)
                return false;

            // Has retry-after
            // Retry-after is not transient in this retry policy
            if (fcmException.RetryAfter != null && fcmException.RetryAfter.Delta.HasValue)
                return false;

            // Status code 5XX
            if ((int)fcmException.StatusCode >= 500 && (int)fcmException.StatusCode <= 599)
                return true;
            
            return fcmMulticastException != null
                && fcmMulticastException.Failed.Any(IsTransientError);
        }

        public static bool IsTransientError(KeyValuePair<string, FcmResultModel> arg)
        {
            return arg.Value.Error == "Unavailable";
        }
    }
}
