using System;

namespace TestFirebaseNotificationsAPI.Lib
{
    public interface IBackOff
    {
        void Reset();

        bool NextBackOff(Exception ex, out TimeSpan delay);
    }
}
