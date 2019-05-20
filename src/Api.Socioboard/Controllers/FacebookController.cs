using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Api.Socioboard.Model;
using Domain.Socioboard.Models;
using Facebook;
using System.Net;
using Domain.Socioboard.Helpers;
using MongoDB.Driver;
using Microsoft.AspNetCore.Hosting;
using Socioboard.Facebook.Data;
using Microsoft.AspNetCore.Cors;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Api.Socioboard.Controllers
{
    [EnableCors("AllowAll")]
    [Route("api/[controller]")]
    public class FacebookController : Controller
    {
        public FacebookController(ILogger<FacebookController> logger, Microsoft.Extensions.Options.IOptions<Helper.AppSettings> settings, IHostingEnvironment env)
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
        /// Add new Facebook Account
        /// </summary>
        /// <param name="accessToken"> Token obtained after successfull authentication from facebook. </param>
        /// <param name="groupId"> Id of the group to which account is to be added. </param>
        /// <param name="userId"> Id of the user. </param>
        /// <remarks>Add new facebook account.</remarks>
        /// <response code="400">Invalid Access Token.</response>
        /// <response code="500">Internal Server Erro.r</response>
        [HttpPost("AddFacebookAccount")]
        public IActionResult AddFacebookAccount(string accessToken, long groupId, long userId)
        {
            dynamic profile = FbUser.GetFbUser(accessToken);
            try
            {
                string x = Convert.ToString(profile);
                _logger.LogError(x);
            }
            catch { }
            if (Convert.ToString(profile) == "Invalid Access Token")
            {
                return Ok("Invalid Access Token");
            }
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.Facebookaccounts fbacc = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            List<Domain.Socioboard.Models.Groupprofiles> grpProfiles = Api.Socioboard.Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);



            //if (grpProfiles.First().profileId == fbacc.FbUserId)
            if (fbacc != null && fbacc.IsActive == true)
            {
                if (fbacc.UserId == userId)
                {
                    return Ok("Facebook account already added by you.");
                }
                return Ok("Facebook account added by other user.");
            }
            else
            {
                Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == userId && t.id == groupId).FirstOrDefault();
                if (ngrp == null)
                {
                    return Ok("Wrong Group Id");
                }
                // Adding Facebook Profile
                int res = Api.Socioboard.Repositories.FacebookRepository.AddFacebookAccount(profile, FbUser.GetFbFriends(accessToken), dbr, userId, ngrp.id, Domain.Socioboard.Enum.FbProfileType.FacebookProfile, accessToken, _redisCache, _appSettings, _logger);
                if (res == 1)
                {
                    return Ok("Facebook account Added Successfully");
                }
                else
                {
                    return Ok("Error while Adding Account");
                }
            }
        }


        [HttpPost("ReconnectFbAccount")]
        public IActionResult ReconnectFbAccount(string accessToken, long groupId, long userId, string reconnect, string profileId)
        {

            dynamic profile = FbUser.GetFbUser(accessToken);


            try
            {
                string x = Convert.ToString(profile);
                _logger.LogError(x);
            }
            catch { }
            if (Convert.ToString(profile) == "Invalid Access Token")
            {
                return Ok("Invalid Access Token");
            }
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.Facebookaccounts fbacc = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            Domain.Socioboard.Models.Facebookaccounts fbaccw = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(profileId, _redisCache, dbr);
            //fbacc = fbacc.Where(t => t.FbUserId.Contains("127471161024815")).ToList();

            try
            {
                if (fbacc.FbUserId == profileId)
                {
                    if (fbacc != null && fbacc.IsActive == true)
                    {
                        if (fbacc.UserId == userId)
                        {
                            Groups ngrp = dbr.Find<Domain.Socioboard.Models.Groups>(t => t.adminId == userId && t.id == groupId).FirstOrDefault();
                            if (ngrp == null)
                            {
                                return Ok("Wrong Group Id");
                            }
                            int res = Api.Socioboard.Repositories.FacebookRepository.ReFacebookAccount(profile, FbUser.GetFbFriends(accessToken), dbr, userId, ngrp.id, Domain.Socioboard.Enum.FbProfileType.FacebookProfile, accessToken, reconnect, _redisCache, _appSettings, _logger);
                            if (res == 1)
                            {

                                MongoRepository repofb = new MongoRepository("FacebookPasswordChangeUserDetail", _appSettings);
                                try
                                {
                                    var result = repofb.Find<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(t => t.profileId == fbacc.FbUserId);
                                    var task = Task.Run(async () =>
                                    {
                                        return await result;
                                    });
                                    int count = task.Result.Count;

                                    IList<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail> lstFbFeeds = task.Result;
                                    if (count > 0)
                                    {
                                        FilterDefinition<BsonDocument> filter = new BsonDocument("profileId", lstFbFeeds.FirstOrDefault().profileId);
                                        var update = Builders<BsonDocument>.Update.Set("status", true);
                                        repofb.Update<Domain.Socioboard.Models.Mongo.FacebookPasswordChangeUserDetail>(update, filter);

                                    }
                                }
                                catch (Exception ex)
                                {

                                }

                                return Ok("Facebook account Reconnect Successfully");


                            }
                            else
                            {
                                return Ok("Error while Reconnecting Account");
                            }
                        }

                    }
                }
                else
                {
                    return Ok("Oops! login information is wrong , login the profile which has to be reconnected");
                }
            }
            catch (Exception ex)
            {
                return Ok("Oops! login information is wrong , login the profile which has to be reconnected");
            }



            return Ok();

        }

        [HttpPost("ComposeMessage")]
        public IActionResult ComposeMessage(string message, string profileId, long userId, string imagePath, string link)
        {
            if (profileId != null)
            {
                string[] lstProfileIds = profileId.Split(',');
                profileId = lstProfileIds[0];
            }
            else
            {
                return Ok("profileId required");
            }
            string ret = "";
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.Facebookaccounts objFacebookAccount = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(profileId, _redisCache, dbr);

            FacebookClient fb = new FacebookClient();
            fb.AccessToken = objFacebookAccount.AccessToken;
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            var args = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(message))
            {
                args["message"] = message;
            }
            args["privacy"] = FbUser.SetPrivacy("Public", fb, profileId);


            try
            {
                if (!string.IsNullOrEmpty(imagePath))
                {
                    Uri u = new Uri(imagePath);
                    string filename = string.Empty;
                    string extension = string.Empty;
                    extension = System.IO.Path.GetExtension(u.AbsolutePath).Replace(".", "");
                    var media = new FacebookMediaObject
                    {
                        FileName = "filename",
                        ContentType = "image/" + extension
                    };
                    //byte[] img = System.IO.File.ReadAllBytes(imagepath);
                    var webClient = new WebClient();
                    byte[] img = webClient.DownloadData(imagePath);
                    media.SetValue(img);
                    args["source"] = media;
                    ret = fb.Post("v2.7/" + objFacebookAccount.FbUserId + "/photos", args).ToString();
                }
                else
                {
                    if (!string.IsNullOrEmpty(link))
                    {
                        args["link"] = link;
                    }
                    ret = fb.Post("v2.7/" + objFacebookAccount.FbUserId + "/feed", args).ToString();

                }
                ScheduledMessage scheduledMessage = new ScheduledMessage();
                scheduledMessage.createTime = DateTime.UtcNow;
                scheduledMessage.picUrl = imagePath;
                scheduledMessage.profileId = profileId;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.Facebook;
                scheduledMessage.scheduleTime = DateTime.UtcNow;
                scheduledMessage.shareMessage = message;
                scheduledMessage.userId = userId;
                scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                scheduledMessage.url = ret;
                dbr.Add<ScheduledMessage>(scheduledMessage);

                ret = "success";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                ret = "failure";
            }

            return Ok(ret);
        }

        /// <summary>
        /// Get feeds of a facebook profile  
        /// </summary>
        /// <param name="profileId"> Token obtained after successfull authentication from facebook. </param>
        /// <param name="userId"> Id of the user </param>
        /// <param name="skip"> Id of the group to which account is to be added. </param>
        /// <param name="count"> Id of the group to which account is to be added. </param>
        /// <remarks>Insert new student</remarks>
        /// <response code="400">Invalid Access Token</response>
        /// <response code="500">Internal Server Error</response>
        [HttpGet("GetFeeds")]
        public IActionResult GetFeeds(string profileId, long userId, int skip, int count)
        {
            if (skip + count < 100)
            {
                return Ok(Repositories.FacebookRepository.GetTopFeeds(profileId, userId, _redisCache, _appSettings).Skip(skip).Take(count));
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);
                var builder = Builders<MongoFacebookFeed>.Sort;
                var sort = builder.Descending(t => t.EntryDate);
                var result = mongorepo.FindWithRange(t => t.ProfileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoFacebookFeed> lstFbFeeds = task.Result;
            }
            return Ok();
        }
        [HttpGet("Shortfeeds")]
        public IActionResult Shortfeeds(string profileId, long userId, int skip, int count, string typeShort)
        {
            return Ok(Repositories.FacebookRepository.GetFacebookSort(profileId, userId, _redisCache, _appSettings, skip, count, typeShort));
        }

        [HttpGet("GetTopFeeds")]
        public IActionResult GetTopFeeds(string profileId, long userId, int skip, int count)
        {
            if (skip + count < 100)
            {
                return Ok(Repositories.FacebookRepository.GetTopFacebookFeed(profileId, userId, _redisCache, _appSettings, skip, count));
            }
            else
            {
                List<Domain.Socioboard.Models.Mongo.facebookfeed> lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.facebookfeed>();
                MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);
                var builder = Builders<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>.Sort;
                var sort = builder.Descending(t => t.EntryDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, skip, count);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;

                foreach (var item in lstFbFeeds.ToList())
                {
                    Domain.Socioboard.Models.Mongo.facebookfeed _intafeed = new Domain.Socioboard.Models.Mongo.facebookfeed();
                    MongoRepository mongorepocomment = new MongoRepository("MongoFbPostComment", _appSettings);
                    var buildecommentr = Builders<Domain.Socioboard.Models.Mongo.MongoFbPostComment>.Sort;
                    var sortcomment = buildecommentr.Descending(t => t.Likes);
                    var resultcomment = mongorepocomment.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == item.FeedId, sortcomment, skip, 5);
                    var taskcomment = Task.Run(async () =>
                    {
                        return await resultcomment;
                    });
                    IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = taskcomment.Result;
                    lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                    _intafeed._facebookFeed = item;
                    _intafeed._facebookComment = lstFbPostComment.ToList();
                    lstfacebookfeed.Add(_intafeed);
                }
                return Ok(lstfacebookfeed.ToList());

            }
            // return Ok();
        }

        [HttpGet("GetLatestFeeds")]
        public IActionResult GetLatestFeeds(string profileId, long userId, int skip, int count, string date)
        {
            DateTime lastfeeddate = Convert.ToDateTime(date);
            DateTime currentdate = DateTime.UtcNow;
            //Int32 unixTimestamp= Convert.ToInt32(date);
            List<Domain.Socioboard.Models.Mongo.facebookfeed> lstfacebookfeed = new List<Domain.Socioboard.Models.Mongo.facebookfeed>();
            MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", _appSettings);
            var builder = Builders<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>.Sort;
            var sort = builder.Descending(t => t.EntryDate);
            var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, skip, count);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;
            List<Domain.Socioboard.Models.Mongo.LatestFacebookFeed> lstlatestfeed = new List<Domain.Socioboard.Models.Mongo.LatestFacebookFeed>();
            lstlatestfeed = lstFbFeeds.Select(x => new LatestFacebookFeed() { EntryDate = Convert.ToDateTime(x.EntryDate), FeedDescription = x.FeedDescription, FeedDate = x.FeedDate, ProfileId = x.ProfileId, FromId = x.FromId, FromName = x.FromName, FromProfileUrl = x.FromProfileUrl, Type = x.Type, FbComment = x.FbComment, FbLike = x.FbLike, FeedId = x.FeedId, ReadStatus = x.ReadStatus, Picture = x.Picture, Positive = x.Positive, Negative = x.Negative, Commentcount = x.Commentcount, Likecount = x.Likecount, postType = x.postType, postingFrom = x.postingFrom, _facebookComment = x._facebookComment }).ToList();
            lstlatestfeed = lstlatestfeed.FindAll(t => t.EntryDate > lastfeeddate && t.EntryDate <= currentdate).ToList();
            return Ok(lstlatestfeed.ToList());

        }

        [HttpGet("GetTopFilterFeeds")]
        public IActionResult GetTopFilterFeeds(string profileId, long userId, int skip, int count, string typeFilter)
        {
            return Ok(Repositories.FacebookRepository.GetTopFacebookFilterFeed(profileId, userId, _redisCache, _appSettings, skip, count, typeFilter));
        }



        [HttpGet("GetFacebookProfiles")]
        public IActionResult GetFacebookProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = new List<Facebookaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage))
            {
                Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(item.profileId, _redisCache, dbr);
                if (fbAcc != null)
                {
                    lstFbAcc.Add(fbAcc);
                }
            }
            return Ok(lstFbAcc);
        }

        [HttpGet("GetAllFacebookProfiles")]
        public IActionResult GetAllFacebookProfiles(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = new List<Facebookaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookPublicPage))
            {
                Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(item.profileId, _redisCache, dbr);
                if (fbAcc != null)
                {
                    lstFbAcc.Add(fbAcc);
                }
            }
            return Ok(lstFbAcc);
        }

        [HttpGet("GetFacebookProfilesOnlyforReconn")]
        public IActionResult GetFacebookProfilesOnlyforReconn(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = new List<Facebookaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook))
            {
                Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(item.profileId, _redisCache, dbr);
                Domain.Socioboard.Models.User userdata = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == fbAcc.UserId);
                if (fbAcc != null)
                {
                    lstFbAcc.Add(fbAcc);
                }
            }
            return Ok(lstFbAcc);
        }

        [HttpGet("GetFacebookProfilesOnly")]
        public IActionResult GetFacebookProfilesOnly(long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = new List<Facebookaccounts>();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook))
            {
                Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(item.profileId, _redisCache, dbr);
                Domain.Socioboard.Models.User userdata = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == fbAcc.UserId);
                if (fbAcc != null && userdata.EmailId != fbAcc.EmailId)
                {
                    lstFbAcc.Add(fbAcc);
                }
            }
            return Ok(lstFbAcc);
        }

        [HttpGet("GetPrimaryFacebookAcc")]
        public IActionResult GetPrimaryFacebookAcc(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
            //List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = new List<Facebookaccounts>();
            Domain.Socioboard.Models.Facebookaccounts UserFbAccDetail = new Facebookaccounts();
            foreach (var item in lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook))
            {
                Domain.Socioboard.Models.Facebookaccounts fbAcc = Repositories.FacebookRepository.getFacebookAccount(item.profileId, _redisCache, dbr);
                Domain.Socioboard.Models.User userdata = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == fbAcc.UserId);
                if (fbAcc != null && userdata.EmailId == fbAcc.EmailId)
                {
                    UserFbAccDetail = fbAcc;
                }
            }
            return Ok(UserFbAccDetail);
        }

        [HttpPost("GetFacebookPages")]
        public IActionResult GetFacebookPages(string accesstoken, long groupId)
        {
            try
            {
                List<Domain.Socioboard.Models.Facebookpage> lstpages = new List<Facebookpage>();
                lstpages = Fbpages.Getfacebookpages(accesstoken);
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.GetAllGroupProfiles(groupId, _redisCache, dbr);
                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
                string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0)
                {
                    lstpages.Where(t => lstStr.Contains(t.ProfilePageId)).Select(s => { s.connected = 1; return s; }).ToList();
                }
                return Ok(lstpages);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetFacebookPages" + ex.StackTrace);
                _logger.LogError("GetFacebookPages" + ex.Message);
                return Ok(new List<Domain.Socioboard.Models.Facebookpage>());
            }
        }



        [HttpPost("AddFacebookPages")]
        public IActionResult AddFacebookPages(long userId, long groupId)
        {

            try
            {
                string data = Request.Form["profileaccesstoken"];

                var pages = JArray.Parse($"[{data}]");

                var pageDetails = new List<Facebookaccounts>();

                foreach (var page in pages)
                {
                    try
                    {
                        var facebookAccount = new Facebookaccounts
                        {
                            AccessToken = page.SelectToken("AccessToken").ToString(),
                            FbUserId = page.SelectToken("ProfilePageId").ToString(),
                            Friends = long.Parse(page.SelectToken("LikeCount").ToString()),
                            FbUserName = page.SelectToken("Name").ToString(),
                            EmailId = page.SelectToken("Email").ToString(),
                        };
                        facebookAccount.CoverPic = $"https://graph.facebook.com/{facebookAccount.FbUserId}/picture?type=small";
                        facebookAccount.ProfileUrl = $"https://graph.facebook.com/{facebookAccount.FbUserId}/picture?type=small";
                        pageDetails.Add(facebookAccount);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                }

                var pageIds = pageDetails.Select(x => x.FbUserId).ToList();

                var dbr = new DatabaseRepository(_logger, _env);

                var availableAccounts = Repositories.FacebookRepository.GetFacebookAccounts(pageIds, _redisCache, dbr).Select(x => x.FbUserId).ToList();

                pageDetails.RemoveAll(x => availableAccounts.Contains(x.FbUserId));

                CustomTaskFactory.Instance.Start(() =>
                {
                    var groupDetails = dbr.FindFirstMatch<Groups>(t => t.adminId == userId && t.id == groupId);

                    if (groupDetails == null)
                        return;

                    foreach (var page in pageDetails)
                    {
                        Repositories.FacebookRepository.AddFacebookPage(page, dbr, userId, groupDetails.id, Domain.Socioboard.Enum.FbProfileType.FacebookPage, page.AccessToken, _redisCache, _appSettings, _logger);
                    }
                });

                if (availableAccounts.Count == 0)
                    return Ok("All Pages added successfully!");

                if (availableAccounts.Count == pageDetails.Count)
                    return Ok("All Pages already added!");


                if (availableAccounts.Count < pageDetails.Count)
                {
                    var remainding = pageDetails.Count - availableAccounts.Count;
                    return Ok($"Totally {remainding} Pages added, Rest already added either by you or others!");
                }
                return Ok("Pages added!");
            }
            catch (Exception)
            {              
                return Ok("Error while adding pages");
            } 
        }


        [HttpPost("GetFacebookPagesDet")]
        public IActionResult GetFacebookPagesDet(string accesstoken, long groupId)
        {
            try
            {
                List<Domain.Socioboard.Models.Facebookpage> lstpages = new List<Facebookpage>();
                lstpages = Fbpages.Getfacebookpages(accesstoken);
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                List<Domain.Socioboard.Models.Groupprofiles> lstGrpProfiles = Repositories.GroupProfilesRepository.getGroupProfiles(groupId, _redisCache, dbr);
                lstGrpProfiles = lstGrpProfiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
                string[] lstStr = lstGrpProfiles.Select(t => t.profileId).ToArray();
                if (lstStr.Length > 0)
                {
                    lstpages.Where(t => lstStr.Contains(t.ProfilePageId)).ToList();
                }
                return Ok(lstpages);
            }
            catch (Exception ex)
            {
                _logger.LogError("GetFacebookPages" + ex.StackTrace);
                _logger.LogError("GetFacebookPages" + ex.Message);
                return Ok(new List<Domain.Socioboard.Models.Facebookpage>());
            }
        }

        [HttpPost("ReconnFacebookPages")]
        public IActionResult ReconnFacebookPages(long userId, long groupId, string accessToken)
        {


            int invalidaccessToken = 0;
            dynamic profile = Fbpages.GetFbPageData(accessToken);
            string subscribed_apps = Fbpages.subscribed_apps(accessToken, Convert.ToString(profile["id"]));
            try
            {
                string x = Convert.ToString(profile);
                _logger.LogError(x);
            }
            catch { }
            if (Convert.ToString(profile) == "Invalid Access Token")
            {
                invalidaccessToken++;
            }
            else
            {
                DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
                Domain.Socioboard.Models.Facebookaccounts fbacc = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);

                int isSaved = 0;
                if (fbacc != null)
                {
                    fbacc.IsActive = true;
                    fbacc.UserId = userId;
                    fbacc.Is90DayDataUpdated = false;
                    try
                    {
                        fbacc.Friends = (Convert.ToInt64(profile["fan_count"]));
                    }
                    catch (Exception)
                    {
                        fbacc.Friends = 0;
                    }
                    try
                    {
                        fbacc.CoverPic = (Convert.ToString(profile["cover"]["source"]));
                    }
                    catch (Exception)
                    {

                    }
                    fbacc.AccessToken = accessToken;
                    isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbacc);
                    if (isSaved > 0)
                    {
                        return Ok("Page Reconnected Successfully");
                    }
                    else
                    {
                        return Ok("some thing went wrong");
                    }
                }
            }
            return Ok("Page reconnect successfully");
        }

        [HttpGet("GetFacebookPostComment")]
        public IActionResult GetFacebookPostComment(string postId)
        {
            List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = Repositories.FacebookRepository.GetFbPostComment(postId, _redisCache, _appSettings);
            return Ok(lstFbPostComment);
        }

        [HttpPost("PostFacebookComment")]
        public IActionResult PostFacebookComment(string postId, string profileId, string message, string timezoneOffset)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string postcomment = Repositories.FacebookRepository.PostFacebookComment(dbr, message, profileId, postId, timezoneOffset, _redisCache, _appSettings, _logger);
            if (postcomment.Contains("Invalid Access Token"))
            {
                return Ok("Invalid Access Token");
            }
            if (!string.IsNullOrEmpty(postcomment))
            {
                return Ok("Posted");
            }
            else
            {
                return Ok("Not Posted");
            }
        }

        [HttpGet("GetFacebookGroup")]
        public IActionResult GetFacebookGroup(string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            List<Domain.Socioboard.Models.FacebookGroup> lstFacebookGroup = Repositories.FacebookRepository.GetAllFacebookGroups(profileId, _redisCache, _appSettings, dbr);
            return Ok(lstFacebookGroup);
        }

        [HttpGet("FacebookfanPageCount")]
        public IActionResult FacebookfanPageCount(long userId, long groupId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            string FacebookfanPageCount = Repositories.FacebookRepository.FacebookfanPageCount(userId, groupId, dbr, _redisCache);
            return Ok(FacebookfanPageCount);
        }

        [HttpGet("AddFacebookPagesByUrl")]
        public IActionResult AddFacebookPagesByUrl(long userId, long groupId, string url)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.Facebookpage _facebookpages = Helper.FacebookHelper.GetFbPageDetails(url, _appSettings);

            Domain.Socioboard.Models.Facebookaccounts fbacc = Api.Socioboard.Repositories.FacebookRepository.getFacebookAccount(_facebookpages.ProfilePageId, _redisCache, dbr);
            if (fbacc != null && fbacc.IsActive == true)
            {
                return Ok("Facebook Page added by other user");
            }
            if (_facebookpages != null)
            {
                int adddata = Repositories.FacebookRepository.AddFacebookPagesByUrl(_facebookpages, dbr, userId, groupId, Domain.Socioboard.Enum.FbProfileType.FacebookPublicPage, _facebookpages.AccessToken, _redisCache, _appSettings, _logger);
                if (adddata == 1)
                {
                    return Ok("added successfully");
                }
                else
                {
                    return Ok("issue in adding");
                }
            }
            else
            {
                return Ok("issue while hiting api");
            }
        }

        [HttpGet("fbtype")]
        public IActionResult Fbtype(string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            IList<Domain.Socioboard.Models.Facebookaccounts> Userdata = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(profileId));
            return Ok(Userdata);

        }

        [HttpGet("GetFbAccSingle")]
        public IActionResult GetFbAccSingle(string accId)
        {
            DatabaseRepository dbr = new DatabaseRepository(_logger, _env);
            Domain.Socioboard.Models.Facebookaccounts pageDetails = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == accId);
            return Ok(pageDetails);
        }

    }
}
