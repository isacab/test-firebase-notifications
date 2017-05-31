using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TestFirebaseNotificationsAPI.Repository
{
    public abstract class Repository
    {
        protected DatabaseContext _databaseContext;

        protected Repository(DatabaseContext databaseContext)
        {
            this._databaseContext = databaseContext;
        }

        public int SaveChanges()
        {
            return _databaseContext.SaveChanges();
        }
    }
}
