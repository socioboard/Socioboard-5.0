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
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _appEnv = appEnv;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _appEnv;


        /// <summary>
        /// To provide the report on website traffic.
        /// </summary>
        /// <param name="profileId">Id of the user</param>
        /// <param name="daysCount">for preparing report till counted days</param>
        /// <response code="500">Internal Server Erro.r</response>
        /// <returns></returns>
        [HttpGet("GetGoogleAnalyticsReportData")]
        public IActionResult GetGoogleAnalyticsReportData(string profileId, int daysCount)
        {
            return Ok(Repositories.GoogleAnalyticsReportRepository.getGoogleAnalyticsReportData(profileId, daysCount, _redisCache, _appSettings));
        }
        [HttpGet("GetTwitterMentionReports")]
        public IActionResult GetTwitterMentionReports(string profileId, int daysCount)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.GoogleAnalyticsAccount> lstGAAcc = dbr.Find<Domain.Socioboard.Models.GoogleAnalyticsAccount>(t => t.GaProfileId.Equals(profileId)).ToList();
            if (lstGAAcc != null && lstGAAcc.Count() > 0)
            {
                Domain.Socioboard.Models.GoogleAnalyticsAccount objGoogleAnalyticsAccount = lstGAAcc.First();
                return Ok(Repositories.GoogleAnalyticsReportRepository.GetTwitterMentionReports(objGoogleAnalyticsAccount.WebsiteUrl, daysCount, _redisCache, _appSettings));
            }
            return Ok();

        }

        [HttpGet("GetArticlesAndBlogsReports")]
        public IActionResult GetArticlesAndBlogsReports(string profileId, int daysCount)
        {
            
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.GoogleAnalyticsAccount> lstGAAcc = dbr.Find<Domain.Socioboard.Models.GoogleAnalyticsAccount>(t => t.GaProfileId.Equals(profileId)).ToList();
            if (lstGAAcc != null && lstGAAcc.Count() > 0)
            {
                Domain.Socioboard.Models.GoogleAnalyticsAccount objGoogleAnalyticsAccount = lstGAAcc.First();
                return Ok(Repositories.GoogleAnalyticsReportRepository.GetArticlesAndBlogsReports(objGoogleAnalyticsAccount.WebsiteUrl, daysCount, _redisCache, _appSettings));
            }
            return Ok();
        }
    }

}
