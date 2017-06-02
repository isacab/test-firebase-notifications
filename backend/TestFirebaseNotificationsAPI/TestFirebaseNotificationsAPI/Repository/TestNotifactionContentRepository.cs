using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI.Repository
{
    public class TestNotifactionContentRepository : Repository
    {
        public TestNotifactionContentRepository(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public IEnumerable<TestNotifactionContentModel> List(int testId)
        {
            return _databaseContext.Notifications
                        .Where(x => x.TestId == testId)
                        .ToList();
        }

        public void Insert(TestNotifactionContentModel model)
        {
            _databaseContext.Add(model);
        }

        public void Update(TestNotifactionContentModel model)
        {
            _databaseContext.Notifications.Update(model);
        }

        public void Delete(TestNotifactionContentModel model)
        {
            _databaseContext.Notifications.Remove(model);
        }
    }
}
