using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [Microsoft.AspNetCore.Cors.EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class FacaebookPageReportsController : Controller
    {
        public FacaebookPageReportsController(ILogger<FacaebookPageReportsController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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
        /// To provide the report on facebook page.
        /// </summary>
        /// <param name="profileId">Profile id of user</param>
        /// <param name="daysCount">To prepare report in a given counted days provided by the user</param>
        /// <returns></returns>
        /// <response code="500">Internal Server Erro.r</response>
        [HttpGet("GetFacebookPageReportData")]
        public IActionResult GetFacebookPageReportData(string profileId, int daysCount)
        {
            return Ok(Repositories.FacaebookPageReportsRepositories.getFacaebookPageReports(profileId, daysCount, _redisCache,_appSettings));
        }

        [HttpGet("GetFacebookPagePostData")]
        public IActionResult GetFacebookPagePostData(string profileId, int daysCount)
        {
            return Ok(Repositories.FacaebookPageReportsRepositories.getFacebookPagePostReports(profileId,daysCount,_redisCache,_appSettings));
        }

        [HttpGet("GetFacebookPublicPageReport")]
        public IActionResult GetFacebookPublicPageReport(int daysCount)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger,_appEnv);
            return Ok(Repositories.FacaebookPageReportsRepositories.GetFacebookPublicPageReport(dbr,_appSettings,daysCount));
        }

        [HttpGet("GetFbTotalFanpage")]
        public IActionResult GetFbTotalFanpage(long userId, int days)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            MongoRepository mongorepo = new MongoRepository("FacaebookPageDailyReports", _appSettings);
            List<Domain.Socioboard.Models.Facebookaccounts> lstfanpageacc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.UserId == userId && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage).ToList();

            List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans> lstInstreport = new List<Domain.Socioboard.Models.Mongo.totalFacebookpagefans>();
            lstInstreport = Repositories.FacaebookPageReportsRepositories.GetTotalFanpageDet(lstfanpageacc, days, _redisCache, _appSettings);

            return Ok(lstInstreport);
        }

        [HttpGet("GetFbFanpageDetailsRep")]
        public IActionResult GetFbFanpageDetailsRep(long userId)
        {
            Model.DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            MongoRepository mongorepo = new MongoRepository("FacaebookPageDailyReports", _appSettings);
            List<Domain.Socioboard.Models.Facebookaccounts> fbacclst = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.UserId == userId && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage).ToList();
            string[] fbaccid = fbacclst.Select(t => t.FbUserId).ToArray();
            List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports> fbreplst = new List<Domain.Socioboard.Models.Mongo.FacaebookPageDailyReports>();
            fbreplst = Repositories.FacaebookPageReportsRepositories.GetFbpageDetails(fbaccid, dbr, _redisCache, _appSettings);
            return Ok(fbreplst);
        }

        [HttpGet("getFacebookPagePostallDet")]
        public IActionResult getFacebookPagePostallDet(long userId)
        {
            Model.DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            MongoRepository mongorepo = new MongoRepository("FacebookPagePost", _appSettings);
            List<Domain.Socioboard.Models.Facebookaccounts> fblst = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.UserId == userId && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage && t.IsActive == true).ToList();
            string[] fblstid = fblst.Select(t => t.FbUserId).ToArray();
            List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails> fbpagePost = new List<Domain.Socioboard.Models.Mongo.totalfbPagePostDetails>();
            fbpagePost = Repositories.FacaebookPageReportsRepositories.getfbPagePostAllDetails(fblstid, 90, _redisCache, _appSettings);
            return Ok(fbpagePost);

        }
    }
}
