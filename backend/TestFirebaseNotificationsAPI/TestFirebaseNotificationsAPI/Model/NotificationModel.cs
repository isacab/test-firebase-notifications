﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Model
{
    public class NotificationModel : Model
    {
        public string To { get; set; }
        public object Data { get; set; }
    }
}
