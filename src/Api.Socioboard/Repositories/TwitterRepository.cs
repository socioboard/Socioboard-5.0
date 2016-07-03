using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TimeLineMethods;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using Socioboard.Twitter.Twitter.Core.UserMethods;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class TwitterRepository
    {
        public static Domain.Socioboard.Models.TwitterAccount getTwitterAccount(string twitterUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.TwitterAccount inMemTwitterAcc = _redisCache.Get<Domain.Socioboard.Models.TwitterAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + twitterUserId);
                if (inMemTwitterAcc != null)
                {
                    return inMemTwitterAcc;
                }
            }
            catch { }

            List<Domain.Socioboard.Models.TwitterAccount> lstTwitterAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(twitterUserId)).ToList();
            if (lstTwitterAcc != null && lstTwitterAcc.Count() > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + twitterUserId, lstTwitterAcc.First());
                return lstTwitterAcc.First();
            }
            else
            {
                return null;
            }



        }

        public static string AddTwitterAccount(long userId, long groupId, Model.DatabaseRepository dbr, oAuthTwitter OAuth, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            string twitterUserId = string.Empty;
            Users userinfo = new Users();
            JArray profile = userinfo.Get_Users_LookUp_ByScreenName(OAuth, OAuth.TwitterScreenName);
            Domain.Socioboard.Models.TwitterAccount twitterAccount = new Domain.Socioboard.Models.TwitterAccount();
            TwitterUser twtuser;
            var item = profile[0];
            try
            {
                twitterUserId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
            }
            catch (Exception er)
            {
                try
                {
                    twitterUserId = item["id"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                _logger.LogError(er.StackTrace);
            }
            if (twitterUserId != null)
            {
                twitterAccount = Api.Socioboard.Repositories.TwitterRepository.getTwitterAccount(twitterUserId, _redisCache, dbr);
                if (twitterAccount != null && twitterAccount.isActive == true)
                {
                    return "This Account is added by some body else.";
                }
            }
            else
            {
                return "Issue while fetching twitter userId";
            }

            if (twitterAccount != null)
            {
                twitterAccount.twitterUserId = twitterUserId;

                try
                {
                    twitterAccount.followingCount = Convert.ToInt64(item["friends_count"].ToString());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.followersCount = Convert.ToInt64(item["followers_count"].ToString());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                twitterAccount.isActive = true;
                twitterAccount.oAuthSecret = OAuth.AccessTokenSecret;
                twitterAccount.oAuthToken = OAuth.AccessToken;
                try
                {
                    twitterAccount.profileImageUrl = item["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);

                }
                try
                {
                    twitterAccount.profileBackgroundImageUrl = item["profile_background_image_url_https"].ToString().TrimStart('"').TrimEnd('"');

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);

                }
                try
                {
                    twitterAccount.profileUrl = string.Empty;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.location = item["location"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.description = item["description"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.twitterScreenName = item["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                twitterAccount.userId = userId;

                int isSaved = dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twitterAccount);
                if (isSaved == 1)
                {
                    List<Domain.Socioboard.Models.TwitterAccount> lsttwtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(twitterUserId)).ToList();
                    if (lsttwtAcc != null && lsttwtAcc.Count() > 0)
                    {
                        isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lsttwtAcc.First().twitterUserId, lsttwtAcc.First().twitterScreenName, userId, lsttwtAcc.First().profileImageUrl, Domain.Socioboard.Enum.SocialProfileType.Twitter, dbr);
                        if (isSaved == 1)
                        {
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);

                            new Thread(delegate ()
                            {
                                //todo : codes to update feeds 
                                SaveTwitterMessages(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                SaveUserRetweets(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                SaveUserTweets(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                SaveTwitterFeeds(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                SaveTwitterDirectMessageSent(OAuth, _logger, _appSettings);
                                SaveTwittwrDirectMessageRecieved(OAuth, _logger, _appSettings);
                            }).Start();

                            return "Added_Successfully";
                        }

                    }
                }
            }
            else
            {
                twitterAccount = new Domain.Socioboard.Models.TwitterAccount();
                twitterAccount.twitterUserId = twitterUserId;
                try
                {
                    twitterAccount.followingCount = Convert.ToInt64(item["friends_count"].ToString());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.followersCount = Convert.ToInt64(item["followers_count"].ToString());
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                twitterAccount.isActive = true;
                twitterAccount.oAuthSecret = OAuth.AccessTokenSecret;
                twitterAccount.oAuthToken = OAuth.AccessToken;
                try
                {
                    twitterAccount.profileImageUrl = item["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);

                }
                try
                {
                    twitterAccount.location = item["location"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.description = item["description"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.profileUrl = string.Empty;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.twitterScreenName = item["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                }
                try
                {
                    twitterAccount.profileBackgroundImageUrl = item["profile_background_image_url_https"].ToString().TrimStart('"').TrimEnd('"');

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);

                }
                twitterAccount.userId = userId;
                int isSaved = dbr.Add<Domain.Socioboard.Models.TwitterAccount>(twitterAccount);
                if (isSaved == 1)
                {
                    List<Domain.Socioboard.Models.TwitterAccount> lsttwtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(twitterUserId)).ToList();
                    if (lsttwtAcc != null && lsttwtAcc.Count() > 0)
                    {
                        isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lsttwtAcc.First().twitterUserId, lsttwtAcc.First().twitterScreenName, userId, lsttwtAcc.First().profileImageUrl, Domain.Socioboard.Enum.SocialProfileType.Twitter, dbr);
                        if (isSaved == 1)
                        {
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                            _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                            new Thread(delegate ()
                            {
                                //todo : codes to update feeds 
                                SaveTwitterMessages(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                SaveUserRetweets(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                SaveUserTweets(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                SaveTwitterFeeds(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                SaveTwitterDirectMessageSent(OAuth, _logger, _appSettings);
                                SaveTwittwrDirectMessageRecieved(OAuth, _logger, _appSettings);

                            }).Start();

                            return "Added_Successfully";
                        }
                    }
                }


            }

            return "Error while Adding Account";
        }

        public static string DeleteProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache)
        {
            Domain.Socioboard.Models.TwitterAccount twtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(profileId) && t.userId == userId).FirstOrDefault();
            if (twtAcc != null)
            {
                twtAcc.isActive = false;
                dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twtAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount  + profileId);
                return "Deleted";
            }
            else
            {
                return "Account Not Exist";
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> GetTopFeeds(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", settings);
                var builder = Builders<MongoTwitterFeed>.Sort;
                var sort = builder.Descending(t => t.feedDate);
                var result = mongorepo.FindWithRange<MongoTwitterFeed>(t => t.profileId.Equals(profileId), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoTwitterFeed> lstFbFeeds = task.Result;

                if (lstFbFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstFbFeeds.ToList());

                    return lstFbFeeds.ToList();
                }

                return null;
            }

        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> GetUserTweets(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Tweets + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", settings);
                var builder = Builders<MongoTwitterMessage>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<MongoTwitterMessage>(t => t.profileId.Equals(profileId), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoTwitterMessage> lstTwtTweets = task.Result;

                if (lstTwtTweets != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Tweets + profileId, lstTwtTweets.ToList());

                    return lstTwtTweets.ToList();
                }

                return null;
            }

        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> GetUserNotifications(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Notifications + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", settings);
                var builder = Builders<MongoTwitterMessage>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<MongoTwitterMessage>(t => t.profileId.Equals(profileId) &&( t.type==Domain.Socioboard.Enum.TwitterMessageType.TwitterMention || t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoTwitterMessage> lstTwtTweets = task.Result;

                if (lstTwtTweets != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Notifications + profileId, lstTwtTweets.ToList());

                    return lstTwtTweets.ToList();
                }

                return null;
            }

        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> GetTwitterDirectMessages(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100DirectMessage + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages", settings);
                var builder = Builders<MongoTwitterDirectMessages>.Sort;
                var sort = builder.Descending(t => t.createdDate);
                var result = mongorepo.FindWithRange<MongoTwitterDirectMessages>(t => t.senderId.Equals(profileId) && (t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageSent || t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageReceived), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoTwitterDirectMessages> lstTwtTweets = task.Result;

                if (lstTwtTweets != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100DirectMessage + profileId, lstTwtTweets.ToList());

                    return lstTwtTweets.ToList();
                }

                return null;
            }

        }



        public static void SaveTwitterMessages(string profileId, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {

            TwitterUser twtuser;
            twtuser = new TwitterUser();
            try
            {
                TimeLine tl = new TimeLine();
                JArray data = null;
                try
                {
                    data = tl.Get_Statuses_Mentions_Timeline(oAuth);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    _logger.LogError("tl.Get_Statuses_Mentions_Timeline ex.StackTrace >> " + ex.StackTrace);
                    _logger.LogError("tl.Get_Statuses_Mentions_Timeline ex.Message >> " + ex.Message);
                }
                Domain.Socioboard.Models.Mongo.MongoTwitterMessage objTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                foreach (var item in data)
                {
                    //objTwitterMessage.UserId = Guid.Parse(UserId);
                    objTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterMention;
                    objTwitterMessage.id = MongoDB.Bson.ObjectId.GenerateNewId();

                    try
                    {
                        objTwitterMessage.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objTwitterMessage.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.twitterMsg = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.profileId = profileId;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.screenName = item["user"]["screen_name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", _appSettings);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("tl.Get_Statuses_Mentions_Timeline ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("tl.Get_Statuses_Mentions_Timeline ex.Message >> " + ex.Message);
            }
        }

        public static void SaveUserRetweets(string profileId, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            TwitterUser twtuser;
            twtuser = new TwitterUser();
            try
            {
                JArray Retweet = null;
                try
                {
                    Retweet = twtuser.GetStatuses_Retweet_Of_Me(oAuth);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.StackTrace);
                    _logger.LogError("twtuser.GetStatuses_Retweet_Of_Me ex.StackTrace >> " + ex.StackTrace);
                    _logger.LogError("twtuser.GetStatuses_Retweet_Of_Me ex.Message >> " + ex.Message);
                }
                Domain.Socioboard.Models.Mongo.MongoTwitterMessage objTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                foreach (var item in Retweet)
                {
                    //objTwitterMessage.UserId = Guid.Parse(UserId);
                    objTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet;
                    objTwitterMessage.id = ObjectId.GenerateNewId();

                    try
                    {
                        objTwitterMessage.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objTwitterMessage.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.twitterMsg = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.profileId = profileId;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", _appSettings);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Retweet_Of_Me ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Retweet_Of_Me ex.Message >> " + ex.Message);
            }
        }

        public static void SaveUserTweets(string profileId, string screenName, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            try
            {
                TwitterUser twtuser = new TwitterUser();
                JArray Timeline = twtuser.GetStatuses_User_Timeline(oAuth);
                foreach (var item in Timeline)
                {
                    Domain.Socioboard.Models.Mongo.MongoTwitterMessage objTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
                    objTwitterMessage.id = ObjectId.GenerateNewId();
                    objTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterUsertweet;
                    try
                    {
                        objTwitterMessage.twitterMsg = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.screenName = screenName;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.profileId = profileId;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objTwitterMessage.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.fromName = item["user"]["name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterMessage.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterMessage.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", _appSettings);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(objTwitterMessage);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_User_Timeline ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_User_Timeline ex.Message >> " + ex.Message);
            }
        }

        public static void SaveTwitterFeeds(string profileId, string screenName, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            TwitterUser twtuser;
            twtuser = new TwitterUser();
            try
            {
                JArray Home_Timeline = twtuser.GetStatuses_Home_Timeline(oAuth);
                Domain.Socioboard.Models.Mongo.MongoTwitterFeed objTwitterFeed = new Domain.Socioboard.Models.Mongo.MongoTwitterFeed();
                foreach (var item in Home_Timeline)
                {
                    objTwitterFeed.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterFeed;
                    try
                    {
                        objTwitterFeed.feed = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.screenName = screenName;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.profileId = profileId;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objTwitterFeed.feedDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.Id = ObjectId.GenerateNewId();
                        objTwitterFeed.strId = ObjectId.GenerateNewId().ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.fromName = item["user"]["name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterFeed.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterFeed.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterFeed.mediaUrl = item["extended_entities"]["media"][0]["media_url"].ToString();
                    }
                    catch (Exception ex)
                    {
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", _appSettings);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(objTwitterFeed);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Home_Timeline ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Home_Timeline ex.Message >> " + ex.Message);
            }
        }



        public static void SaveTwitterDirectMessageSent(oAuthTwitter OAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            #region Add Twitter Direct Message
            TwitterUser twtuser = new TwitterUser();
            try
            {
                JArray Messages_Sent = twtuser.GetDirect_Messages_Sent(OAuth, 20);

                Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages objTwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();
                foreach (var item in Messages_Sent)
                {
                    objTwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageSent;
                    objTwitterDirectMessages.id = ObjectId.GenerateNewId();

                    try
                    {
                        objTwitterDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objTwitterDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages", _appSettings);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(objTwitterDirectMessages);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetDirect_Messages_Sent ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetDirect_Messages_Sent ex.Message >> " + ex.Message);
            }
            #endregion
        }


        public static void SaveTwittwrDirectMessageRecieved(oAuthTwitter OAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            #region Add Twitter Direct Message
            TwitterUser twtuser = new TwitterUser();
            try
            {
                JArray Messages_Sent = twtuser.GetDirect_Messages(OAuth, 20);

                Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages objTwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();
                foreach (var item in Messages_Sent)
                {
                    objTwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageReceived;
                    objTwitterDirectMessages.id = ObjectId.GenerateNewId();

                    try
                    {
                        objTwitterDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objTwitterDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objTwitterDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objTwitterDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages", _appSettings);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(objTwitterDirectMessages);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetDirect_Messages_Sent ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetDirect_Messages_Sent ex.Message >> " + ex.Message);
            }
            #endregion
        }

        public static string Post_ReplyStatusesUpdate(string profileId, string message, string messageId, long userId, long groupId, Model.DatabaseRepository dbr, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.TwitterAccount twtAcc = new Domain.Socioboard.Models.TwitterAccount();
            Domain.Socioboard.Models.TwitterAccount inMemTwtAcc = _redisCache.Get<Domain.Socioboard.Models.TwitterAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId);
            if (inMemTwtAcc == null)
            {
                twtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(profileId) && t.userId == userId).FirstOrDefault();
                if (twtAcc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId, twtAcc);
                }

            }
            else
            {
                twtAcc = inMemTwtAcc;
            }
            oAuthTwitter OAuthTwt = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
            OAuthTwt.AccessToken = twtAcc.oAuthToken;
            OAuthTwt.AccessTokenSecret = twtAcc.oAuthSecret;
            OAuthTwt.TwitterScreenName = twtAcc.twitterScreenName;
            OAuthTwt.TwitterUserId = twtAcc.twitterUserId;
            JArray replypost = new JArray();
            Tweet twt = new Tweet();
            try
            {
                if (!string.IsNullOrEmpty(messageId))
                {
                    replypost = twt.Post_StatusesUpdate(OAuthTwt, message, messageId);
                    return "succeess";
                }
                else
                {
                    replypost = twt.Post_StatusesUpdate(OAuthTwt, message);
                    return "succeess";
                }
            }
            catch (Exception e)
            {
                _logger.LogError("Post_ReplyStatusesUpdate" + e.StackTrace);
                _logger.LogError("Post_ReplyStatusesUpdate" + e.Message);
                return "failure";
            }
        }

        public static string TwitterRetweet_post(string profileId, string messageId, long userId, long groupId, Model.DatabaseRepository dbr, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.TwitterAccount twtacc = new Domain.Socioboard.Models.TwitterAccount();
            Domain.Socioboard.Models.TwitterAccount imtwtacc = _redisCache.Get<Domain.Socioboard.Models.TwitterAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId);
            if (imtwtacc == null)
            {
                twtacc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(profileId) && t.userId == userId).FirstOrDefault();
                if (twtacc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId, twtacc);
                }
            }
            else
            {
                twtacc = imtwtacc;
            }
            oAuthTwitter oAuth = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
            oAuth.AccessToken = twtacc.oAuthToken;
            oAuth.AccessTokenSecret = twtacc.oAuthSecret;
            oAuth.TwitterScreenName = twtacc.twitterScreenName;
            oAuth.TwitterUserId = twtacc.twitterUserId;
            Tweet twt = new Tweet();
            try
            {
                JArray retweetpost = twt.Post_Statuses_RetweetsById(oAuth, messageId, "");
                if (retweetpost.HasValues == true)
                {
                    return "succeess";
                }

                else
                {
                    return "failuer";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("TwitterRetweet_post" + ex.StackTrace);
                _logger.LogError("TwitterRetweet_post" + ex.Message);
                return "failuer";
            }
        }

        public static string TwitterFavorite_post(string profileId, string messageId, long userId, long groupId, Model.DatabaseRepository dbr, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.Models.TwitterAccount twtacc = new Domain.Socioboard.Models.TwitterAccount();
            Domain.Socioboard.Models.TwitterAccount imtwtacc = _redisCache.Get<Domain.Socioboard.Models.TwitterAccount>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId);
            if (imtwtacc == null)
            {
                twtacc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(profileId) && t.userId == userId).FirstOrDefault();
                if (twtacc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId, twtacc);
                }
            }
            else
            {
                twtacc = imtwtacc;
            }
            oAuthTwitter oAuth = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
            oAuth.AccessToken = twtacc.oAuthToken;
            oAuth.AccessTokenSecret = twtacc.oAuthSecret;
            oAuth.TwitterScreenName = twtacc.twitterScreenName;
            oAuth.TwitterUserId = twtacc.twitterUserId;
            Tweet twt = new Tweet();
            try
            {
                JArray favoritepost = twt.Post_favorites(oAuth, messageId);
                if (favoritepost.HasValues == true)
                {
                    return "succeess";
                }

                else
                {
                    return "already favorite";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("TwitterFavorite_post" + ex.StackTrace);
                _logger.LogError("TwitterFavorite_post" + ex.Message);
                return "failuer";
            }
        }
    }
}
