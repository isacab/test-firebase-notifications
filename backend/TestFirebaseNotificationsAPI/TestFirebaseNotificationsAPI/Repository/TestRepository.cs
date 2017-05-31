using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Repository
{
    public class TestRepository : Repository
    {
        public TestRepository(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public IEnumerable<TestModel> List(string token)
        {
            return _databaseContext.Tests
                        .Join(_databaseContext.PushRegistrations,
                            t => t.PushRegistrationId,
                            pr => pr.Id,
                            (t, pr) => new { Test = t, Token = pr.Token })
                        .Where(x => x.Token == token)
                        .Select(x => x.Test);
        }

        public TestModel Get(int id)
        {
            return _databaseContext.Tests.Find(id);
        }

        public void Insert(TestModel model)
        {
            model.Id = 0;
            model.UpdatedAt = default(DateTime);
            model.CreatedAt = DateTime.Now;

            _databaseContext.Add(model);
        }

        public void Update(TestModel model)
        {
            model.UpdatedAt = DateTime.Now;
            _databaseContext.Tests.Update(model);
        }

        public void Delete(TestModel model)
        {
            _databaseContext.Tests.Remove(model);
        }
    }
}
