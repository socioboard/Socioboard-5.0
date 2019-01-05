using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Domain.Socioboard.Interfaces.Services;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class YoutubeReportController : Controller
    {
        public YoutubeReportController(ILogger<UserController> logger, IEmailSender emailSender, IHostingEnvironment appEnv, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings)
        {
            _logger = logger;
            _emailSender = emailSender;
            _appEnv = appEnv;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);

        }
        private readonly ILogger _logger;
        private readonly IEmailSender _emailSender;
        private readonly IHostingEnvironment _appEnv;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns
        /// 

        [HttpGet("GetYtReports")]
        public IActionResult GetYtReports(string ChannelId, long Days)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.YoutubeReportsRepository.GetYoutubeReports(ChannelId, Days, _redisCache, _appSettings, dbr));

        }

        [HttpGet("GetYtBulkReports")]
        public IActionResult GetYtBulkReports(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.YoutubeReportsRepository.GetYoutubeBulkReports(groupId, _redisCache, _appSettings, dbr));

        }


        //for all channel simultaniously
        [HttpGet("GetYtChannelTableData")]
        public IActionResult GetYtChannelTableData(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.YoutubeReportsRepository.GetYtAllChaData(groupId, _redisCache, _appSettings, dbr));

        }

        [HttpGet("GetYtVideoTableData")]
        public IActionResult GetYtVideoTableData(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.YoutubeReportsRepository.GetYtAllVdoData(groupId, _redisCache, _appSettings, dbr));

        }


        //for single channel
        [HttpGet("GetYtCustomTableData")]
        public IActionResult GetYtCustomTableData(string channelId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.YoutubeReportsRepository.GetYtCustomTableData(channelId, _redisCache, _appSettings, dbr));

        }

        [HttpGet("GetYtTotalsubscriber")]
        public IActionResult GetYtTotalsubscriber(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.YouTube).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.TotalYoutubesubscriber> lstYtreport = new List<Domain.Socioboard.Models.TotalYoutubesubscriber>();
            lstYtreport = Repositories.YoutubeReportsRepository.GetYtTotalsubscriber(lstStr, _redisCache, _appSettings, dbr);
            return Ok(lstYtreport);

        }

    }
}
