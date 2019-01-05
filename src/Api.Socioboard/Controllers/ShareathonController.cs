using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class ShareathonController : Controller
    {
        public ShareathonController(ILogger<ShareathonController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _env = env;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IHostingEnvironment _env;

        /// <summary>
        /// To share the facebook page post with selected facebook profile in a given period of time.
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <param name="FacebookPageId">facebookpage id of user facebook profile</param>
        /// <param name="Facebookaccountid">Facebook account id of user</param>
        /// <param name="Timeintervalminutes">Time interval provided by the user for posting</param>
        /// <returns></returns>
        [HttpPost("AddPageShareathon")]
        public IActionResult AddPageShareathon(long userId,string Facebookaccountid, int Timeintervalminutes)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger,_env);
            string FacebookPageId = Request.Form["FacebookPageId"];
            string FacebookUrl = Request.Form["FacebookUrl"];
            if (string.IsNullOrEmpty(FacebookUrl))
            {
                FacebookUrl = "";
            }
            string pagedata = Repositories.ShareathonRepository.AddPageShareathon(userId, FacebookUrl, FacebookPageId, Facebookaccountid, Timeintervalminutes, _redisCache, _appSettings, dbr);
            return Ok(pagedata);
        }

        [HttpPost("EditPageShareathon")]
        public IActionResult EditPageShareathon(string PageShareathodId,long userId, string Facebookaccountid, int Timeintervalminutes)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string FacebookPageId = Request.Form["FacebookPageId"];
            string FacebookUrl = Request.Form["FacebookUrl"];
            if(string.IsNullOrEmpty(FacebookUrl))
            {
                FacebookUrl = "";
            }
            string pagedata = Repositories.ShareathonRepository.EditPageShareathon(PageShareathodId,userId, FacebookUrl, FacebookPageId, Facebookaccountid, Timeintervalminutes, _redisCache, _appSettings, dbr);
            return Ok(pagedata);
        }

        [HttpPost("DeletePageShareathon")]
        public IActionResult DeletePageShareathon(string PageShareathodId)
        {
            string pagedata = Repositories.ShareathonRepository.DeletePageShareathon(PageShareathodId, _appSettings);
            return Ok(pagedata);
        }

        [HttpGet("UserpageShareathon")]
        public IActionResult UserpageShareathon(long userId)
        {
            List<Domain.Socioboard.Models.Mongo.PageShareathon> lstPageShareathon = Repositories.ShareathonRepository.PageShareathonByUserId(userId, _appSettings, _redisCache);
            return Ok(lstPageShareathon);
        }


        [HttpPost("DeleteGroupShareathon")]
        public IActionResult DeleteGroupShareathon(string GroupShareathodId)
        {
            string pagedata = Repositories.ShareathonRepository.DeleteGroupShareathon(GroupShareathodId, _appSettings);
            return Ok(pagedata);
        }
        [HttpPost("DeleteLinkShareathon")]
        public IActionResult DeleteLinkShareathon(string LinkShareathodId)
        {
            string pagedata = Repositories.ShareathonRepository.DeleteLinkShareathon(LinkShareathodId, _appSettings);
            return Ok(pagedata);
        }

        [HttpGet("UsergroupShareathon")]
        public IActionResult UsergroupShareathon(long userId)
        {
            List<Domain.Socioboard.Models.Mongo.GroupShareathon> lstPageShareathon = Repositories.ShareathonRepository.GroupShareathonByUserId(userId, _appSettings, _redisCache);
            return Ok(lstPageShareathon);
        }

        [HttpGet("UserLinkShareathon")]
        public IActionResult UserLinkShareathon(long userId)
        {
            List<Domain.Socioboard.Models.Mongo.LinkShareathon> lstPageShareathon = Repositories.ShareathonRepository.LinkShareathonByUserId(userId, _appSettings, _redisCache);
            return Ok(lstPageShareathon);
        }


        /// <summary>
        /// To group post with selected facebook profiles in a given period of time 
        /// </summary>
        /// <param name="userId">id of the user</param>
        /// <param name="FacebookUrl">facebook url of user</param>
        /// <param name="Facebookaccountid">Facebook account id of user</param>
        /// <param name="Timeintervalminutes">Time interval provided by the user</param>
        /// <param name="FacebookGroupId">FacebookGroup id of user facebook profile</param>
        /// <returns></returns>
        [HttpPost("AddGroupShareathon")]
        public IActionResult AddGroupShareathon(long userId,string Facebookaccountid, int Timeintervalminutes)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string FacebookGroupId = Request.Form["FacebookGroupId"];
            string FacebookUrl = Request.Form["FacebookUrl"];
            string pagedata = Repositories.ShareathonRepository.AddGroupShareathon(userId, FacebookUrl, FacebookGroupId, Facebookaccountid, Timeintervalminutes, _redisCache, _appSettings, dbr);
            return Ok(pagedata);
        }


        [HttpPost("EditGroupShareathon")]
        public IActionResult EditGroupShareathon(string GroupShareathodId, long userId,string Facebookaccountid, int Timeintervalminutes)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string FacebookGroupId = Request.Form["FacebookGroupId"];
            string FacebookUrl = Request.Form["FacebookUrl"];
            string pagedata = Repositories.ShareathonRepository.EditgroupShareathon(GroupShareathodId, userId, FacebookUrl, FacebookGroupId, Facebookaccountid, Timeintervalminutes, _redisCache, _appSettings, dbr);
            return Ok(pagedata);
        }

        [HttpPost("FacebookFeedShare")]
        public IActionResult FacebookFeedShare(long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string FacebookPageId = Request.Form["FacebookPageId"];
            string socialProfiles = Request.Form["OtherSocialProfile"];
            string[] socailProfielId = null;
            socailProfielId = socialProfiles.Split(',');

            string[] facebookPageId = null;
            facebookPageId = FacebookPageId.Split(',');



            foreach (var pageId in facebookPageId)
            {
                foreach (var item in socailProfielId)
                {
                    if (item.StartsWith("tw"))
                    {
                        try
                        {
                            string prId = item.Substring(3, item.Length - 3);
                            Repositories.ShareathonRepository.AddFacebookFeedShareDetail(userId, prId, pageId, "tw", _redisCache, _appSettings, dbr);
                            //    return Ok(pagedata);
                        }
                        catch (System.Exception ex)
                        {
                            _logger.LogError(ex.StackTrace);
                        }
                    }
                    if (item.StartsWith("lin"))
                    {
                        try
                        {
                            string prId = item.Substring(4, item.Length - 4);
                            Repositories.ShareathonRepository.AddFacebookFeedShareDetail(userId, prId, pageId, "lin", _redisCache, _appSettings, dbr);
                        }
                        catch (System.Exception ex)
                        {
                            _logger.LogError(ex.StackTrace);


                        }
                    }
                }
            }

            return Ok("Added Sucessfully");
        }
    }
}
