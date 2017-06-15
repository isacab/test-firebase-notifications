using System;
using System.Security.Cryptography;

namespace TestFirebaseNotificationsAPI.Lib
{
    public static class RandomGenerator
    {
        public static int GetRandomNumber(int min, int max)
        {
            if (min > max)
                throw new ArgumentException();

            if (min == max)
                return min;

            var rnd = RandomNumberGenerator.Create();
            byte[] data = new byte[1];
            rnd.GetNonZeroBytes(data);
            int n = data[0] % (max - min + 1);
            return min + n;
        }
    }
}
