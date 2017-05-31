using Newtonsoft.Json;
using System;
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
            Name = other.Name;
            NumNotificationsPerInterval = other.NumNotificationsPerInterval;
            NumIntervals = other.NumIntervals;
            Interval = other.Interval;
            PushRegistrationId = other.PushRegistrationId;
            UpdatedAt = other.UpdatedAt;
            CreatedAt = other.CreatedAt;
        }

        public int Id { get; set; }

        public bool Finished { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [Range(1, 1024)]
        public int NumNotificationsPerInterval { get; set; }

        [Required]
        [Range(1, 1024)]
        public int NumIntervals { get; set; }

        [Required]
        [Range(0, 3600000)]
        public int Interval { get; set; }

        [JsonIgnore]
        public DateTime UpdatedAt { get; set; }
        
        public DateTime CreatedAt { get; set; }

        [JsonIgnore]
        [ForeignKey("PushRegistrations")]
        public int PushRegistrationId { get; set; }
    }
}