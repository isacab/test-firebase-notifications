using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TestFirebaseNotificationsAPI.Model
{
    public class TestNotifactionContentModel : Model
    {
        public int Id { get; set; }
        
        [Required]
        public int SequenceNumber { get; set; }
        
        [Required]
        public long Sent { get; set; }
        
        public long Received { get; set; }

        public long clientToServerRTT { get; set; }

        public bool Obsolete { get; set; }

        [Required]
        [ForeignKey("Tests")]
        public int TestId { get; set; }

        [JsonIgnore]
        public virtual TestModel Test { get; set; }
    }
}
