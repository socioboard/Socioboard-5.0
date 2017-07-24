using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Cors;
using System.Text.RegularExpressions;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class DraftMessageController : Controller
    {
        public DraftMessageController(ILogger<DraftMessageController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = new Helper.Cache(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;


        /// <summary>
        /// Get All The Draft Messages of User
        /// </summary>
        /// <param name="userId"> Id of the user. </param>
        /// <response code="500">Internal Server Erro.r</response>
        [HttpGet("GetAllUserDraftMessages")]
        public IActionResult GetAllUserDraftMessages(long userId,long GroupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Draft> lstDraft = Repositories.DraftMessageRepository.getUsreDraftMessage(userId,GroupId,_redisCache, _appSettings, dbr);
            return Ok(lstDraft);
        }


        [HttpGet("DeleteDraftMessage")]
        public IActionResult DeleteDraftMessage(long draftId,long userId, long GroupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Draft> lstDraft = Repositories.DraftMessageRepository.DeleteDraftMessage(draftId,userId, GroupId, _redisCache, _appSettings, dbr);
            return Ok(lstDraft);
        }

        [HttpPost("EditDraftMessage")]
        public IActionResult EditDraftMessage(long draftId, long userId, long GroupId,string message)
        {

            string postmessage = "";
            string[] updatedmessgae = Regex.Split(message, "<br>");

            foreach (var item in updatedmessgae)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    if (item.Contains("hhh") || item.Contains("nnn") || item.Contains("ppp") || item.Contains("jjj"))
                    {
                        if (item.Contains("hhh"))
                        {
                            postmessage = postmessage + item.Replace("hhh", "#");
                        }
                        if (item.Contains("nnn"))
                        {
                            postmessage = postmessage.Replace("nnn", "&");
                        }
                        if (item.Contains("ppp"))
                        {
                            postmessage = postmessage.Replace("ppp", "+");
                        }
                        if (item.Contains("jjj"))
                        {
                            postmessage = postmessage.Replace("jjj", "-+");
                        }
                    }
                    else
                    {
                        postmessage = postmessage + "\n\r" + item;
                    }
                }
            }
            message = postmessage;

            DatabaseRepository dbr = new DatabaseRepository(_logger,_env);
            List<Domain.Socioboard.Models.Draft> lstDraft = Repositories.DraftMessageRepository.EditDraftMessage(draftId, userId, GroupId, message,_redisCache, _appSettings, dbr);
            return Ok(lstDraft);
        }
    }
}
