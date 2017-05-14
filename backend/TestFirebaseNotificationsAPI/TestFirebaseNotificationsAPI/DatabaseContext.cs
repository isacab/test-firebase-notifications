using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestFirebaseNotificationsAPI.Model;

namespace TestFirebaseNotificationsAPI
{
    public class DatabaseContext : DbContext
    {
        public DbSet<PushRegistrationModel> PushRegistrations { get; set; }

        public DatabaseContext(DbContextOptions<DatabaseContext> options)
            : base(options)
        { }
    }
}
