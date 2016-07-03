using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;
using System.IO;
using Serilog.Sinks.RollingFile;
using Domain.Socioboard.Interfaces.Services;
using Domain.Socioboard.Services;

namespace Api.Socioboard
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsEnvironment("Development"))
            {
                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();

            Log.Logger = new LoggerConfiguration()
         .MinimumLevel.Debug()
         .WriteTo.ColoredConsole()
         .WriteTo.RollingFile(Path.Combine(env.WebRootPath, "wwwroot/log/log-{Date}.txt"))
         .CreateLogger();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);
            services.Configure<Helper.AppSettings>(Configuration.GetSection("AppSettings"));
            services.AddMvc();
            services.AddCors();
            services.AddCors(options => options.AddPolicy("AllowAll", p => p.WithOrigins("http://localhost:6361", "http://localhost:9821")));
            services.AddTransient<IEmailSender, AuthMessageSender>();
            services.AddTransient<ISmsSender, AuthMessageSender>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseApplicationInsightsRequestTelemetry();

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseMvc();
            app.UseCors("AllowAll");
            //app.UseCors(policy =>
            //{
            //    policy.WithOrigins("http://localhost:6361", "http://localhost:9821");
            //    policy.AllowAnyHeader();
            //    policy.AllowAnyMethod();
            //});
            loggerFactory.AddSerilog();
        }
    }
}
