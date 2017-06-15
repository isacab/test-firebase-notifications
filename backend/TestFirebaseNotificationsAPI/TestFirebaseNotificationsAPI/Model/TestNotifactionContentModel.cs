using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TestFirebaseNotificationsAPI.Model
{
    public class TestNotifactionContentModel : NotificationContentModel
    {
        [JsonIgnore]
        public int Id { get; set; }

        [Required]
        public int SequenceNumber { get; set; }
        
        [Required]
        public DateTime Sent { get; set; }
        
        public long Latency { get; set; }
        
        public int NumRetries { get; set; }

        [Required]
        [ForeignKey("Tests")]
        public int TestId { get; set; }

        [JsonIgnore]
        public virtual TestModel Test { get; set; }
    }
}
