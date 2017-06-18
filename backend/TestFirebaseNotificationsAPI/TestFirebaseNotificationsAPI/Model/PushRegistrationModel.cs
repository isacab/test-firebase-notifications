using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

namespace TestFirebaseNotificationsAPI.Model
{
    public class PushRegistrationModel : Model
    {
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
