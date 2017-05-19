namespace TestFirebaseNotificationsAPI.Model
{
    public class TestModel : Model
    {
        public int Id { get; set; }

        public string Token { get; set; }

        public bool Finished { get; set; }

        public int NumNotificationsPerInterval { get; set; }

        public int NumIntervals { get; set; }

        public int Interval { get; set; }
    }
}