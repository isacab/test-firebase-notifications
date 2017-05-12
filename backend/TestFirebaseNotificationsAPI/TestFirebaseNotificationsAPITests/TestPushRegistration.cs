using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using TestFirebaseNotificationsAPI;
using TestFirebaseNotificationsAPI.Controllers;
using Xunit;

namespace TestFirebaseNotificationsAPITests
{
    public class TestPushRegistrations
    {
        private DatabaseContext _context;
        private PushRegistrionsController _controller;

        private SqliteConnection _connection;
        private DbContextOptions _options;

        public TestPushRegistrations()
        {
            // In-memory database only exists while the connection is open
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();

            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseSqlite(connection)
                .Options;

            // Create the schema in the database
            using (var context = new DatabaseContext(options))
            {
                context.Database.EnsureCreated();
            }
        }

        private void 

        [Fact]
        public void Test1()
        {
            // Initialize DatabaseContext in memory
            var optionsBuilder = new DbContextOptionsBuilder();
            _context = new DatabaseContext(optionsBuilder.Options);

            // Seed data
            _context.People.Add(new Person()
            {
                FirstName = "John",
                LastName = "Doe"
            });
            _context.People.Add(new Person()
            {
                FirstName = "Sally",
                LastName = "Doe"
            });
            _context.SaveChanges();

            // Create test subject
            _controller = new HomeController(_context);
        }
    }
}
