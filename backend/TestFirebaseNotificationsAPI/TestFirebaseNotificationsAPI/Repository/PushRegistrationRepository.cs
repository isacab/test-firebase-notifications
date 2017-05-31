using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Repository
{
    public class PushRegistrationRepository : Repository
    {
        public PushRegistrationRepository(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public PushRegistrationModel Get(string token)
        {
            return _databaseContext.PushRegistrations.FirstOrDefault(x => x.Token == token);
        }

        public PushRegistrationModel Get(int id)
        {
            return _databaseContext.PushRegistrations.Find(id);
        }

        public void Insert(PushRegistrationModel model)
        {
            model.Id = 0;
            model.UpdatedAt = default(DateTime);
            model.CreatedAt = DateTime.Now;

            _databaseContext.Add(model);
        }

        public void Update(PushRegistrationModel model)
        {
            model.UpdatedAt = DateTime.Now;
            _databaseContext.PushRegistrations.Update(model);
        }

        public void Delete(PushRegistrationModel model)
        {
            _databaseContext.PushRegistrations.Remove(model);
        }

        public void Delete(string token)
        {
            var models = _databaseContext.PushRegistrations.Where(x => x.Token == token);

            _databaseContext.PushRegistrations.RemoveRange(models);
        }

        /*private string GenerateDeviceId()
        {
            Guid g = Guid.NewGuid();
            string guidString = Convert.ToBase64String(g.ToByteArray());
            guidString = guidString.Replace("=", "");
            guidString = guidString.Replace("+", "");
            guidString = guidString.Replace("/", "");

            return guidString;
        }*/
    }
}
