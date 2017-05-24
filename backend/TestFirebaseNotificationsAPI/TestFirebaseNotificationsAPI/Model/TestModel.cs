using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TestFirebaseNotificationsAPI.Model
{
    public class TestModel : Model
    {
        public TestModel()
        { }

        public TestModel(TestModel other)
        {
            Id = other.Id;
            Finished = other.Finished;
            NumNotificationsPerInterval = other.NumNotificationsPerInterval;
            NumIntervals = other.NumIntervals;
            Interval = other.Interval;
            PushRegistrationId = other.PushRegistrationId;
        }

        public int Id { get; set; }

        public bool Finished { get; set; }

        [Required]
        public int NumNotificationsPerInterval { get; set; }

        [Required]
        public int NumIntervals { get; set; }

        [Required]
        public int Interval { get; set; }

        [JsonIgnore]
        [ForeignKey("PushRegistration")]
        public int PushRegistrationId { get; set; }
    }
}