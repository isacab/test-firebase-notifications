﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TestFirebaseNotificationsAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using System.Configuration;

namespace TestFirebaseNotificationsAPI
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();

            // Create the schema in the database
            using (var context = DatabaseContext.CreateDefault())
            {
                context.Database.EnsureCreated();
            }
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            string connectionString = ConfigurationManager.AppSettings["ConnectionString"];

            // Add framework services.
            services.AddCors();
            services.AddMvc();
            services.AddEntityFrameworkSqlite()
                    .AddDbContext<DatabaseContext>(options => options.UseSqlite(connectionString));
            services.AddScoped<PushNotificationService>();
            services.AddScoped<PushRegistrationService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseCors(builder =>
                builder.AllowAnyMethod().AllowAnyHeader().WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:21378"
                ));

            app.UseMvc();
        }
    }
}
