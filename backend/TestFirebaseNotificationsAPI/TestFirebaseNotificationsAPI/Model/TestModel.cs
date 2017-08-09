using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TestFirebaseNotificationsAPI.Model
{
    public class TestModel : Model
    {
        public int Id { get; set; }

        public bool Running { get; set; }

        [Required]
        [MaxLength(10000)]
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

        [Required]
        [ForeignKey("PushRegistrations")]
        public int PushRegistrationId { get; set; }

        public virtual PushRegistrationModel PushRegistration { get; set; }

        public virtual ICollection<TestNotifactionContentModel> Notifications { get; set; }
    }
}