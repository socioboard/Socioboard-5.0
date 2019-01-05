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
using System.Text.RegularExpressions;
using Domain.Socioboard.Interfaces.Services;
using System.Threading;
using MongoDB.Bson;
using Api.Socioboard.Repositories;
using Domain.Socioboard.Models;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class TwitterController : Controller
    {
        public TwitterController(ILogger<FacebookController> logger, IEmailSender email, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment appEnv)
        {
            _logger = logger;
            _appSettings = settings.Value;
            _redisCache = Helper.Cache.GetCacheInstance(_appSettings.RedisConfiguration);
            _appEnv = appEnv;
            _emailSender = email;
        }
        private readonly ILogger _logger;
        private Helper.AppSettings _appSettings;
        private Helper.Cache _redisCache;
        private readonly IEmailSender _emailSender;
        private readonly IHostingEnvironment _appEnv;


        /// <summary>
        /// To add twitter account
        /// </summary>
        /// <param name="userId">Id of user</param>
        /// <param name="groupId">Id of the group to which account is to be added.</param>
        /// <param name="requestToken"></param>
        /// <param name="requestSecret"></param>
        /// <param name="requestVerifier"></param>
        /// <returns></returns>
        [HttpPost("AddTwitterAccount")]
        public IActionResult AddTwitterAccount(long userId, long groupId, string requestToken, string requestSecret, string requestVerifier, bool follow)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            var dbr = new DatabaseRepository(_logger, _appEnv);
            var OAuth = new oAuthTwitter(_appSettings.twitterConsumerKey,
                _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl)
            {
                AccessToken = requestToken,
                AccessTokenSecret = requestVerifier
            };
            OAuth.GetTwitterAccessToken(requestToken, requestVerifier);
            var output = TwitterRepository.AddTwitterAccount(userId, groupId, follow, dbr, OAuth, _logger, _redisCache, _appSettings);
            if (output.Contains("Twitter account already added by you") || output.Contains("This Account is added by other user") || output.Contains("Issue while fetching twitter userId") || output.Contains("Your Twitter profile is not Authorized to add") || output.Contains("Error while Adding Account"))
                return BadRequest(output);

            return Ok(output);
        }

        [HttpPost("ReconnectTwtAcc")]
        public IActionResult ReconnectTwtAcc(long userId, string requestToken, string requestSecret, string requestVerifier, bool follow)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            oAuthTwitter OAuth = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
            OAuth.AccessToken = requestToken;
            OAuth.AccessTokenSecret = requestVerifier;
            OAuth.GetTwitterAccessToken(requestToken, requestVerifier);
            string output = Repositories.TwitterRepository.ReconnecTwitter(userId, follow, dbr, OAuth, _logger, _redisCache, _appSettings);

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

        [HttpGet("ShortTwtfeeds")]
        public IActionResult ShortTwtfeeds(string profileId, long userId, int skip, int count, string shortvalue)
        {
            return Ok(Repositories.TwitterRepository.GetTwitterSort(profileId, userId, _redisCache, _appSettings, skip, count, shortvalue));
        }

        [HttpGet("GetTwFilterFeeds")]
        public IActionResult GetTwFilterFeeds(string profileId, long userId, int skip, int count, string mediaType)
        {
            return Ok(Repositories.TwitterRepository.GetTopFilterFeeds(profileId, userId, _redisCache, _appSettings, skip, count, mediaType));
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
                MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoMessageModel>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.profileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwitterTweets = task.Result;
                return Ok(lstTwitterTweets);
            }
        }

        [HttpGet("GetTwitterProfiles")]
        public IActionResult GetTwitterProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(item.profileId, _redisCache, dbr);
                if (twtAcc != null)
                {
                    lstTwtAcc.Add(twtAcc);
                }
            }
            return Ok(lstTwtAcc);
        }

        [HttpGet("GetAllTwitterProfiles")]
        public IActionResult GetAllTwitterProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(item.profileId, _redisCache, dbr);
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
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwtMessages = new List<Domain.Socioboard.Models.Mongo.MongoMessageModel>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                if (skip + count < 100)
                {
                    List<Domain.Socioboard.Models.Mongo.MongoMessageModel> twtMessages = Repositories.TwitterRepository.GetUserNotifications(item.profileId, userId, _redisCache, _appSettings);
                    if (twtMessages != null)
                    {
                        lstTwtMessages.AddRange(twtMessages.OrderByDescending(t => t.messageDate).Skip(skip).Take(count));
                    }
                }
                else
                {
                    MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                    var builder = Builders<Domain.Socioboard.Models.Mongo.MongoMessageModel>.Sort;
                    var sort = builder.Descending(t => t.messageDate);
                    var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.profileId.Equals(item.profileId) && (t.type == Domain.Socioboard.Enum.MessageType.TwitterMention || t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet || t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower), sort, skip, count);
                    var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                    IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwitterTweets = task.Result;
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
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            string[] arrProfile = lstGrpProfiles.Select(t => t.profileId).ToArray();
            MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", _appSettings);
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => arrProfile.Contains(t.senderId) || arrProfile.Contains(t.recipientId));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwitterTweets = task.Result;
            lstTwitterTweets = lstTwitterTweets.GroupBy(y => y.senderId, (key, g) => g.OrderByDescending(t => t.createdDate).First()).OrderByDescending(p => p.createdDate).ToList<Domain.Socioboard.Models.Mongo.MongoDirectMessages>();
            lstTwitterTweets = lstTwitterTweets.Where(t => t.profileId != null).ToList();
            return Ok(lstTwitterTweets);
        }

        [HttpPost("TwitterReplyUpdate")]
        public IActionResult TwitterReplyUpdate(long groupId, long userId, string profileId, string messageId, string message, string screenName)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterReplyUpdate = Repositories.TwitterRepository.Post_ReplyStatusesUpdate(profileId, message, messageId, userId, groupId, dbr, _logger, _redisCache, _appSettings, screenName);
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

        [HttpGet("TwitterRecentFollower")]
        public IActionResult TwitterRecentFollower(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterRecentFollower> lstTwitterRecentFollower = Helper.TwitterHelper.TwitterRecentFollower(groupId, dbr, _appSettings);
            return Ok(lstTwitterRecentFollower);
        }

        [HttpGet("TwitterFollowerCount")]
        public IActionResult TwitterFollowerCount(long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterFollowerCount = Repositories.TwitterRepository.TwitterFollowerCount(userId, groupId, dbr, _redisCache);
            return Ok(TwitterFollowerCount);
        }

        [HttpGet("GetIncommingMessage")]
        public IActionResult GetIncommingMessage(long groupId, long userId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            return Ok(Repositories.TwitterRepository.GetIncommingMessage(userId, groupId, dbr, _redisCache, _appSettings));
        }

        [HttpGet("GetConversation")]
        public IActionResult GetConversation(string SenderId, string RecipientId)
        {
            MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", _appSettings);
            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoDirectMessages>((U => (U.senderId == SenderId && U.recipientId == RecipientId) || (U.senderId == RecipientId && U.recipientId == SenderId)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwitterTweetsConversation = task.Result;
            lstTwitterTweetsConversation = lstTwitterTweetsConversation.OrderBy(x => x.createdDate).ToList();
            return Ok(lstTwitterTweetsConversation);
        }


        [HttpPost("PostTwitterDirectmessage")]
        public IActionResult PostTwitterDirectmessage(string profileId, string SenderId, string RecipientId, string message, long UserId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string postmessage = "";
            string[] updatedmessgae = Regex.Split(message, "<br>");
            foreach (var item in updatedmessgae)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    //if (item.Contains("https://") || item.Contains("http://"))
                    //{
                    //    link = item;
                    //}
                    if (item.Contains("hhh") || item.Contains("nnn"))
                    {
                        if (item.Contains("hhh"))
                        {
                            postmessage = postmessage + "\n\r" + item.Replace("hhh", "#");
                        }
                    }
                    else
                    {
                        postmessage = postmessage + "\n\r" + item;
                    }
                }
            }
            message = postmessage;

            if (SenderId == profileId)
            {
                Helper.TwitterHelper.PostTwitterDirectmessage(RecipientId, message, profileId, UserId, dbr, _appSettings, _redisCache);
                return Ok();
            }
            else
            {
                Helper.TwitterHelper.PostTwitterDirectmessage(SenderId, message, profileId, UserId, dbr, _appSettings, _redisCache);
                return Ok();
            }
        }



        [HttpPost("PostTwtDirectmessage")]
        public IActionResult PostTwtDirectmessage(string profileId, string SenderId, string RecipientId, string message, long UserId,string recipientScreenName,string recipientImageUrl,string senderScreenName,string senderImageUrl)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string postmessage = "";
            string[] updatedmessgae = Regex.Split(message, "<br>");
            foreach (var item in updatedmessgae)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    //if (item.Contains("https://") || item.Contains("http://"))
                    //{
                    //    link = item;
                    //}
                    if (item.Contains("hhh") || item.Contains("nnn"))
                    {
                        if (item.Contains("hhh"))
                        {
                            postmessage = postmessage + "\n\r" + item.Replace("hhh", "#");
                        }
                    }
                    else
                    {
                        postmessage = postmessage + "\n\r" + item;
                    }
                }
            }
            message = postmessage;

            if (SenderId == profileId)
            {
                Helper.TwitterHelper.PostTwitterDirectmessage(RecipientId, message, profileId, UserId, dbr, _appSettings, _redisCache,  recipientScreenName,  recipientImageUrl,  senderScreenName,  senderImageUrl);
                return Ok();
            }
            else
            {
                Helper.TwitterHelper.PostTwitterDirectmessage(SenderId, message, profileId, UserId, dbr, _appSettings, _redisCache,  recipientScreenName,  recipientImageUrl,  senderScreenName,  senderImageUrl);
                return Ok();
            }
        }


        [HttpGet("TwitterMutual")]
        public IActionResult TwitterMutual(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterMutualFans> lstTwittermutualfans = Helper.TwitterHelper.twittermutual(groupId, dbr, _appSettings);
            return Ok(lstTwittermutualfans);
        }


        [HttpGet("Twitterfans")]
        public IActionResult Twitterfans(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterMutualFans> lstTwitterUserfans = Helper.TwitterHelper.twitterfans(groupId, dbr, _appSettings);
            return Ok(lstTwitterUserfans);
        }


        [HttpGet("TwitterUserFollowers")]
        public IActionResult TwitterUserFollowers(string profileId)
        {
            var dbr = new DatabaseRepository(_logger, _appEnv);
            var followers = Helper.TwitterHelper.twitterfollowerslist(profileId, dbr, _appSettings);
            return Ok(followers);
        }

        [HttpPost("BlocksUser")]
        public IActionResult BlocksUser(string profileId, string ToTwitterUserId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterRetweet_post = Helper.TwitterHelper.TwitterBlockUsers(profileId, ToTwitterUserId, dbr, _logger, _redisCache, _appSettings);
            return Ok(TwitterRetweet_post);
        }

        [HttpPost("UnBlocksUser")]
        public IActionResult UnBlocksUser(string profileId, string ToTwitterUserId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterRetweet_post = Helper.TwitterHelper.TwitterUnBlockUsers(profileId, ToTwitterUserId, dbr, _logger, _redisCache, _appSettings);
            return Ok(TwitterRetweet_post);
        }

        [HttpPost("FollowUser")]
        public IActionResult FollowUser(string profileId, string ToTwitterUserId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string TwitterRetweet_post = Helper.TwitterHelper.TwitterUserFollow(profileId, ToTwitterUserId, dbr, _logger, _redisCache, _appSettings);
            return Ok(TwitterRetweet_post);
        }

        [HttpPost("FriendRelationship")]
        public IActionResult FriendRelationship(string profileId, string ToTwitterUserId)
        {
            Domain.Socioboard.Models.TwitterFriendRelation lstRelationFriends = new Domain.Socioboard.Models.TwitterFriendRelation();
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            lstRelationFriends = Helper.TwitterHelper.TwitterFrindsRelation(profileId, ToTwitterUserId, dbr, _logger, _redisCache, _appSettings);
            return Ok(lstRelationFriends);
        }

        [HttpPost("ReportSpam")]
        public IActionResult ReportSpam(string profileId, string spamScreenName, long userId)
        {
            string userSpam_Status = string.Empty;
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            userSpam_Status = Repositories.TwitterRepository.TwitterSpam_user(profileId, spamScreenName, userId, dbr, _logger, _redisCache, _appSettings);
            return Ok(userSpam_Status);
        }

        [HttpPost("EmailMessage")]
        public IActionResult EmailMessage(string profileIdFrom, string socioTwitterId, long userId, string sub, string message, string toMail, string profileScnNameFrom)
        {
            string sendStatus = string.Empty;
            message = message.Replace("\n", "<br />");
            new Thread(delegate ()
            {
                _emailSender.SendMailSendGrid(_appSettings.getInTouchToMail, "", toMail, "", "", sub, message, _appSettings.SendgridUserName, _appSettings.SendGridPassword);
            }).Start();

            Repositories.TwitterRepository.AddTwitterEmailmessage(userId, socioTwitterId, profileIdFrom, profileScnNameFrom, toMail, message, sub, _redisCache, _appSettings);
            return Ok("SucCess");
        }

        [HttpGet("UserMentions")]
        public IActionResult UserMentions(string profileId, int skip, int count)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwtMessages = new List<Domain.Socioboard.Models.Mongo.MongoMessageModel>();

            MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
            var builder = Builders<Domain.Socioboard.Models.Mongo.MongoMessageModel>.Sort;
            var sort = builder.Descending(t => t.messageDate);
            var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.profileId == profileId && (t.type == Domain.Socioboard.Enum.MessageType.TwitterMention), sort, skip, count);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwitterTweets = task.Result;
            if (lstTwitterTweets != null)
            {
                lstTwtMessages.AddRange(lstTwitterTweets);
            }
            return Ok(lstTwtMessages.OrderByDescending(t => t.messageDate));
        }

        [HttpGet("TwitterContactSearch")]
        public IActionResult TwitterContactSearch(string profileId, string contact)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterContactSearch> lstfollowerlist = Helper.TwitterHelper.twitterConstactSearchlist(profileId, contact, dbr, _appSettings);
            return Ok(lstfollowerlist);
        }

        [HttpGet("TwitterUnfollowers")]
        public IActionResult TwitterUnfollowers(string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterMutualFans> lstfollowerlist = Helper.TwitterHelper.twitterUnfollowerslist(profileId, dbr, _appSettings);
            return Ok(lstfollowerlist);
        }

        [HttpGet("TwitterMentions")]
        public IActionResult TwitterMentions(string profileId)
        {
            DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterMentionSugg> lstMentionSugg = Helper.TwitterHelper.TwitterMentionBased(profileId, dbr, _logger, _redisCache, _appSettings);
            return Ok(lstMentionSugg);
        }
        [HttpGet("TwitterConversation")]
        public async Task<IActionResult> TwitterConversation(string profileId)
        {
            DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
            List<Domain.Socioboard.Models.TwitterMentionSugg> lstConveSugg = await Helper.TwitterHelper.TwitterConversation(profileId, dbr, _logger, _redisCache, _appSettings);
            return Ok(lstConveSugg);
        }

        [HttpGet("DeleteTwtFeed")]

        public IActionResult deleteTwtFeed(string profileId, string messageId)
        {
            MongoRepository _DeleteTwtFeeds = new MongoRepository("MongoTwitterFeed", _appSettings);
            var builders = Builders<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>.Filter;
            FilterDefinition<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> filter = builders.Eq("messageId", messageId);
            _DeleteTwtFeeds.Delete<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(filter);
            return Ok();
        }


        //[HttpGet("feeds")]
        //public IActionResult feeds(string profileId)
        //{
        //    oAuthTwitter OAuth = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
        //    DatabaseRepository dbr = new Model.DatabaseRepository(_logger, _appEnv);
        //    IList<Domain.Socioboard.Models.TwitterAccount> TwtAccounts =dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId== profileId).ToList();
        //    foreach (var item in TwtAccounts)
        //    {
        //        OAuth.AccessToken = item.oAuthToken;
        //        OAuth.AccessTokenSecret = item.oAuthSecret;
        //        OAuth.TwitterScreenName = item.twitterScreenName;
        //    }
        //    return Ok(Repositories.TwitterRepository.feedsss(profileId, OAuth.TwitterScreenName, OAuth, _logger, _appSettings));

        //}

        //[HttpGet("searchkeyword")]
        // public IActionResult searchkeyword(string profileId,string keyword)
        // {
        //     oAuthTwitter OAuth = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
        //     DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
        //     IList<Domain.Socioboard.Models.TwitterAccount> TwtAccounts = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == profileId).ToList();
        //     foreach (var item in TwtAccounts)
        //     {
        //         OAuth.AccessToken = item.oAuthToken;
        //         OAuth.AccessTokenSecret = item.oAuthSecret;
        //         OAuth.TwitterScreenName = item.twitterScreenName;
        //     }
        //     return Ok(Repositories.TwitterRepository.keywords(profileId, OAuth.TwitterScreenName, OAuth,keyword));

        // }

        [HttpGet("GettwitterSingle")]

        public IActionResult GettwitterSingle(string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            Domain.Socioboard.Models.TwitterAccount AccDetails = dbr.Single<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == profileId);
            return Ok(AccDetails);

        }

        [HttpPost("publish")]
        public IActionResult publish(string profileId, string twitterText, long userId, string imgUrl, string strid)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            string ret = Helper.TwitterHelper.PostTwitterMessage(_appSettings, _redisCache, twitterText, profileId, userId, imgUrl, true, 0, "", dbr, _logger);
            if (ret == "")
            {
                string responce = SavedFeedsManagementRepository.publish(profileId, strid, _appSettings);

                return Ok(responce);
            }
            else
            {
                return Ok("failed");
            }


        }

        [HttpGet("Notifications")]
        public IActionResult Notifications(long groupId, long userId, int skip, int count)
        {

            DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
            List<int> alldata = new List<int>();
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwtMessages = new List<Domain.Socioboard.Models.Mongo.MongoMessageModel>();
            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> TwtMessages = new List<Domain.Socioboard.Models.Mongo.MongoMessageModel>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoMessageModel>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.profileId.Equals(item.profileId) && (t.type == Domain.Socioboard.Enum.MessageType.TwitterMention || t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet || t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower || t.type == Domain.Socioboard.Enum.MessageType.TwitterUsertweet), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });

                IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwitterTweets = task.Result;

                TwtMessages = lstTwitterTweets.Where(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterUsertweet).ToList();
                if (lstTwitterTweets != null)
                {
                    lstTwtMessages.AddRange(lstTwitterTweets);
                }
                var d = lstTwitterTweets.Count;
            }
            int posttext = TwtMessages.FindAll(t => t.Message != null && t.mediaUrl == null && !t.Message.Contains("http") || !t.Message.Contains("https") || !t.Message.Contains("www.") || !t.Message.Contains("http://") || !t.Message.Contains("https://") || !t.Message.Contains("www.")).Count;
            int mediapost = TwtMessages.FindAll(t => t.mediaUrl != null).Count;
            int linkpost = TwtMessages.FindAll(t => t.Message.Contains("http") || t.Message.Contains("https") || t.Message.Contains("www.") || t.Message.Contains("http://") || t.Message.Contains("https://") || t.Message.Contains("www.")).Count;
            int mentions = lstTwtMessages.FindAll(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention).Count;
            int retweet = lstTwtMessages.FindAll(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet).Count;

            //  || t.Message.Contains("https") || t.Message.Contains("www.") || t.Message.Contains("http://") || t.Message.Contains("https://") || t.Message.Contains("www.")
            alldata.Add(mentions);
            alldata.Add(retweet);
            List<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwtMessagess = new List<Domain.Socioboard.Models.Mongo.MongoDirectMessages>();

            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter))
            {
                MongoRepository mongorepoDm = new MongoRepository("MongoDirectMessages", _appSettings);

                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoDirectMessages>.Sort;
                var sort = builder.Descending(t => t.entryDate);
                var result = mongorepoDm.FindWithRange<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => t.profileId.Equals(item.profileId) && (t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived || t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwitterdm = task.Result;
                if (lstTwitterdm != null)
                {
                    lstTwtMessagess.AddRange(lstTwitterdm);
                }

            }

            int dmrecived = lstTwtMessagess.FindAll(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived).Count;
            int dmsend = lstTwtMessagess.FindAll(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent).Count;
            alldata.Add(dmrecived);
            alldata.Add(dmsend);
            alldata.Add(posttext);
            alldata.Add(mediapost);
            alldata.Add(linkpost);
            return Ok(alldata);
        }


    }
}
