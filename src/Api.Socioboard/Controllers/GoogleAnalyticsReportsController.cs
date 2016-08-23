using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
   
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAll")]
        [Route("api/[controller]")]
        public class GoogleAnalyticsReportController : Controller
        {
            public GoogleAnalyticsReportController(ILogger<GoogleAnalyticsReportController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
            {
                _logger = logger;
                _appSettings = settings.Value;
                _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
                _appEnv = appEnv;
            }
            private readonly ILogger _logger;
            private Helper.AppSettings _appSettings;
            private Helper.Cache _redisCache;
            private readonly IHostingEnvironment _appEnv;

            [HttpGet("GetGoogleAnalyticsReportData")]
            public IActionResult GetGoogleAnalyticsReportData(string profileId, int daysCount)
            {
                return Ok(Repositories.GoogleAnalyticsReportRepository.getGoogleAnalyticsReportData(profileId,daysCount,_redisCache,_appSettings));
            }
            [HttpGet("GetTwitterMentionReports")]
            public IActionResult GetTwitterMentionReports(string hostName, int daysCount)
            {
                return Ok(Repositories.GoogleAnalyticsReportRepository.GetTwitterMentionReports(hostName, daysCount, _redisCache, _appSettings));
            }

            [HttpGet("GetArticlesAndBlogsReports")]
            public IActionResult GetArticlesAndBlogsReports(string hostName, int daysCount)
            {
                return Ok(Repositories.GoogleAnalyticsReportRepository.GetArticlesAndBlogsReports(hostName, daysCount, _redisCache, _appSettings));
            }
        }
    
}
