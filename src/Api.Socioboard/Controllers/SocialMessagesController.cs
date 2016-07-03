using Microsoft.AspNetCore.Mvc;
using Api.Socioboard.Model;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Cors;
using System.Threading.Tasks;
using Domain.Socioboard.Models;
using System.Collections.Generic;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class SocialMessagesController : Controller
    {

        public SocialMessagesController(ILogger<FacebookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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


        [HttpPost("ComposeMessage")]
        public async Task<IActionResult> ComposeMessage(string message, string profileId, long userId, string imagePath, string link, IFormFile files)
        {
            var filename = "";
            var uploads = _appEnv.WebRootPath + "\\wwwwroot\\upload\\" + profileId;
            if (files != null)
            {

                if (files.Length > 0)
                {
                    var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
                    // await file.s(Path.Combine(uploads, fileName));
                    filename = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                            .Parse(files.ContentDisposition)
                            .FileName
                            .Trim('"');
                    filename = _appEnv.WebRootPath + $@"\{fileName}";
                    // size += file.Length;
                    using (FileStream fs = System.IO.File.Create(filename))
                    {
                        files.CopyTo(fs);
                        fs.Flush();
                    }
                }
            }

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string[] lstProfileIds = null;
            if (profileId != null)
            {
                lstProfileIds = profileId.Split(',');
                profileId = lstProfileIds[0];
            }
            else
            {
                return Ok("profileId required");
            }

            foreach (var item in lstProfileIds)
            {
                if (item.StartsWith("fb"))
                {
                    string prId = item.Substring(3, item.Length - 3);
                    Domain.Socioboard.Models.Facebookaccounts objFacebookAccount = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(prId, _redisCache, dbr);
                    string ret = Helper.FacebookHelper.ComposeMessage(objFacebookAccount.FbProfileType, objFacebookAccount.AccessToken, objFacebookAccount.FbUserId, message, prId, userId, filename, imagePath, dbr, _logger);
                }
                if (item.StartsWith("tw"))
                {
                    string prId = item.Substring(3, item.Length - 3);
                    string ret = Helper.TwitterHelper.PostTwitterMessage(_appSettings, _redisCache, message, prId, userId, filename, true, dbr, _logger);
                }
            }
            return Ok();
        }

        [HttpPost("ScheduleMessage")]
        public async Task<ActionResult> ScheduleMessage(string message, string profileId, long userId, string imagePath, string link,string scheduledatetime, IFormFile files)
        {
            var filename = "";
            var uploads = _appEnv.WebRootPath + "\\wwwwroot\\upload\\" + profileId;
            if (files != null)
            {

                if (files.Length > 0)
                {
                    var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
                    // await file.s(Path.Combine(uploads, fileName));
                    filename = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                            .Parse(files.ContentDisposition)
                            .FileName
                            .Trim('"');
                    filename = _appEnv.WebRootPath + $@"\{fileName}";
                    // size += file.Length;
                    using (FileStream fs = System.IO.File.Create(filename))
                    {
                        files.CopyTo(fs);
                        fs.Flush();
                    }
                }
            }

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string[] lstProfileIds = null;
            if (profileId != null)
            {
                lstProfileIds = profileId.Split(',');
                profileId = lstProfileIds[0];
            }
            else
            {
                return Ok("profileId required");
            }

            foreach (var item in lstProfileIds)
            {
                if (item.StartsWith("fb"))
                {
                    string prId = item.Substring(3, item.Length - 3);
                    Domain.Socioboard.Models.Facebookaccounts objFacebookaccounts = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(prId, _redisCache, dbr);
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objFacebookaccounts.FbUserName, message, Domain.Socioboard.Enum.SocialProfileType.Facebook, userId, filename, "https://graph.facebook.com/"+prId+"/picture?type=small", scheduledatetime, _appSettings, _redisCache, dbr, _logger);
                }
                if (item.StartsWith("page"))
                {
                    string prId = item.Substring(5, item.Length - 5);
                    Domain.Socioboard.Models.Facebookaccounts objFacebookaccounts = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(prId, _redisCache, dbr);
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objFacebookaccounts.FbUserName, message, Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage, userId, filename, "https://graph.facebook.com/" + prId + "/picture?type=small", scheduledatetime, _appSettings, _redisCache, dbr, _logger);
                }
                if (item.StartsWith("tw"))
                {
                    string prId = item.Substring(3, item.Length - 3);
                    Domain.Socioboard.Models.TwitterAccount objTwitterAccount = Api.Socioboard.Repositories.TwitterRepository.getTwitterAccount(prId, _redisCache, dbr);
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objTwitterAccount.twitterName,message, Domain.Socioboard.Enum.SocialProfileType.Twitter, userId, filename, objTwitterAccount.profileImageUrl, scheduledatetime, _appSettings, _redisCache, dbr, _logger);
                }
            }
            return Ok("scheduled");
        }

        [HttpPost("DraftScheduleMessage")]
        public async Task<ActionResult> DraftScheduleMessage(string message, long userId, string scheduledatetime,long groupId, IFormFile files)
        {
            var filename = "";
            if (files != null)
            {

                if (files.Length > 0)
                {
                    var fileName = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue.Parse(files.ContentDisposition).FileName.Trim('"');
                    // await file.s(Path.Combine(uploads, fileName));
                    filename = Microsoft.Net.Http.Headers.ContentDispositionHeaderValue
                            .Parse(files.ContentDisposition)
                            .FileName
                            .Trim('"');
                    filename = _appEnv.WebRootPath + $@"\{fileName}";
                    // size += file.Length;
                    using (FileStream fs = System.IO.File.Create(filename))
                    {
                        files.CopyTo(fs);
                        fs.Flush();
                    }
                }
            }
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Helper.ScheduleMessageHelper.DraftScheduleMessage(message, userId,groupId, filename, scheduledatetime,_appSettings,_redisCache,dbr,_logger);
            return Ok();
        }

        [HttpGet("GetAllScheduleMessage")]
        public IActionResult GetAllScheduleMessage(long userId,long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.getUsreScheduleMessage(userId, groupId, _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("DeleteSocialMessages")]
        public IActionResult DeleteSocialMessages(long socioqueueId, long userId, long GroupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger,_appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.DeleteSocialMessages(socioqueueId, userId, GroupId, _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("EditScheduleMessage")]
        public IActionResult EditScheduleMessage(long socioqueueId, long userId, long GroupId,string message)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage>lstScheduleMessage = Repositories.ScheduledMessageRepository.EditScheduleMessage(socioqueueId, userId, GroupId, message, _redisCache, _appSettings, dbr);
            return Ok(lstScheduleMessage);
        }
    }
}
