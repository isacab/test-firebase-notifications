using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Helpers
{
    public static class RandomGenerator
    {
        public static int GetRandomNumber(int min, int max)
        {
            if (min > max)
                throw new ArgumentException();

            if (min == max)
                return min;

            System.Security.Cryptography.RandomNumberGenerator rnd = System.Security.Cryptography.RandomNumberGenerator.Create();
            byte[] data = new byte[1];
            rnd.GetNonZeroBytes(data);
            int n = data[0] % (max - min + 1);
            return min + n;
        }
    }
}
