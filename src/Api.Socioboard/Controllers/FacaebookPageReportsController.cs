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

    }
}
