using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using System.Collections.Generic;

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
