using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class NotificationModel : Model
    {
        [Required]
        public string To { get; set; }

        [Required]
        public object Data { get; set; }
    }
}
