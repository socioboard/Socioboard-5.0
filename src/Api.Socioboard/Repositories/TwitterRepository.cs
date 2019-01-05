using Api.Socioboard.Helper;
using Api.Socioboard.Model;
using Domain.Socioboard.Enum;
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
        public static string AddTwitterAccount(long userId, long groupId, bool follow, Model.DatabaseRepository dbr, oAuthTwitter OAuth, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            string twitterUserId = string.Empty;
            Users userinfo = new Users();
            JArray profile = userinfo.Get_Users_LookUp_ByScreenName(OAuth, OAuth.TwitterScreenName);
            Domain.Socioboard.Models.TwitterAccount twitterAccount = new Domain.Socioboard.Models.TwitterAccount();
            TwitterUser twtuser;
            if (profile.Count != 0)
            {
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
                        if (twitterAccount.userId == userId)
                        {
                            return ("Twitter account already added by you.");
                        }
                        return "This Account is added by other user.";
                    }
                }
                else
                {
                    return "Issue while fetching twitter userId";
                }

                if (twitterAccount != null)
                {
                    twitterAccount.twitterUserId = twitterUserId;
                    twitterAccount.lastUpdate = DateTime.UtcNow;
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
                        twitterAccount.profileImageUrl = item["profile_image_url_https"].ToString().TrimStart('"').TrimEnd('"');

                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex.StackTrace);

                    }
                    try
                    {
                        twitterAccount.profileBackgroundImageUrl = item["profile_banner_url"].ToString().TrimStart('"').TrimEnd('"');

                    }
                    catch (Exception ex)
                    {
                        twitterAccount.profileBackgroundImageUrl = item["profile_background_image_url_https"].ToString().TrimStart('"').TrimEnd('"');
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
                    twitterAccount.isAccessTokenActive = true;
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
                                    //todo: codes to update feeds
                                    SaveTwitterMessages(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                    SaveUserRetweets(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                    SaveUserTweets(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                    SaveTwitterFeeds(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                    SaveTwitterDirectMessageSent(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                    SaveTwittwrDirectMessageRecieved(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                    SaveUserFollowers(OAuth, twitterAccount.twitterScreenName, twitterAccount.twitterUserId, _logger, _appSettings);
                                    Savetwitterrecentdetails(profile, _redisCache, _appSettings);
                                }).Start();


                                if (follow)
                                {
                                    new Thread(delegate ()
                                    {
                                        Helper.TwitterHelper.FollowAccount(OAuth, "Socioboard", "");
                                    }).Start();
                                }

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
                        twitterAccount.profileImageUrl = item["profile_image_url_https"].ToString().TrimStart('"').TrimEnd('"');
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
                    twitterAccount.isAccessTokenActive = true;
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
                                    SaveTwitterMessages(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                    SaveUserRetweets(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                    SaveUserTweets(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                    SaveTwitterFeeds(twitterAccount.twitterUserId, twitterAccount.twitterScreenName, OAuth, _logger, _appSettings);
                                    SaveTwitterDirectMessageSent(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                    SaveTwittwrDirectMessageRecieved(twitterAccount.twitterUserId, OAuth, _logger, _appSettings);
                                    SaveUserFollowers(OAuth, twitterAccount.twitterScreenName, twitterAccount.twitterUserId, _logger, _appSettings);
                                    Savetwitterrecentdetails(profile, _redisCache, _appSettings);
                                }).Start();

                                return "Added_Successfully";
                            }
                        }
                    }


                }

                return "Error while Adding Account";
            }
            else
            {
                return "Your Twitter profile is not Authorized to add";
            }
        }


        public static string ReconnecTwitter(long userId, bool follow, Model.DatabaseRepository dbr, oAuthTwitter OAuth, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            string twitterUserId = string.Empty;
            Users userinfo = new Users();
            JArray profile = userinfo.Get_Users_LookUp_ByScreenName(OAuth, OAuth.TwitterScreenName);
            Domain.Socioboard.Models.TwitterAccount twitterAccount = new Domain.Socioboard.Models.TwitterAccount();
            TwitterUser twtuser;
            if (profile.Count != 0)
            {
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
                twitterAccount = Api.Socioboard.Repositories.TwitterRepository.getTwitterAccount(twitterUserId, _redisCache, dbr);
                    
                
                
                
                if (twitterAccount.userId == userId )
                {
                    twitterAccount.twitterUserId = twitterUserId;
                    twitterAccount.lastUpdate = DateTime.UtcNow;
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
                        twitterAccount.profileImageUrl = item["profile_image_url_https"].ToString().TrimStart('"').TrimEnd('"');

                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex.StackTrace);

                    }
                    try
                    {
                        twitterAccount.profileBackgroundImageUrl = item["profile_banner_url"].ToString().TrimStart('"').TrimEnd('"');

                    }
                    catch (Exception ex)
                    {
                        twitterAccount.profileBackgroundImageUrl = item["profile_background_image_url_https"].ToString().TrimStart('"').TrimEnd('"');
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
                    twitterAccount.isAccessTokenActive = true;
                    int isSaved = dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twitterAccount);

                    return "Twitter Account Reconnected Successfully ";
                }
                else
                {
                    return "Twitter login information not correct, !please login twitter account which has to be reconnect";
                }             
                
            }
            else
            {
                return "Your Twitter profile is not Authorized to add";
            }
        }


        public static string DeleteProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache)
        {
            Domain.Socioboard.Models.TwitterAccount twtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId.Equals(profileId) && t.userId == userId && t.isActive).FirstOrDefault();
            if (twtAcc != null)
            {
                //twtAcc.isActive = false;
                //dbr.Update<Domain.Socioboard.Models.TwitterAccount>(twtAcc);
                dbr.Delete<Domain.Socioboard.Models.TwitterAccount>(twtAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterAccount + profileId);
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
                var sort = builder.Descending(t => t.feedTimeStamp);
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

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> GetTwitterSort(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, int skip, int count, string shortvalue)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", settings);
            var builder = Builders<MongoTwitterFeed>.Sort;
            var sort = builder.Descending(t => t.feedDate);
            var result = mongorepo.FindWithRange<MongoTwitterFeed>(t => t.profileId.Equals(profileId), sort, 0, 100);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            if (shortvalue == "maxlike")
            {
                IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstTwtFeeds = task.Result;
                lstTwtFeeds = lstTwtFeeds.OrderByDescending(t => Convert.ToInt64(t.Likecount)).ToList();

                if (lstTwtFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstTwtFeeds.ToList());

                    return lstTwtFeeds.ToList();
                }
            }
           else if (shortvalue == "maxretweet")
            {
                IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstTwtFeeds = task.Result;
                lstTwtFeeds = lstTwtFeeds.OrderByDescending(t => Convert.ToInt64(t.Retweetcount)).ToList();

                if (lstTwtFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstTwtFeeds.ToList());

                    return lstTwtFeeds.ToList();
                }
            }
           else if (shortvalue == "leastlike")
            {
                IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstTwtFeeds = task.Result;
                lstTwtFeeds = lstTwtFeeds.OrderBy(t => t.Likecount).ToList();

                if (lstTwtFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstTwtFeeds.ToList());

                    return lstTwtFeeds.ToList();
                }
            }
           else if (shortvalue == "leastretweet")
            {
                IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstTwtFeeds = task.Result;
                lstTwtFeeds = lstTwtFeeds.OrderBy(t => Convert.ToInt64(t.Retweetcount)).ToList();

                if (lstTwtFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + profileId, lstTwtFeeds.ToList());

                    return lstTwtFeeds.ToList();
                }
            }
            return null;
        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> GetTopFilterFeeds(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings, int skip, int count, string mediaType)
        {

            MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", settings);
            var builder = Builders<MongoTwitterFeed>.Sort;
            var sort = builder.Descending(t => t.feedDate);
            var result = mongorepo.FindWithRange<MongoTwitterFeed>(t => t.profileId.Equals(profileId) && t.mediaType.Equals(mediaType), sort, skip, count);
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<MongoTwitterFeed> lstFbFeeds = task.Result;
            
            return lstFbFeeds.ToList();
                          
        }
        public static List<Domain.Socioboard.Models.Mongo.MongoMessageModel> GetUserTweets(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoMessageModel>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Tweets + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoMessageModel", settings);
                var builder = Builders<MongoMessageModel>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<MongoMessageModel>(t => t.profileId.Equals(profileId), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoMessageModel> TwtTweets = task.Result;
                IList<MongoMessageModel> lstTwtTweets = TwtTweets.Where(t=>t.type==MessageType.TwitterUsertweet).ToList();

                if (lstTwtTweets != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Tweets + profileId, lstTwtTweets.ToList());

                    return lstTwtTweets.ToList();
                }

                return null;
            }

        }
        public static List<Domain.Socioboard.Models.Mongo.MongoMessageModel> GetUserNotifications(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoMessageModel> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoMessageModel>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Notifications + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoMessageModel", settings);
                var builder = Builders<MongoMessageModel>.Sort;
                var sort = builder.Descending(t => t.messageDate);
                var result = mongorepo.FindWithRange<MongoMessageModel>(t => t.profileId.Equals(profileId) && (t.type == Domain.Socioboard.Enum.MessageType.TwitterMention || t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet || t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoMessageModel> lstTwtTweets = task.Result;

                if (lstTwtTweets != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100Notifications + profileId, lstTwtTweets.ToList());

                    return lstTwtTweets.ToList();
                }

                return null;
            }

        }
        public static List<Domain.Socioboard.Models.Mongo.MongoDirectMessages> GetTwitterDirectMessages(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoDirectMessages> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoDirectMessages>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100DirectMessage + profileId);
            if (inMemFeeds != null)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", settings);
                var builder = Builders<MongoDirectMessages>.Sort;
                var sort = builder.Descending(t => t.createdDate);
                var result = mongorepo.FindWithRange<MongoDirectMessages>(t => t.senderId.Equals(profileId) && (t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent || t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived), sort, 0, 100);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoDirectMessages> lstTwtTweets = task.Result;

                if (lstTwtTweets != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterUser100DirectMessage + profileId, lstTwtTweets.ToList());

                    return lstTwtTweets.ToList();
                }

                return null;
            }

        }
        public static string TwitterFollowerCount(long userId, long groupId, Model.DatabaseRepository dbr, Helper.Cache _redisCache)
        {
            string[] profileids = null;
            string FollowerCount = string.Empty;
            List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Domain.Socioboard.Models.Groupprofiles>();
            if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            {
                lstGroupprofiles = iMmemGroupprofiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            }
            else
            {
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            }

            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            long TwitterFollowerCount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => profileids.Contains(t.twitterUserId) && t.isActive).Sum(t => t.followersCount);
            if (TwitterFollowerCount > 1000000)
            {
                float r = TwitterFollowerCount % 1000000;
                long t = TwitterFollowerCount / 1000000;
                float s= r / 1000000;
                float result= t + s;
                FollowerCount = result + " M";
            }
            else if (TwitterFollowerCount > 1000)
            {
                float r = TwitterFollowerCount % 1000;
                long t = TwitterFollowerCount / 1000;
                float s = r/1000;
                float result = t + s;
                FollowerCount = result+ " K"
                /*FollowerCount = t.ToString()  + s.ToString() + "K"*/
                ;
            }
            else
            {
                FollowerCount = TwitterFollowerCount.ToString();
            }
            return FollowerCount;
        }
        public static string GetIncommingMessage(long userId, long groupId, Model.DatabaseRepository dbr, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            string[] profileids = null;
            string IncommingMessage = string.Empty;
            List<Domain.Socioboard.Models.Groupprofiles> iMmemGroupprofiles = _redisCache.Get<List<Domain.Socioboard.Models.Groupprofiles>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = new List<Domain.Socioboard.Models.Groupprofiles>();
            if (iMmemGroupprofiles != null && iMmemGroupprofiles.Count > 0)
            {
                lstGroupprofiles = iMmemGroupprofiles.Where(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
            }
            else
            {
                lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            }

            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", _appSettings);
            //var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => profileids.Contains(t.recipientId));
            //var task = Task.Run(async () =>
            //{
            //    return await ret;
            //});
            //long TwitterFollowerCount = task.Result.Count;
            long TwitterFollowerCount = mongorepo.Counts<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => profileids.Contains(t.recipientId));
            if (TwitterFollowerCount > 1000000)
            {
                long r = TwitterFollowerCount % 1000000;
                long t = TwitterFollowerCount / 1000000;
                IncommingMessage = t.ToString() + "." + (r / 10000).ToString() + "M";
            }
            else if (TwitterFollowerCount > 1000)
            {
                long r = TwitterFollowerCount % 1000;
                long t = TwitterFollowerCount / 1000;
                IncommingMessage = t.ToString() + "." + (r / 100).ToString() + "K";
            }
            else
            {
                IncommingMessage = TwitterFollowerCount.ToString();
            }
            return IncommingMessage;
        }
        private static void SaveTwitterMessages(string profileId, string screenName, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
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
                Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                foreach (var item in data)
                {
                    //objMessageModel.UserId = Guid.Parse(UserId);
                    objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterMention;
                    objMessageModel.id = MongoDB.Bson.ObjectId.GenerateNewId();

                    try
                    {
                        objMessageModel.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objMessageModel.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                        objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.Message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.profileId = profileId;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.screenName = item["user"]["screen_name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.RecipientId = profileId;
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        objMessageModel.RecipientName = screenName;
                    }
                    catch (Exception ex)
                    {

                    }


                    MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.messageId == objMessageModel.messageId && t.profileId == profileId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                    }

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("tl.Get_Statuses_Mentions_Timeline ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("tl.Get_Statuses_Mentions_Timeline ex.Message >> " + ex.Message);
            }
        }
        private static void SaveUserRetweets(string profileId, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
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
                Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                foreach (var item in Retweet)
                {
                    try
                    {

                        objMessageModel.profileId = profileId;
                        objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterRetweet;
                        try
                        {
                            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                            objMessageModel.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                            objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.StackTrace);
                        }
                        try
                        {
                            objMessageModel.messageId = item["id_str"].ToString();
                        }
                        catch (Exception ex)
                        {
                            objMessageModel.messageId = item["id"].ToString();
                        }
                        try
                        {
                            objMessageModel.Message = item["text"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            objMessageModel.RecipientId = item["user"]["id_str"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            objMessageModel.RecipientName = item["user"]["screen_name"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }

                        Tweet _tweet = new Tweet();
                        JArray retweet_data = _tweet.Get_Statuses_RetweetsById(oAuth, objMessageModel.messageId);
                        foreach (var item_retweet in retweet_data)
                        {


                            try
                            {
                                objMessageModel.fromId = item_retweet["user"]["id_str"].ToString();
                            }
                            catch (Exception ex)
                            {
                                objMessageModel.fromId = item_retweet["user"]["id"].ToString();
                            }
                            try
                            {
                                objMessageModel.fromName = item_retweet["user"]["screen_name"].ToString();
                            }
                            catch (Exception ex)
                            {
                            }
                            try
                            {
                                objMessageModel.fromProfileUrl = item_retweet["user"]["profile_image_url"].ToString();
                            }
                            catch (Exception ex)
                            {
                                objMessageModel.fromProfileUrl = item_retweet["user"]["profile_image_url_https"].ToString();
                            }



                        }
                    }
                    catch (Exception ex)
                    {
                    }

                    MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.messageId == objMessageModel.messageId && t.profileId == profileId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Retweet_Of_Me ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Retweet_Of_Me ex.Message >> " + ex.Message);
            }
        }
        private static void SaveUserTweets(string profileId, string screenName, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            try
            {
                TwitterUser twtuser = new TwitterUser();
                JArray Timeline = twtuser.GetStatuses_User_Timeline(oAuth);
                foreach (var item in Timeline)
                {
                    Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                    objMessageModel.id = ObjectId.GenerateNewId();
                    objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterUsertweet;
                    try
                    {
                        objMessageModel.Message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.sourceUrl = item["source"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.mediaUrl = item["extended_entities"]["media"][0]["media_url_https"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.screenName = screenName;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.profileId = profileId;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objMessageModel.messageDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                        objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.inReplyToStatusUserId = item["in_reply_to_status_id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.fromProfileUrl = item["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.fromName = item["user"]["name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objMessageModel.fromId = item["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objMessageModel.fromScreenName = item["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.messageId == objMessageModel.messageId && t.profileId == profileId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_User_Timeline ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_User_Timeline ex.Message >> " + ex.Message);
            }
        }
        private static void SaveTwitterFeeds(string profileId, string screenName, oAuthTwitter oAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            TwitterUser twtuser;
            twtuser = new TwitterUser();
            try
            {
                JArray Home_Timeline = twtuser.GetStatuses_Home_Timeline(oAuth);
                Domain.Socioboard.Models.Mongo.MongoTwitterFeed objTwitterFeed = new Domain.Socioboard.Models.Mongo.MongoTwitterFeed();
                foreach (var item in Home_Timeline)
                {
                    objTwitterFeed.type = Domain.Socioboard.Enum.MessageType.TwitterFeed;
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
                        objTwitterFeed.feedTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
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
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(t => t.messageId == objTwitterFeed.messageId && t.profileId == profileId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(objTwitterFeed);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Home_Timeline ex.StackTrace >> " + ex.StackTrace);
                _logger.LogError("twtuser.GetStatuses_Home_Timeline ex.Message >> " + ex.Message);
            }
        }
        private static void SaveTwitterDirectMessageSent(string profileId, oAuthTwitter OAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            #region Add Twitter Direct Message
            TwitterUser twtuser = new TwitterUser();
            try
            {
                JArray Messages_Sent = twtuser.GetDirect_Messages_Sent(OAuth, 20);

                Domain.Socioboard.Models.Mongo.MongoDirectMessages objDirectMessages = new Domain.Socioboard.Models.Mongo.MongoDirectMessages();
                foreach (var item in Messages_Sent)
                {
                    objDirectMessages.type = Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent;
                    objDirectMessages.id = ObjectId.GenerateNewId();
                    objDirectMessages.profileId = profileId;

                    try
                    {
                        objDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                        objDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => t.messageId == objDirectMessages.messageId && t.profileId == profileId && t.recipientId == objDirectMessages.recipientId && t.senderId == objDirectMessages.senderId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(objDirectMessages);
                    }
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
        private static void SaveTwittwrDirectMessageRecieved(string profileId, oAuthTwitter OAuth, ILogger _logger, Helper.AppSettings _appSettings)
        {
            #region Add Twitter Direct Message
            TwitterUser twtuser = new TwitterUser();
            try
            {
                JArray Messages_Sent = twtuser.GetDirect_Messages(OAuth, 20);

                Domain.Socioboard.Models.Mongo.MongoDirectMessages objDirectMessages = new Domain.Socioboard.Models.Mongo.MongoDirectMessages();
                foreach (var item in Messages_Sent)
                {
                    objDirectMessages.type = Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived;
                    objDirectMessages.id = ObjectId.GenerateNewId();
                    objDirectMessages.profileId = profileId;
                    try
                    {
                        objDirectMessages.messageId = item["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
                        objDirectMessages.createdDate = DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                        objDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(item["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objDirectMessages.message = item["text"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.recipientId = item["recipient"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.recipientScreenName = item["recipient"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.recipientProfileUrl = item["recipient"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.senderId = item["sender"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {
                        objDirectMessages.senderScreenName = item["sender"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objDirectMessages.senderProfileUrl = item["sender"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        objDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    MongoRepository mongorepo = new MongoRepository("MongoDirectMessages", _appSettings);
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(t => t.messageId == objDirectMessages.messageId && t.profileId == profileId && t.recipientId == objDirectMessages.recipientId && t.senderId == objDirectMessages.senderId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoDirectMessages>(objDirectMessages);
                    }
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
        public static void SaveUserFollowers(oAuthTwitter OAuth, string screeenName, string TwitterUserId, ILogger _logger, Helper.AppSettings _appSettings)
        {
            try
            {
                TimeLine _TimeLine = new TimeLine();
                JArray jdata = _TimeLine.Get_User_Followers(OAuth);
                JArray user_data = JArray.Parse(jdata[0]["users"].ToString());
                string curser = string.Empty;
                string curser_next = string.Empty;
                try
                {
                    curser_next = jdata[0]["next_cursor"].ToString();
                }
                catch (Exception ex)
                {
                    curser_next = "0";
                }
                do
                {
                    curser = curser_next;
                    Domain.Socioboard.Models.Mongo.MongoMessageModel objMessageModel;
                    foreach (var item in user_data)
                    {
                        try
                        {
                            objMessageModel = new Domain.Socioboard.Models.Mongo.MongoMessageModel();
                            objMessageModel.id = ObjectId.GenerateNewId();
                            objMessageModel.profileId = TwitterUserId;
                            objMessageModel.type = Domain.Socioboard.Enum.MessageType.TwitterFollower;
                            objMessageModel.messageId = "";
                            objMessageModel.readStatus = 1;
                            try
                            {
                                objMessageModel.Message = item["description"].ToString();
                            }
                            catch (Exception ex)
                            {
                            }
                            try
                            {
                                objMessageModel.fromId = item["id_str"].ToString();
                            }
                            catch (Exception ex)
                            {
                                objMessageModel.fromId = item["id"].ToString();
                            }
                            try
                            {
                                objMessageModel.fromName = item["screen_name"].ToString();
                            }
                            catch (Exception ex)
                            {
                            }
                            try
                            {
                                objMessageModel.FollowerCount = Convert.ToInt32(item["followers_count"].ToString());
                            }
                            catch (Exception ex)
                            {
                            }
                            try
                            {
                                objMessageModel.FollowingCount = Convert.ToInt32(item["friends_count"].ToString());
                            }
                            catch (Exception ex)
                            {
                            }
                            try
                            {
                                objMessageModel.fromProfileUrl = item["profile_image_url"].ToString();
                            }
                            catch (Exception ex)
                            {
                                objMessageModel.fromProfileUrl = item["profile_image_url_https"].ToString();
                            }
                            try
                            {
                                objMessageModel.messageDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                                objMessageModel.messageTimeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                            }
                            catch (Exception ex)
                            {
                            }
                            objMessageModel.RecipientId = TwitterUserId;
                            objMessageModel.RecipientName = screeenName;
                            MongoRepository mongorepo = new MongoRepository("MongoMessageModel", _appSettings);
                            var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => t.fromId == objMessageModel.fromId && t.RecipientId == objMessageModel.RecipientId && t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
                            var task = Task.Run(async () =>
                            {
                                return await result;
                            });
                            IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstMongoTwitterMessage = task.Result;
                            if (lstMongoTwitterMessage.Count > 0)
                            {
                                mongorepo.UpdateReplace<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel, t => t.id == lstMongoTwitterMessage[0].id);
                            }
                            else
                            {
                                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoMessageModel>(objMessageModel);
                            }

                        }
                        catch (Exception ex)
                        {
                        }

                    }
                    if (curser != "0")
                    {
                        jdata = _TimeLine.Get_User_FollowersWithCurser(OAuth, curser);
                        user_data = JArray.Parse(jdata[0]["users"].ToString());
                        curser_next = jdata[0]["next_cursor"].ToString();
                    }
                }
                while (curser != "0");
            }
            catch (Exception ex)
            {
            }
        }
        public static void Savetwitterrecentdetails(JArray data, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            try
            {
                string TwitterId = string.Empty;
                Domain.Socioboard.Models.Mongo.TwitterRecentDetails insertdata = new TwitterRecentDetails();
                MongoRepository mongorepo = new MongoRepository("TwitterRecentDetails", settings);
                try
                {
                    TwitterId = data[0]["id_str"].ToString();

                }
                catch (Exception)
                {

                    TwitterId = string.Empty;

                }

                if (!string.IsNullOrEmpty(TwitterId))
                {
                    string AccountCreationDate = string.Empty;
                    string LastActivityDate = string.Empty;
                    string lastfeed = string.Empty;
                    string FeedId = string.Empty;
                    string retweetcount = string.Empty;
                    string favoritecount = string.Empty;

                    try
                    {
                        DateTime AccntCreationDate = Utility.ParseTwitterTime((data[0]["created_at"].ToString()));
                        AccountCreationDate = AccntCreationDate.ToString();
                    }
                    catch (Exception)
                    {
                        AccountCreationDate = string.Empty;

                    }


                    try
                    {
                        DateTime lastactivitydate = Utility.ParseTwitterTime((data[0]["status"]["created_at"].ToString()));
                        LastActivityDate = lastactivitydate.ToString();

                    }
                    catch (Exception)
                    {


                        LastActivityDate = string.Empty;
                    }

                    try
                    {
                        lastfeed = data[0]["status"]["text"].ToString();
                        FeedId = data[0]["status"]["id_str"].ToString();
                        retweetcount = data[0]["status"]["retweet_count"].ToString();
                        favoritecount = data[0]["status"]["favorite_count"].ToString();

                    }
                    catch (Exception)
                    {
                        lastfeed = string.Empty;
                        FeedId = string.Empty;
                        retweetcount = string.Empty;
                        favoritecount = string.Empty;

                    }

                    insertdata.Id = ObjectId.GenerateNewId();
                    insertdata.strId = ObjectId.GenerateNewId().ToString();
                    insertdata.TwitterId = TwitterId;
                    insertdata.AccountCreationDate = AccountCreationDate;
                    insertdata.LastActivityDate = LastActivityDate;
                    insertdata.lastfeed = lastfeed;
                    insertdata.FeedId = FeedId;
                    insertdata.retweetcount = Convert.ToInt64(retweetcount);
                    insertdata.favoritecount = Convert.ToInt64(favoritecount);
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.TwitterRecentDetails>(insertdata);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
         
        }
        public static string Post_ReplyStatusesUpdate(string profileId, string message, string messageId, long userId, long groupId, Model.DatabaseRepository dbr, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings, string screenName)
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
                    replypost = twt.Post_StatusesUpdate(OAuthTwt, message, screenName, messageId);
                    return "reply post successfully";
                }
                else
                {
                    replypost = twt.Post_StatusesUpdate(OAuthTwt, message);
                    return "reply post successfully";
                }
            }
            catch (Exception e)
            {
                _logger.LogError("Post_ReplyStatusesUpdate" + e.StackTrace);
                _logger.LogError("Post_ReplyStatusesUpdate" + e.Message);
                return "api issue while post reply";
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
                    return "post retweet successfully";
                }

                else
                {
                    return "post is already retweeted by you";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("TwitterRetweet_post" + ex.StackTrace);
                _logger.LogError("TwitterRetweet_post" + ex.Message);
                return "api issue while retweet post";
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
                    return "post is in favourite list successfully";
                }

                else
                {
                    return "this post already in your favourite list";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("TwitterFavorite_post" + ex.StackTrace);
                _logger.LogError("TwitterFavorite_post" + ex.Message);
                return "api issue while favourite post";
            }
        }

        public static string TwitterSpam_user(string profileId, string screenName, long userId, Model.DatabaseRepository dbr, ILogger _logger, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
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
                JArray favoritepost = twt.Post_report_as_spammer(oAuth, screenName);
                if (favoritepost.HasValues == true)
                {
                    return "Repoted as spam successfully";
                }

                else
                {
                    return "Already this account reported as spam";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("TwitterSpam_Account" + ex.StackTrace);
                _logger.LogError("TwitterSpam_Account" + ex.Message);
                return "api issue while spam account";
            }
        }
        public static void AddTwitterEmailmessage(long userId, string socioTwitterId, string profileId, string profileScnName, string toMail, string message, string subject, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            string TwitterId = string.Empty;
            Domain.Socioboard.Models.Mongo.TwitterFeedsEmailMessage insertData = new TwitterFeedsEmailMessage();
            MongoRepository mongorepo = new MongoRepository("TwitterFeedsEmailMessage", settings);

            insertData.Id = ObjectId.GenerateNewId();
            insertData.strId = ObjectId.GenerateNewId().ToString();
            insertData.dateLocal = DateTime.Now.ToString();
            insertData.dateUtc = DateTime.UtcNow.ToString();
            insertData.dateUnix = DateExtension.ToUnixTimestamp(DateTime.UtcNow);
            insertData.socioTwitterId = socioTwitterId;
            insertData.socioboardUserId = userId;
            insertData.twitterUserIdFrom = profileId;
            insertData.twitterScreenNameFrom = profileScnName;
            insertData.mailTo = toMail;
            insertData.messageText = message;
            insertData.subjectText = subject;

            mongorepo.Add<Domain.Socioboard.Models.Mongo.TwitterFeedsEmailMessage>(insertData);
        }
    }
}
