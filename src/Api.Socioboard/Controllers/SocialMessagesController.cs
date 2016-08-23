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
using System.Linq;



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
                if (item.StartsWith("lin"))
                {
                    string prId = item.Substring(4, item.Length - 4);
                    string ret = Helper.LinkedInHelper.PostLinkedInMessage(filename, userId, message, prId, filename, _redisCache, _appSettings, dbr);

                }
                if (item.StartsWith("Cmpylinpage"))
                {
                    string prId = item.Substring(12, item.Length - 12);
                    string ret = Helper.LinkedInHelper.PostLinkedInCompanyPagePost(filename, userId, message, prId, _redisCache, dbr, _appSettings);

                }
            }

            return Ok("Posted");

        }

        [HttpPost("ScheduleMessage")]
        public async Task<ActionResult> ScheduleMessage(string message, string profileId, long userId, string imagePath, string link, string scheduledatetime, IFormFile files)
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
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objFacebookaccounts.FbUserName, message, Domain.Socioboard.Enum.SocialProfileType.Facebook, userId, filename, "https://graph.facebook.com/" + prId + "/picture?type=small", scheduledatetime, _appSettings, _redisCache, dbr, _logger);
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
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objTwitterAccount.twitterName, message, Domain.Socioboard.Enum.SocialProfileType.Twitter, userId, filename, objTwitterAccount.profileImageUrl, scheduledatetime, _appSettings, _redisCache, dbr, _logger);
                }
                if (item.StartsWith("lin"))
                {
                    string prId = item.Substring(4, item.Length - 4);
                    Domain.Socioboard.Models.LinkedInAccount objLinkedInAccount = Api.Socioboard.Repositories.LinkedInAccountRepository.getLinkedInAccount(prId, _redisCache, dbr);
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objLinkedInAccount.LinkedinUserName, message, Domain.Socioboard.Enum.SocialProfileType.LinkedIn, userId, filename, objLinkedInAccount.ProfileImageUrl, scheduledatetime, _appSettings, _redisCache, dbr, _logger);
                }
                if (item.StartsWith("Cmpylinpage"))
                {
                    string prId = item.Substring(12, item.Length - 12);
                    Domain.Socioboard.Models.LinkedinCompanyPage objLinkedinCompanyPage = Api.Socioboard.Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(prId, _redisCache, dbr);
                    Helper.ScheduleMessageHelper.ScheduleMessage(prId, objLinkedinCompanyPage.LinkedinPageName, message, Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage, userId, filename, objLinkedinCompanyPage.LogoUrl, scheduledatetime, _appSettings, _redisCache, dbr, _logger);
                }

            }
            return Ok("scheduled");
        }

        [HttpPost("DraftScheduleMessage")]
        public async Task<ActionResult> DraftScheduleMessage(string message, long userId, string scheduledatetime, long groupId, IFormFile files)
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
            Helper.ScheduleMessageHelper.DraftScheduleMessage(message, userId, groupId, filename, scheduledatetime, _appSettings, _redisCache, dbr, _logger);
            return Ok();
        }

        [HttpGet("GetAllScheduleMessage")]
        public IActionResult GetAllScheduleMessage(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.getUsreScheduleMessage(userId, groupId, _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("DeleteSocialMessages")]
        public IActionResult DeleteSocialMessages(long socioqueueId, long userId, long GroupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.DeleteSocialMessages(socioqueueId, userId, GroupId, _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("EditScheduleMessage")]
        public IActionResult EditScheduleMessage(long socioqueueId, long userId, long GroupId, string message)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduleMessage = Repositories.ScheduledMessageRepository.EditScheduleMessage(socioqueueId, userId, GroupId, message, _redisCache, _appSettings, dbr);
            return Ok(lstScheduleMessage);
        }


        [HttpGet("GetAllSentMessages")]
        public IActionResult GetAllSentMessages(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.GetAllSentMessages(userId, groupId, _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("GetAllSentMessagesCount")]
        public IActionResult GetAllSentMessagesCount(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            int GetAllSentMessagesCount = Repositories.ScheduledMessageRepository.GetAllSentMessagesCount(userId, groupId, dbr, _redisCache);
            return Ok(GetAllSentMessagesCount);
        }

        [HttpGet("getAllSentMessageDetailsforADay")]
        public IActionResult getAllSentMessageDetailsforADay(long userId, long groupId, string day)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.getAllSentMessageDetailsforADay(userId, groupId, int.Parse(day), _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("getAllSentMessageDetailsByDays")]
        public IActionResult getAllSentMessageDetailsByDays(long userId, long groupId, string days)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.getAllSentMessageDetailsByDays(userId, groupId, int.Parse(days), _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }

        [HttpGet("getAllSentMessageDetailsByMonth")]
        public IActionResult getAllSentMessageDetailsByMonth(long userId, long groupId, string month)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.getAllSentMessageDetailsByMonth(userId, groupId, int.Parse(month), _redisCache, _appSettings, dbr);
            return Ok(lstScheduledMessage);
        }


        [HttpGet("GetAllScheduleMessageCalendar")]
        public IActionResult GetAllScheduleMessageCalendar(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = Repositories.ScheduledMessageRepository.getUsreScheduleMessage(userId, groupId, _redisCache, _appSettings, dbr);

            var eventList = from e in lstScheduledMessage
                            select new
                            {
                                id = e.id,
                                title = e.shareMessage,
                                //  start = new DateTime(e.ScheduleTime.Year, e.ScheduleTime.Month, e.ScheduleTime.Day, e.ScheduleTime.Hour, e.ScheduleTime.Minute, e.ScheduleTime.Second).ToString("yyyy-MM-dd HH':'mm':'ss"),
                                start = e.scheduleTime,
                                //url
                                allDay = false,
                                description = e.shareMessage,
                                profileId = e.profileId,
                                Image = e.picUrl,
                                ProfileImg = e.picUrl
                                //Image = "/Themes/" + path + "/" +e.PicUrl.Split(new string[] { path }, StringSplitOptions.None)[2],
                            };
            var rows = eventList.ToArray();
            return Ok(rows);
        }


    }
}
