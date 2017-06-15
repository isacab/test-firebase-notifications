using System;

namespace TestFirebaseNotificationsAPI.Model
{
    public interface IModel : ICloneable
    {
        string ToJson();
    }
}
