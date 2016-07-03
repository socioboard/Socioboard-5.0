using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.Extensions.Logging;
using Socioboard.Services;
using Serilog;
using System.IO;
using Serilog.Sinks.RollingFile;

namespace Socioboard
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsDevelopment())
            {
                // For more details on using the user secret store see http://go.microsoft.com/fwlink/?LinkID=532709
                builder.AddUserSecrets();

                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
            Log.Logger = new LoggerConfiguration()
           .MinimumLevel.Debug()
           .WriteTo.ColoredConsole()
           .WriteTo.RollingFile(Path.Combine(env.ContentRootPath, "wwwroot/log/log-{Date}.txt"))
           .CreateLogger();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);



            services.Configure<Helpers.AppSettings>(Configuration.GetSection("AppSettings"));
            services.AddMvc();

            // services.AddCaching(); // Adds a default in-memory implementation of IDistributedCache
            services.AddSession();


            services.Configure<Microsoft.AspNetCore.Mvc.Razor.RazorViewEngineOptions>(options =>
            {
                options.ViewLocationExpanders.Add(new CustomViewLocationRazorViewEngine());
            });



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseApplicationInsightsRequestTelemetry();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseStaticFiles();

            // app.UseIdentity();

            // Add external authentication middleware below. To configure them please see http://go.microsoft.com/fwlink/?LinkID=532715

            app.UseSession();
            // To configure external authentication please see http://go.microsoft.com/fwlink/?LinkID=532715

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Index}/{action=Index}/{id?}");
            });

             loggerFactory.AddSerilog();
        }
    }
}
