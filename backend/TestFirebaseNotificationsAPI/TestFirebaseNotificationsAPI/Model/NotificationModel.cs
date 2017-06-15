using System.Collections.Generic;

namespace TestFirebaseNotificationsAPI.Model
{
    public class NotificationModel : Model
    {
        // Targets

        public string To { get; set; }

        public ICollection<string> RegistrationIds { get; set; }

        public string Condition { get; set; }

        // Options

        public string CollapseKey { get; set; }

        public string Priority { get; set; }

        public bool ContentAvailable { get; set; }

        public bool MutableContent { get; set; }

        public int TimeToLive { get; set; }

        public string RestrictedPackageName { get; set; }

        public bool DryRun { get; set; }

        // Payload

        public Model Data { get; set; }

        public NotificationContentModel Notification { get; set; }

        // Helper methods

        public bool IsTopicMessage()
        {
            return To.StartsWith("/topics/");
        }

        public List<string> GetTargetTokens()
        {
            var receivers = new List<string>();

            if (To == null ^ RegistrationIds == null)
            {
                if (To != null)
                    receivers.Add(To);
                else
                    receivers.AddRange(RegistrationIds);
            }

            return receivers;
        }

        public override object Clone()
        {
            // Copy data
            NotificationModel clone = (NotificationModel)base.Clone();
            if (RegistrationIds != null)
                clone.RegistrationIds = new List<string>(RegistrationIds);
            if (Data != null)
                clone.Data = (Model)Data.Clone();
            if (Notification != null)
                clone.Notification = (NotificationContentModel)Notification.Clone();

            return clone;
        }
    }
}
