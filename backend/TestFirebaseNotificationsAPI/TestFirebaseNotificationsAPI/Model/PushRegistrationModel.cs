using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class PushRegistrationModel : Model
    {
        [JsonIgnore]
        public int Id { get; set; }

        [Required]
        public string Token { get; set; }
        
        public bool Enabled { get; set; }

        [JsonIgnore]
        public DateTime UpdatedAt { get; set; }

        [JsonIgnore]
        public DateTime CreatedAt { get; set; }
    }
}
