using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Configuration;
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

        /**
         * Create a new instance of DatabaseContext with default options
         * */
        public static DatabaseContext CreateDefault()
        {
            string connectionString = ConfigurationManager.AppSettings["ConnectionString"];

            var options = new DbContextOptionsBuilder<DatabaseContext>()
                            .UseSqlite(connectionString)
                            .Options;

            var rv = new DatabaseContext(options);

            return rv;
        }
    }
}
