using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net;

namespace TestFirebaseNotificationsAPI.Model
{
    public class FcmMulticastMessageResponseModel : Model
    {
        [Required]
        public long MulticastId { get; set; }

        [Required]
        public int Success { get; set; }

        [Required]
        public int Failure { get; set; }

        [Required]
        public int CanonicalIds { get; set; }

        [Required]
        public IEnumerable<FcmResultModel> Results { get; set; }

        [JsonIgnore]
        public HttpStatusCode Status { get; set; }
    }
}
