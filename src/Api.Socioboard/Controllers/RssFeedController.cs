using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using Microsoft.AspNetCore.Cors;
using System.Xml;
using System.Text.RegularExpressions;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;
using Domain.Socioboard.Models;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class RssFeedController : Controller
    {
        public RssFeedController(ILogger<RssFeedController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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
        /// 
        /// </summary>
        /// <param name="userId">id of the user</param>
        /// <param name="groupId">Id of the group to which account is to be added. </param>
        /// <param name="rssUrl"></param>
        /// <param name="profileId"></param>
        /// <returns></returns>
        [HttpPost("AddRssUrl")]
        public IActionResult AddRssUrl(long userId, long groupId, string rssUrl, string profileId)
        {

            try
            {
                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(rssUrl);
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("item");
                if (abc.Count == 0)
                {
                    return Ok("This Url Does't  Conatin Rss Feed");
                }
            }
            catch (Exception ex)
            {
                return Ok("This Url Does't  Conatin Rss Feed");
            }

            try
            {
                var dbr = new DatabaseRepository(_logger, _env);
                var _RssFeedUrl = Repositories.RssFeedRepository.AddRssUrl(profileId, rssUrl, dbr);

                if (_RssFeedUrl != "null")
                {
                    string[] lstProfileIds;
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
                            string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.Facebook, "http://graph.facebook.com/" + objFacebookAccount.FbUserId + "/picture?type=small", objFacebookAccount.FbUserName, null, dbr, _appSettings);
                        }
                        else if (item.StartsWith("page"))
                        {
                            string prId = item.Substring(5, item.Length - 5);
                            Domain.Socioboard.Models.Facebookaccounts objFacebookAccount = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(prId, _redisCache, dbr);
                            string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage, "http://graph.facebook.com/" + objFacebookAccount.FbUserId + "/picture?type=small", objFacebookAccount.FbUserName, null, dbr, _appSettings);

                        }
                        else if (item.StartsWith("tw"))
                        {
                            string prId = item.Substring(3, item.Length - 3);
                            Domain.Socioboard.Models.TwitterAccount objTwitterAccount = Api.Socioboard.Repositories.TwitterRepository.getTwitterAccount(prId, _redisCache, dbr);
                            string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.Twitter, objTwitterAccount.profileImageUrl, objTwitterAccount.twitterName, null, dbr, _appSettings);
                        }
                        else if (item.StartsWith("lin"))
                        {
                            string prId = item.Substring(4);
                            Domain.Socioboard.Models.LinkedInAccount objLinkedInAccount = Api.Socioboard.Repositories.LinkedInAccountRepository.getLinkedInAccount(prId, _redisCache, dbr);
                            string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.LinkedIn, objLinkedInAccount.ProfileImageUrl, objLinkedInAccount.LinkedinUserName, null, dbr, _appSettings);
                        }
                        else if (item.StartsWith("Cmpylinpage"))
                        {
                            string prId = item.Substring(12);
                            Domain.Socioboard.Models.LinkedinCompanyPage objLinkedinCompanyPage = Api.Socioboard.Repositories.LinkedInAccountRepository.getLinkedinCompanyPage(prId, _redisCache, dbr);
                            string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage, objLinkedinCompanyPage.LogoUrl, objLinkedinCompanyPage.LinkedinPageName, null, dbr, _appSettings);
                        }
                    }
                    return Ok("Added Successfully");
                }
            }
            catch (Exception)
            {
                return Ok("Can't Add Rss Url");
            }
            return Ok("Can't Add Rss Url");
        }

        [HttpPost("AddXMlUrl")]
        public IActionResult AddXMlUrl(long userId, long groupId, string rssUrl, string profileId)
        {

            try
            {
                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(rssUrl);
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("sitemap");

                if (abc.Count == 0)
                {
                    var urldata = xmlDoc.DocumentElement.GetElementsByTagName("url");
                    if (urldata.Count == 0)
                    {
                        return Ok("This Url Does't  Conatin xml sitemap url");
                    }
                }
            }
            catch (Exception ex)
            {
                return Ok("This Url Does't  Conatin xml sitemap url");
            }

            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string _RssFeedUrl = Repositories.RssFeedRepository.AddRssUrl(profileId, rssUrl, dbr);
            if (_RssFeedUrl != "null")
            {
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
                        string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.Facebook, "http://graph.facebook.com/" + objFacebookAccount.FbUserId + "/picture?type=small", objFacebookAccount.FbUserName, "xmldata", dbr, _appSettings);

                    }

                    if (item.StartsWith("page"))
                    {
                        string prId = item.Substring(5, item.Length - 5);
                        Domain.Socioboard.Models.Facebookaccounts objFacebookAccount = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(prId, _redisCache, dbr);
                        string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage, "http://graph.facebook.com/" + objFacebookAccount.FbUserId + "/picture?type=small", objFacebookAccount.FbUserName, "xmldata", dbr, _appSettings);

                    }
                    if (item.StartsWith("tw"))
                    {
                        string prId = item.Substring(3, item.Length - 3);
                        Domain.Socioboard.Models.TwitterAccount objTwitterAccount = Api.Socioboard.Repositories.TwitterRepository.getTwitterAccount(prId, _redisCache, dbr);
                        string ret = Repositories.RssFeedRepository.AddRssFeed(rssUrl, userId, prId, Domain.Socioboard.Enum.SocialProfileType.Twitter, objTwitterAccount.profileImageUrl, objTwitterAccount.twitterName, "xmldata", dbr, _appSettings);

                    }
                }


            }
            return Ok("Added Successfully");
        }

        [HttpPost("PostRssFeeds")]
        public IActionResult PostRssFeeds(string profileId, string userId, string rssUrl)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string ret = Repositories.RssFeedRepository.PostRssfeed(profileId, rssUrl, _appSettings, dbr, _redisCache);
            return Ok(ret);
        }


        [HttpGet("GetPostedRssDataByUser")]
        public IActionResult GetPostedRssDataByUser(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Mongo.RssFeed> lstRss = Repositories.RssFeedRepository.GetPostedRssDataByUser(userId, groupId, _appSettings, dbr);
            lstRss = lstRss.Where(t => !string.IsNullOrEmpty(t.Message)).ToList();
            List<Domain.Socioboard.Models.Mongo.RssFeed> lstRssFeeds = lstRss.OrderByDescending(t => t.PublishingDate).ToList();
            return Ok(lstRssFeeds);
        }

        [HttpGet("GetRssDataByUser")]
        public IActionResult GetRssDataByUser(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Mongo.Rss> lstRss = Repositories.RssFeedRepository.GetRssDataByUser(userId, groupId, _appSettings, dbr);
            return Ok(lstRss);
        }


        [HttpPost("EditFeedUrl")]
        public IActionResult EditFeedUrl(string NewFeedUrl, string OldFeedUrl, string RssId)
        {
            try
            {
                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(NewFeedUrl);
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("item");
                if (abc.Count == 0)
                {
                    return Ok("This Url Does't  Conatin Rss Feed");
                }
            }
            catch (Exception ex)
            {
                return Ok("This Url Does't  Conatin Rss Feed");
            }
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string editdata = Repositories.RssFeedRepository.EditFeedUrl(NewFeedUrl, OldFeedUrl, RssId, _appSettings, dbr);
            return Ok(editdata);
        }

        [HttpPost("DeleteFeedUrl")]
        public IActionResult DeleteFeedUrl(string RssId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string deletedata = Repositories.RssFeedRepository.DeleteFeedUrl(RssId, dbr, _appSettings);
            return Ok(deletedata);
        }

        // add and fetch the data for content feeds
        [HttpGet("RssNewsFeedsUrl")]
        public async Task<IActionResult> RssNewsFeedsUrl(string userId, string keyword)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            IEnumerable<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> lstcontent = await Repositories.RssNewsContentsRepository.FindUrl(keyword, userId, _logger, _env, _appSettings);
            try
            {
                foreach (var item in keyword.Split(','))
                {
                    if (dbr.Find<RssFeedUrl>(x => x.Keywords.Equals(item) && x.ProfileId.Equals(userId)).Count == 0)
                    {
                        RssFeedUrl _RssContentFeeds = new Domain.Socioboard.Models.RssFeedUrl();
                        _RssContentFeeds.rssurl = "";//to handle null exception//check and remove if not needed
                        _RssContentFeeds.LastUpdate = DateTime.UtcNow;
                        _RssContentFeeds.Keywords = item;
                        _RssContentFeeds.ProfileId = userId;
                        dbr.Add<Domain.Socioboard.Models.RssFeedUrl>(_RssContentFeeds);
                    }
                }
                //string res2 = Repositories.RssNewsContentsRepository.addtwitterContentfeedsdata(keyword, userId, _appSettings);
                //bool res3 = Repositories.RssNewsContentsRepository.addGplusContentfeedsdata(keyword, userId, _appSettings);
                //DatabaseRepository bdr = new DatabaseRepository(_logger, _env);
                //List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> lstcontent = Repositories.RssNewsContentsRepository.GetRssNewsFeeds(userId, keyword, _appSettings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.StackTrace);
            }
            return Ok(lstcontent);
        }

        //for geting posted data
        [HttpGet("getRssNewsFeedsPost")]
        public IActionResult getRssNewsFeedsPost(string userId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            if (count < 100)
            {
                return Ok(Repositories.RssNewsContentsRepository.GetRssNewsPostedFeeds(userId, _redisCache, _appSettings).Skip(skip).Take(count));

            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("RssNewsContentsFeeds", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>.Sort;
                var sort = builder.Descending(t => t.PublishingDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(t => t.UserId.Equals(userId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> lstcontentFeeds = task.Result;
                return Ok(lstcontentFeeds);
            }
            //  lstRss = lstRss.Where(t => !string.IsNullOrEmpty(t.Message)).ToList();
            //return Ok(lstRss);
        }


        [HttpPost("DeleteContentFeeds")]
        public IActionResult DeleteContentFeeds(string contentfeedid)
        {
            string feedData = Repositories.RssNewsContentsRepository.DeleteContentfeedsRepo(contentfeedid, _appSettings);
            return Ok(feedData);
        }

        /// <summary>
        /// get rss keyword list
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetKeywordList")]
        public IActionResult GetKeywordList(string UserId)
        {
            var dbr = new DatabaseRepository(_logger, _env);
            return Ok(dbr.Find<RssFeedUrl>(x => x.ProfileId.Equals(UserId)).Select(x => x.Keywords));
        }

        [HttpPost("DeleteFeedKeyword")]
        public ActionResult DeleteFeedKeyword(string UserId, string Keyword)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            RssFeedUrl feed = dbr.FindFirstMatch<RssFeedUrl>(x => x.ProfileId.Equals(UserId) && x.Keywords.Equals(Keyword));
            dbr.Delete<RssFeedUrl>(feed);
            return Ok("deleted successfully");
        }
    }
}