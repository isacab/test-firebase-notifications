using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Services
{
    public class PushRegistrationService
    {
        private DatabaseContext _databaseContext;

        public PushRegistrationService(DatabaseContext databaseContext)
        {
            this._databaseContext = databaseContext;
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
            _databaseContext.Add(model);
        }

        public void Update(PushRegistrationModel model)
        {
            _databaseContext.PushRegistrations.Update(model);
        }

        public void Delete(string token)
        {
            PushRegistrationModel model = Get(token);
            _databaseContext.PushRegistrations.Remove(model);
        }

        public void Delete(int id)
        {
            PushRegistrationModel model = Get(id);
            _databaseContext.PushRegistrations.Remove(model);
        }

        public int SaveChanges()
        {
            return _databaseContext.SaveChanges();
        }
    }
}
