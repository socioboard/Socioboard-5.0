using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;

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


        /// <summary>
        /// To provide the report on instagaram profile
        /// </summary>
        /// <param name="profileId">profile id of user</param>
        /// <param name="daysCount">for preparing instagram report till counted days</param>
        /// <returns></returns>
        [HttpGet("GetInstagramReportData")]
        public IActionResult GetInstagramReportData(string profileId, int daysCount)
        {
            return Ok(Repositories.InstagramReportsRepository.getInstagramReportData(profileId, daysCount, _redisCache, _appSettings));
        }

        [HttpGet("GetInstagramProfilesData")]
        public IActionResult GetInstagramProfilesData(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = new List<Domain.Socioboard.Models.Instagramaccounts>();
            List<Domain.Socioboard.Models.Mongo.InstagramDailyReport> lstInstreport = new List<Domain.Socioboard.Models.Mongo.InstagramDailyReport>();
            lstInstreport = Repositories.InstagramReportsRepository.getInstagramReport(lstStr,90, _redisCache, _appSettings);
            return Ok(lstInstreport);
        }

        [HttpGet("GetInstafollowfollowingGraph")]
        public IActionResult GetInstafollowfollowingGraph(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = new List<Domain.Socioboard.Models.Instagramaccounts>();
            List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing> lstInstreport = new List<Domain.Socioboard.Models.Mongo.InstaFollowerFollowing>();
            lstInstreport = Repositories.InstagramReportsRepository.getInstafollofollowingReport(lstStr, 90, _redisCache, _appSettings);
            return Ok(lstInstreport);
        }

        [HttpGet("GetInstagramFeedsdata")]
        public IActionResult GetInstagramFeedsdata(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getAllGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Instagram).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = new List<Domain.Socioboard.Models.Instagramaccounts>();
            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstInstreport = new List<Domain.Socioboard.Models.Mongo.InstagramFeed>();
            lstInstreport = Repositories.InstagramReportsRepository.getInstagramfeedsreport(lstStr, 90, _redisCache, _appSettings);
            return Ok(lstInstreport);
        }
        /// <summary>
        /// To get instagram data.
        /// </summary>
        /// <param name="profileId">profile id of user </param>
        /// <returns></returns>
        [HttpGet("GetInstagramData")]
        public IActionResult GetInstagramData(string profileId)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger,_appEnv);
            return Ok(Repositories.InstagramRepository.getInstagramAccount(profileId,_redisCache,dbr));
        }
        //public static DateTime UnixTimeStampToDateTime(double unixTimeStamp)
        //{
        //    // Unix timestamp is seconds past epoch
        //    System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
        //    dtDateTime = dtDateTime.AddSeconds(unixTimeStamp).ToLocalTime();
        //    return dtDateTime;
        //}
    }
}
