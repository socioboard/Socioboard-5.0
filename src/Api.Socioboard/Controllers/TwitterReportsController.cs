using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [Microsoft.AspNetCore.Cors.EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class TwitterReportsController : Controller
    {
        public TwitterReportsController(ILogger<FacebookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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
        /// To give report on twitter
        /// </summary>
        /// <param name="profileId">Id of the user</param>
        /// <param name="daysCount">preparing the report till given counted days</param>
        /// <response code="500">Internal Server Erro.r</response>
        /// <returns></returns>
        [HttpGet("GetTwitterReports")]
        public IActionResult GetTwitterReports(string profileId, int daysCount)
        {
            return Ok(Repositories.TwitterReportsRepository.GetTwitterMessageReports(profileId, daysCount, _redisCache, _appSettings));
        }

        [HttpGet("GetTwitterProfilesData")]
        public IActionResult GetTwitterProfilesData(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.TwitterAccount> lstInsAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
            List<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports> lstInstreport = new List<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports>();
            lstInstreport = Repositories.TwitterReportsRepository.gettwitterReport(lstStr, 90, _redisCache, _appSettings);
            return Ok(lstInstreport);
        }

        [HttpGet("GettwtfollowfollowingGraph")]
        public IActionResult GettwtfollowfollowingGraph(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
           // string[] lstname= lstGrpProfiles.Select(t => t.profileName).ToArray();
            //List<Domain.Socioboard.Models.TwitterAccount> lstInsAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
            List<Domain.Socioboard.Models.Mongo.twtfollowfollowing> lstTwtreport = new List<Domain.Socioboard.Models.Mongo.twtfollowfollowing>();
            lstTwtreport = Repositories.TwitterReportsRepository.gettwtfollofollowingReport(lstStr, 90, _redisCache, _appSettings,dbr);
           
            return Ok(lstTwtreport);
        }


        [HttpGet("GetTwitterFeedsdata")]
        public IActionResult GetTwitterFeedsdata(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.TwitterAccount> lstInsAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
            List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstInstreport = new List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>();
            lstInstreport = Repositories.TwitterReportsRepository.gettwitterfeedsreport(lstStr, 90, _redisCache, _appSettings);
            return Ok(lstInstreport);
        }

        [HttpGet("CreateTodayReports")]
        public IActionResult CreateTodayReports()
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            IList<Domain.Socioboard.Models.TwitterAccount> twitterAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t=>t.id > 0);
            foreach(var item in twitterAccounts)
            {
                Repositories.TwitterReportsRepository.CreateTodayReports(item.twitterUserId,item.userId,_redisCache,_appSettings);
            }
            return Ok();

        }

        [HttpGet("GetTopFiveFans")]
        public IActionResult GetTopFiveFans(string profileId, int daysCount)
        {
            return Ok(Repositories.TwitterReportsRepository.GetTopFiveFans(profileId, daysCount, _redisCache, _appSettings));
        }
        [HttpGet("GetTwitterRecentDetails")]
        public IActionResult GetTwitterRecentDetails(string profileId)
        {
            return Ok(Repositories.TwitterReportsRepository.GetTwitterRecentDetails(profileId, _redisCache, _appSettings));
        }
    }
}
