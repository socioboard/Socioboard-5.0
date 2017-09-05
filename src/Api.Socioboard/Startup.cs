using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;
using Serilog;
using Domain.Socioboard.Interfaces.Services;
using Domain.Socioboard.Services;
using Swashbuckle.Swagger.Model;
using Microsoft.AspNetCore.Http.Features;

namespace Api.Socioboard
{
    public class Startup
    {
        private string pathToDoc;
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
            pathToDoc = env.WebRootPath + @"\Api.Socioboard.xml";
            Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Debug()
        .WriteTo.ColoredConsole()
        .WriteTo.RollingFile(Path.Combine(env.WebRootPath, "log/log-{Date}.txt"))
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
            services.AddCors(options => options.AddPolicy("AllowAll", p => p.WithOrigins("http://localhost:6361", "http://localhost:9821")));
            services.Configure<FormOptions>(x =>
            {
                x.ValueLengthLimit = int.MaxValue;
                x.MultipartBodyLengthLimit = int.MaxValue; // In case of multipart
            });
            services.AddTransient < IEmailSender, AuthMessageSender>();
            services.AddTransient < ISmsSender, AuthMessageSender>();


            services.AddSwaggerGen();
            services.ConfigureSwaggerGen(options =>
            {
                options.SingleApiVersion(new Info
                {
                    Version = "v1",
                    Title = "SOCIOBOARD 3.0 Api Doc",
                    Description = "This contain links of all api which is used in SOCIOBOARD project.for more info visit https://github.com/socioboard/Socioboard-Core-3.0",
                    TermsOfService = "None"
                });
                options.IncludeXmlComments(pathToDoc);
                options.DescribeAllEnumsAsStrings();
            });

            //services.AddScoped<ISearchProvider, SearchProvider>();
        }

        
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseApplicationInsightsRequestTelemetry();

            app.UseApplicationInsightsExceptionTelemetry();
            app.UseDeveloperExceptionPage();
            app.UseMvc();
            app.UseCors("AllowAll");
            app.UseSwagger();
            app.UseSwaggerUi();
            loggerFactory.AddSerilog();
        }
    }
}
