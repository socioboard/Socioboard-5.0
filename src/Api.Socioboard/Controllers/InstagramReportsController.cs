using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class InstagramReportsController : Controller
    {
        public InstagramReportsController(ILogger<InstagramReportsController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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

        [HttpGet("GetInstagramReportData")]
        public IActionResult GetInstagramReportData(string profileId, int daysCount)
        {
            return Ok(Repositories.InstagramReportsRepository.getInstagramReportData(profileId, daysCount, _redisCache, _appSettings));
        }
        [HttpGet("GetInstagramData")]
        public IActionResult GetInstagramData(string profileId)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger,_appEnv);
            return Ok(Repositories.InstagramRepository.getInstagramAccount(profileId,_redisCache,dbr));
        }
    }
}
