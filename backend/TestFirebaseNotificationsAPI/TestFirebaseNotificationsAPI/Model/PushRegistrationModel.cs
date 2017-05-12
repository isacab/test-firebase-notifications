using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class PushRegistrationModel : Model
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public bool Enabled { get; set; }
    }
}
