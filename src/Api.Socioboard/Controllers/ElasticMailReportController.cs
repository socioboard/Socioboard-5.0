using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class ElasticMailReportController : Controller
    {
        public ElasticMailReportController(ILogger<ElasticMailReportController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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
        [HttpGet("getElasticMailSentReportData")]
        public IActionResult getElasticMailSentReportData(int daysCount)
        {
            return Ok(Repositories.ElasticMailReportRepository.getElasticMailSentReportData(daysCount, _redisCache, _appSettings));
        }
        [HttpGet("getElasticMailOpenedReportData")]
        public IActionResult getElasticMailOpenedReportData(int daysCount)
        {
            return Ok(Repositories.ElasticMailReportRepository.getElasticMailOpenedReportData(daysCount, _redisCache, _appSettings));
        }
        [HttpGet("getElasticMailClickedReportData")]
        public IActionResult getElasticMailClickedReportData(int daysCount)
        {
            return Ok(Repositories.ElasticMailReportRepository.getElasticMailClickedReportData(daysCount, _redisCache, _appSettings));
        }
        [HttpGet("getElasticMailBouncedReportData")]
        public IActionResult getElasticMailBouncedReportData(int daysCount)
        {
            return Ok(Repositories.ElasticMailReportRepository.getElasticMailBouncedReportData(daysCount, _redisCache, _appSettings));
        }
        [HttpGet("getElasticMailUnsubscribedReportData")]
        public IActionResult getElasticMailUnsubscribedReportData(int daysCount)
        {
            return Ok(Repositories.ElasticMailReportRepository.getElasticMailUnsubscribedReportData(daysCount, _redisCache, _appSettings));
        }
        [HttpGet("getElasticMailAbuseReportReportData")]
        public IActionResult getElasticMailAbuseReportReportData(int daysCount)
        {
            return Ok(Repositories.ElasticMailReportRepository.getElasticMailAbuseReportReportData(daysCount, _redisCache, _appSettings));
        }

        #region Custom Reports Start

        [HttpGet("getCustomElasticMailSentReportData")]
        public IActionResult getCustomElasticMailSentReportData(DateTime startdate, DateTime enddate)
        {
            return Ok(Repositories.ElasticMailReportRepository.getCustomElasticMailSentReportData(startdate, enddate, _redisCache, _appSettings));
        }
        [HttpGet("getCustomElasticMailOpenedReportData")]
        public IActionResult getCustomElasticMailOpenedReportData(DateTime startdate, DateTime enddate)
        {
            return Ok(Repositories.ElasticMailReportRepository.getCustomElasticMailOpenedReportData(startdate, enddate, _redisCache, _appSettings));
        }
        [HttpGet("getCustomElasticMailClickedReportData")]
        public IActionResult getCustomElasticMailClickedReportData(DateTime startdate, DateTime enddate)
        {
            return Ok(Repositories.ElasticMailReportRepository.getCustomElasticMailClickedReportData(startdate, enddate, _redisCache, _appSettings));
        }
        [HttpGet("getCustomElasticMailBouncedReportData")]
        public IActionResult getCustomElasticMailBouncedReportData(DateTime startdate, DateTime enddate)
        {
            return Ok(Repositories.ElasticMailReportRepository.getCustomElasticMailBouncedReportData(startdate, enddate, _redisCache, _appSettings));
        }
        [HttpGet("getCustomElasticMailUnsubscribedReportData")]
        public IActionResult getCustomElasticMailUnsubscribedReportData(DateTime startdate, DateTime enddate)
        {
            return Ok(Repositories.ElasticMailReportRepository.getCustomElasticMailUnsubscribedReportData(startdate, enddate, _redisCache, _appSettings));
        }
        [HttpGet("getCustomElasticMailAbuseReportReportData")]
        public IActionResult getCustomElasticMailAbuseReportReportData(DateTime startdate, DateTime enddate)
        {
            return Ok(Repositories.ElasticMailReportRepository.getCustomElasticMailAbuseReportReportData(startdate, enddate, _redisCache, _appSettings));
        }
        #endregion
    }
}
