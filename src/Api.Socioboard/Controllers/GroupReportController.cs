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
    public class GroupReportController : Controller
    {
        public GroupReportController(ILogger<GroupReportController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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


        /// <summary>
        /// To provide the report on group profiles
        /// </summary>
        /// <param name="groupId"></param>
        /// <param name="daysCount"></param>
        /// <returns></returns>
        [HttpGet("getgroupReportData")]
        public IActionResult getgroupReportData(long groupId,int daysCount)
        {
            return Ok(Repositories.GroupReportRepository.getgroupReportData(groupId, daysCount, _redisCache,_appSettings));
        }

        [HttpGet("getfacebookpageGroupReportData")]
        public IActionResult getfacebookpageGroupReportData(long groupId, int daysCount)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.GroupReportRepository.getfacebookpageGroupReportData(groupId, daysCount, _redisCache,_appSettings,dbr));
        }

        [HttpGet("getTwitterGroupReportData")]
        public IActionResult getTwitterGroupReportData(long groupId, int daysCount)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.GroupReportRepository.GetTwitterMessageReports(groupId, daysCount, _redisCache, _appSettings, dbr));
        }
    }
}
