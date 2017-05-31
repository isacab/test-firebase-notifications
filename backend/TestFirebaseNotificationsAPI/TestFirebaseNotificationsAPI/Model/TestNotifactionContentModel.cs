using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

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
        
        public double Latancy { get; set; }
        
        public double AppToServerRTT { get; set; }
        
        public int NumRetries { get; set; }

        [Required]
        [ForeignKey("Tests")]
        public int TestID { get; set; }
    }
}
