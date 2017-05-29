using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class NotificationContentModel : Model
    {
        public string Title { get; set; }
        
        public string Body { get; set; }
    }
}
