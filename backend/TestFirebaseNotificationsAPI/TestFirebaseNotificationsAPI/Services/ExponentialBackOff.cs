using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Helpers;

namespace TestFirebaseNotificationsAPI.Services
{
    public class ExponentialBackOffBuilder
    {
        public int InitialInterval { get; set; } = 500; //milliseconds

        public double RandomizationFactor { get; set; } = 0.5;

        public double Multiplier { get; set; } = 1.5;

        public double MaxInterval { get; set; } = 3600; //milliseconds

        public int MaxElapsedTime { get; set; } = 3600 * 15; //milliseconds
    }

    public class ExponentialBackOff
    {
        public ExponentialBackOff(ExponentialBackOffBuilder builder = null)
        {
            if (builder == null)
                builder = new ExponentialBackOffBuilder();

            this._initialInterval = builder.InitialInterval;
            this._randomizationFactor = builder.RandomizationFactor;
            this._multiplier = builder.Multiplier;
            this._maxInterval = builder.MaxInterval;
            this._maxElapsedTime = builder.MaxElapsedTime;
        }

        private readonly int _initialInterval;
        public int InitialInterval
        {
            get { return this._initialInterval; }
        }

        private readonly double _randomizationFactor;
        public double RandomizationFactor
        {
            get { return this._randomizationFactor; }
        }

        private readonly double _multiplier;
        public double Multiplier
        {
            get { return this._multiplier; }
        }

        private readonly double _maxInterval;
        public double MaxInterval
        {
            get { return this._maxInterval; }
        }

        private readonly int _maxElapsedTime;
        public int MaxElapsedTime
        {
            get { return this._maxElapsedTime; }
        }

        private TimeSpan CalcNextBackoff(int retryAttempt)
        {
            double retryInterval = InitialInterval * Math.Pow(Multiplier, retryAttempt);
            int min = (int)(retryInterval - (retryInterval * RandomizationFactor) * 1000);
            int max = (int)(retryInterval + (retryInterval * RandomizationFactor) * 1000);
            double randomizedInterval = (double)RandomGenerator.GetRandomNumber(min, max) / 1000;
            TimeSpan backoff = TimeSpan.FromSeconds(randomizedInterval);
            return backoff;
        }
    }
}
