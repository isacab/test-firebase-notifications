using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using TestFirebaseNotificationsAPI;
using TestFirebaseNotificationsAPI.Controllers;
using TestFirebaseNotificationsAPI.Model;
using TestFirebaseNotificationsAPI.Services;
using Xunit;

namespace TestFirebaseNotificationsAPITests
{
    public class TestPushRegistrations
    {
        [Fact]
        public void Test1()
        {
            // In-memory database only exists while the connection is open
            var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();

            PushRegistrationModel registration = new PushRegistrationModel()
            {
                Token = "token",
                Enabled = true
            };

            try
            {
                var options = new DbContextOptionsBuilder<DatabaseContext>()
                    .UseSqlite(connection)
                    .Options;

                // Create the schema in the database
                using (var context = new DatabaseContext(options))
                {
                    context.Database.EnsureCreated();
                }

                // Run the test against one instance of the context
                using (var context = new DatabaseContext(options))
                {
                    var service = new PushRegistrationService(context);
                    service.Insert(registration);
                    service.SaveChanges();
                    Assert.NotEqual(0, registration.Id);
                }

                // Use a separate instance of the context to verify correct data was saved to database
                using (var context = new DatabaseContext(options))
                {
                    Assert.Equal(1, context.PushRegistrations.Count());
                    Assert.Equal("token", context.PushRegistrations.Single().Token);
                    Assert.True(context.PushRegistrations.Single().Enabled);
                }
            }
            finally
            {
                connection.Close();
            }
        }
    }
}
