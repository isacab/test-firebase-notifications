using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class FcmResponseModel
    {
        [Required]
        public long multicast_id { get; set; }

        [Required]
        public int success { get; set; }

        [Required]
        public int failure { get; set; }

        [Required]
        public long canonical_ids { get; set; }

        [Required]
        public IEnumerable<FcmResultModel> results { get; set; }
    }
}
