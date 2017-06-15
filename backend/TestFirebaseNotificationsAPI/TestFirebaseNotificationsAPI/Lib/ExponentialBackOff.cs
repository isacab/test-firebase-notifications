using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Exceptions;

namespace TestFirebaseNotificationsAPI.Lib
{
    public class ExponentialBackOffBuilder
    {
        public int InitialInterval { get; set; } = 500; //milliseconds

        public double RandomizationFactor { get; set; } = 0.5;

        public double Multiplier { get; set; } = 1.5;

        public double MaxInterval { get; set; } = 3600; //milliseconds

        public int MaxElapsedTime { get; set; } = 3600 * 15; //milliseconds
    }

    public class ExponentialBackOff : IBackOff
    {
        private Stopwatch _stopWatch;

        public ExponentialBackOff(ExponentialBackOffBuilder builder = null)
        {
            if (builder == null)
                builder = new ExponentialBackOffBuilder();

            InitialInterval = builder.InitialInterval;
            RandomizationFactor = builder.RandomizationFactor;
            Multiplier = builder.Multiplier;
            MaxInterval = builder.MaxInterval;
            MaxElapsedTime = builder.MaxElapsedTime;

            _stopWatch = Stopwatch.StartNew();
        }
        
        public int InitialInterval { get; protected set; }
        
        public double RandomizationFactor { get; protected set; }
        
        public double Multiplier { get; protected set; }
        
        public double MaxInterval { get; protected set; }
        
        public int MaxElapsedTime { get; protected set; }

        public int RetryCount { get; private set; }

        protected double LastRetryInterval { get; set; }

        public bool NextBackOff(Exception lastException, out TimeSpan delay)
        {
            bool shouldRetry = true;
            double retryInterval = InitialInterval;
            long elapsedMillis = _stopWatch.ElapsedMilliseconds;

            if (elapsedMillis >= MaxElapsedTime)
            {
                delay = TimeSpan.Zero;
                return false;
            }

            if(lastException is FcmFailureException)
            {
                var fcmException = (FcmFailureException)lastException;
                var retryAfter = fcmException.RetryAfter;
                if(retryAfter != null && retryAfter.Delta.HasValue)
                {
                    double ra = retryAfter.Delta.Value.TotalMilliseconds;
                    retryInterval = ra + (ra * RandomizationFactor);
                    shouldRetry = retryInterval <= MaxInterval;
                }
            }

            if (!shouldRetry && RetryCount > 0)
            {
                retryInterval = Math.Min(LastRetryInterval * Multiplier, MaxInterval);
            }

            Random r = new Random();
            int min = (int)(10000 - RandomizationFactor * 10000);
            int max = (int)(10000 + RandomizationFactor * 10000);
            double rnd = (double)RandomGenerator.GetRandomNumber(min, max) / 10000;
            double randomizedInterval = retryInterval * rnd;

            delay = TimeSpan.FromMilliseconds(randomizedInterval);
            return true;
        }

        public void Reset()
        {
            RetryCount = 0;
            _stopWatch.Restart();
        }
    }
}
