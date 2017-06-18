using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace TestFirebaseNotificationsAPI.Model
{
    /**
     * Base class for all models
     */
    public class Model : IModel
    {
        /**
         * Create a shallow copy of the Model 
         */
        public virtual object Clone()
        {
            return MemberwiseClone();
        }

        public string ToJson()
        {
            JsonSerializerSettings serializerSettings = new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore
            };
            string json = JsonConvert.SerializeObject(this, serializerSettings);

            return json;
        }
    }
}
