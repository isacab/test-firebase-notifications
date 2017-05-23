namespace TestFirebaseNotificationsAPI.Model
{
    public class TestModel : Model
    {
        public TestModel()
        { }

        public TestModel(TestModel other)
        {
            Id = other.Id;
            Token = other.Token;
            Finished = other.Finished;
            NumNotificationsPerInterval = other.NumNotificationsPerInterval;
            NumIntervals = other.NumIntervals;
            Interval = other.Interval;
        }

        public int Id { get; set; }

        public string Token { get; set; }

        public bool Finished { get; set; }

        public int NumNotificationsPerInterval { get; set; }

        public int NumIntervals { get; set; }

        public int Interval { get; set; }
    }
}