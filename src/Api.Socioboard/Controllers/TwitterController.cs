using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Api.Socioboard.Model;
using MongoDB.Driver;
using Microsoft.AspNetCore.Hosting;
using Socioboard.Twitter.Authentication;
using Microsoft.AspNetCore.Cors;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class TwitterController : Controller
    {
        public TwitterController(ILogger<FacebookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
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


        [HttpPost("AddTwitterAccount")]
        public IActionResult AddTwitterAccount(long userId, long groupId, string requestToken, string requestSecret, string requestVerifier)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            oAuthTwitter OAuth = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
            OAuth.AccessToken = requestToken;
            OAuth.AccessTokenSecret = requestVerifier;
            OAuth.AccessTokenGet(requestToken, requestVerifier);
            string output = Repositories.TwitterRepository.AddTwitterAccount(userId, groupId, dbr, OAuth, _logger, _redisCache, _appSettings);
            return Ok(output);
        }


        [HttpGet("GetFeeds")]
        public IActionResult GetFeeds(string profileId, long userId, int skip, int count)
        {
            if (skip + count < 100)
            {
                return Ok(Repositories.TwitterRepository.GetTopFeeds(profileId, userId, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>.Sort;
                var sort = builder.Descending(t => t.feedDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(t => t.profileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstTwitterFeeds = task.Result;
                return Ok(lstTwitterFeeds);
            }
        }

        [HttpGet("GetUserTweets")]
        public IActionResult GetUserTweets(string profileId, long userId, int skip, int count)
        {
            if (skip + count < 100)
            {
                return Ok(Repositories.TwitterRepository.GetUserTweets(profileId, userId, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.profileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstTwitterTweets = task.Result;
                return Ok(lstTwitterTweets);
            }
        }

        [HttpGet("GetTwitterProfiles")]
        public IActionResult GetTwitterProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
            foreach (var item in lstGrpProfiles.Where(t => t.ProfileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(item.ProfileId, _redisCache, dbr);
                if (twtAcc != null)
                {
                    lstTwtAcc.Add(twtAcc);
                }
            }
            return Ok(lstTwtAcc);
        }

        [HttpGet("GetNotifications")]
        public IActionResult GetNotifications(long groupId, long userId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstTwtMessages = new List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>();
            foreach (var item in lstGrpProfiles.Where(t => t.ProfileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                if (skip + count < 100)
                {
                    List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> twtMessages = Repositories.TwitterRepository.GetUserNotifications(item.ProfileId, userId, _redisCache, _appSettings);
                    if (twtMessages != null)
                    {
                        lstTwtMessages.AddRange(twtMessages.OrderByDescending(t => t.messageDate).Skip(skip).Take(count));
                    }
                }
                else
                {
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", _appSettings);
                    var builder = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>.Sort;
                    var sort = builder.Descending(t => t.messageDate);
                    var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.profileId.Equals(item.ProfileId) && (t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterMention || t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet), sort, skip, count);
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstTwitterTweets = task.Result;
                    if (lstTwitterTweets != null)
                    {
                        lstTwtMessages.AddRange(lstTwitterTweets);
                    }
                }
            }
            return Ok(lstTwtMessages.OrderByDescending(t => t.messageDate));
        }

        [HttpGet("GetTwitterDirectMessage")]
        public IActionResult GetTwitterDirectMessage(long groupId, long userId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> lstTwtMessages = new List<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>();
            foreach (var item in lstGrpProfiles.Where(t => t.ProfileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                if (skip + count < 100)
                {
                    List<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> twtMessages = Repositories.TwitterRepository.GetTwitterDirectMessages(item.ProfileId, userId, _redisCache, _appSettings);
                    if (twtMessages != null)
                    {
                        lstTwtMessages.AddRange(twtMessages.OrderByDescending(t => t.createdDate).Skip(skip).Take(count));
                    }
                }
                else
                {
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages", _appSettings);
                    var builder = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>.Sort;
                    var sort = builder.Descending(t => t.createdDate);
                    var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => (t.senderId.Equals(item.ProfileId) || t.recipientId.Equals(item.ProfileId)) && (t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterMention || t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet), sort, skip, count);
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> lstTwitterTweets = task.Result;
                    if (lstTwitterTweets != null)
                    {
                        lstTwtMessages.AddRange(lstTwitterTweets);
                    }
                }
            }
            return Ok(lstTwtMessages.OrderByDescending(t => t.createdDate));
        }

        [HttpPost("TwitterReplyUpdate")]
        public IActionResult TwitterReplyUpdate(long groupId, long userId, string profileId, string messageId, string message)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterReplyUpdate = Repositories.TwitterRepository.Post_ReplyStatusesUpdate(profileId, message, messageId, userId, groupId, dbr, _logger, _redisCache, _appSettings);
            return Ok(TwitterReplyUpdate);
        }

        [HttpPost("TwitterRetweet_post")]
        public IActionResult TwitterRetweet_post(long groupId, long userId, string profileId, string messageId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterRetweet_post = Repositories.TwitterRepository.TwitterRetweet_post(profileId, messageId, userId, groupId, dbr, _logger, _redisCache, _appSettings);
            return Ok(TwitterRetweet_post);
        }

        [HttpPost("TwitterFavorite_post")]
        public IActionResult TwitterFavorite_post(long groupId, long userId, string profileId, string messageId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterFavorite_post = Repositories.TwitterRepository.TwitterFavorite_post(profileId, messageId, userId, groupId, dbr, _logger, _redisCache, _appSettings);
            return Ok(TwitterFavorite_post);
        }
    }
}
