using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Facebook.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class FacebookRepository
    {

        public static int AddFacebookAccount(dynamic profile, Int64 friends, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, Domain.Socioboard.Enum.FbProfileType fbProfileType, string accessToken, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Facebookaccounts fbAcc = FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            if (fbAcc != null && fbAcc.IsActive == false)
            {
                fbAcc.IsActive = true;
                fbAcc.UserId = userId;
                fbAcc.Friends = friends;
                fbAcc.AccessToken = accessToken;
                isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            else
            {
                fbAcc = new Domain.Socioboard.Models.Facebookaccounts();
                fbAcc.UserId = userId;
                fbAcc.IsActive = true;
                fbAcc.Friends = friends;
                fbAcc.FbProfileType = fbProfileType;
                fbAcc.AccessToken = accessToken;
                fbAcc.FbUserId = (Convert.ToString(profile["id"]));
                fbAcc.FbUserName = (Convert.ToString(profile["name"]));
                try
                {
                    fbAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                try
                {
                    fbAcc.ProfileUrl = (Convert.ToString(profile["link"]));
                }
                catch { }
                try
                {
                    fbAcc.gender = (Convert.ToString(profile["gender"]));
                }
                catch { }
                try
                {
                    fbAcc.bio = (Convert.ToString(profile["bio"]));
                }
                catch { }
                try
                {
                    fbAcc.about = (Convert.ToString(profile["about"]));
                }
                catch { }
                try
                {
                    fbAcc.coverPic = (Convert.ToString(profile["cover"]["source"]));
                }
                catch { }
                try
                {
                    fbAcc.birthday = (Convert.ToString(profile["birthday"]));
                }
                catch { }
                try
                {
                    JArray arry = JArray.Parse(profile["education"]);
                    if (arry.Count() > 0)
                    {
                        fbAcc.college = Convert.ToString(arry[arry.Count() - 1]["school"]["name"]);
                        fbAcc.education = Convert.ToString(arry[arry.Count() - 1]["concentration"]["name"]);
                    }
                }
                catch { }
                try
                {
                    JArray arry = JArray.Parse(profile["work"]);
                    if (arry.Count() > 0)
                    {
                        fbAcc.workPosition = Convert.ToString(arry[0]["position"]["name"]);
                        fbAcc.workCompany = Convert.ToString(arry[0]["employer"]["name"]);
                    }
                }
                catch { }

                isSaved = dbr.Add<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }

            if (isSaved == 1)
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(fbAcc.FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstFbAcc.First().FbUserId, lstFbAcc.First().FbUserName, userId, "https://graph.facebook.com/" + fbAcc.FbUserId + "/picture?type=small", Domain.Socioboard.Enum.SocialProfileType.Facebook, dbr);
                    if (isSaved == 1)
                    {
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        new Thread(delegate ()
                        {
                            FacebookRepository.SaveFacebookFeeds(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);

                        }).Start();


                    }
                }

            }
            return isSaved;

        }

        public static int AddFacebookPage(dynamic profile, Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, Domain.Socioboard.Enum.FbProfileType fbProfileType, string accessToken, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Facebookaccounts fbAcc = FacebookRepository.getFacebookAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            if (fbAcc != null && fbAcc.IsActive == false)
            {
                fbAcc.IsActive = true;
                fbAcc.UserId = userId;
                fbAcc.Friends = (Convert.ToInt64(profile["likes"]));
                fbAcc.AccessToken = accessToken;
                isSaved = dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }
            else
            {
                fbAcc = new Domain.Socioboard.Models.Facebookaccounts();
                fbAcc.UserId = userId;
                fbAcc.IsActive = true;
                fbAcc.Friends = (Convert.ToInt64(profile["likes"])); ;
                fbAcc.FbProfileType = fbProfileType;
                fbAcc.AccessToken = accessToken;
                fbAcc.FbUserId = (Convert.ToString(profile["id"]));
                fbAcc.FbUserName = (Convert.ToString(profile["name"]));
                try
                {
                    fbAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                try
                {
                    fbAcc.ProfileUrl = "https://graph.facebook.com/" + Convert.ToString(profile["id"]) + "/picture?type=small";
                }
                catch { }


                isSaved = dbr.Add<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
            }

            if (isSaved == 1)
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(fbAcc.FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstFbAcc.First().FbUserId, lstFbAcc.First().FbUserName, userId, "https://graph.facebook.com/" + fbAcc.FbUserId + "/picture?type=small", Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage, dbr);
                    if (isSaved == 1)
                    {
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                        _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);
                        new Thread(delegate ()
                        {
                            FacebookRepository.SaveFacebookFeeds(fbAcc.AccessToken, lstFbAcc.First().FbUserId, settings, _logger);

                        }).Start();


                    }
                }

            }
            return isSaved;

        }

        public static Domain.Socioboard.Models.Facebookaccounts getFacebookAccount(string FbUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.Facebookaccounts inMemFbAcc = _redisCache.Get<Domain.Socioboard.Models.Facebookaccounts>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + FbUserId);
                if (inMemFbAcc != null)
                {
                    return inMemFbAcc;
                }
            }
            catch { }

            try
            {
                List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(FbUserId)).ToList();
                if (lstFbAcc != null && lstFbAcc.Count() > 0)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + FbUserId, lstFbAcc.First());
                    return lstFbAcc.First();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                return null;
            }



        }

        public static void SaveFacebookFeeds(string AccessToken, string ProfileId, Helper.AppSettings settings, ILogger _logger)
        {
            dynamic feeds = FbUser.getFeeds(AccessToken);

            if (feeds != null)
            {

                foreach (var result in feeds["data"])
                {
                    MongoFacebookFeed objFacebookFeed = new MongoFacebookFeed();
                    objFacebookFeed.Type = "fb_feed";
                    objFacebookFeed.ProfileId = ProfileId;
                    objFacebookFeed.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                    objFacebookFeed.FromProfileUrl = "http://graph.facebook.com/" + result["from"]["id"] + "/picture?type=small";
                    objFacebookFeed.FromName = result["from"]["name"].ToString();
                    objFacebookFeed.FromId = result["from"]["id"].ToString();
                    objFacebookFeed.FeedId = result["id"].ToString();
                    objFacebookFeed.FeedDate = DateTime.Parse(result["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                    objFacebookFeed.FbComment = "http://graph.facebook.com/" + result["id"] + "/comments";
                    objFacebookFeed.FbLike = "http://graph.facebook.com/" + result["id"] + "/likes";

                    try
                    {
                        objFacebookFeed.Picture = result["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objFacebookFeed.Picture = "";
                    }

                    string message = string.Empty;

                    try
                    {
                        if (result["message"] != null)
                        {
                            message = result["message"];
                        }
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            if (result["description"] != null)
                            {
                                message = result["description"];
                            }
                        }
                        catch (Exception exx)
                        {
                            try
                            {
                                if (result["story"] != null)
                                {
                                    message = result["story"];
                                }
                            }
                            catch (Exception exxx)
                            {
                                message = string.Empty;
                            }
                        }

                    }

                    if (message == null)
                    {
                        message = "";
                    }
                    objFacebookFeed.FeedDescription = message;
                    objFacebookFeed.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");

                    try
                    {
                        MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", settings);

                        mongorepo.Add<MongoFacebookFeed>(objFacebookFeed);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }

                    AddFbPostComments(objFacebookFeed.FeedId, AccessToken, settings, _logger);
                }

            }

        }


        public static string AddFbPostComments(string postid, string AccessToken, Helper.AppSettings settings, ILogger _logger)
        {
            MongoFbPostComment fbPostComment = new MongoFbPostComment();
            string ret = string.Empty;
            try
            {

                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                dynamic post = FbUser.getPostComments(AccessToken, postid);

                foreach (var item in post["data"])
                {
                    fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                    fbPostComment.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    fbPostComment.PostId = postid;

                    try
                    {
                        fbPostComment.CommentId = item["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Comment = item["message"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Likes = Convert.ToInt32(item["like_count"]);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.UserLikes = Convert.ToInt32(item["user_likes"]);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.Commentdate = DateTime.Parse(item["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch (Exception ex)
                    {
                        fbPostComment.Commentdate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    try
                    {
                        fbPostComment.FromName = item["from"]["name"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.FromId = item["from"]["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                    try
                    {
                        fbPostComment.PictureUrl = item["id"];
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }

                    try
                    {

                        MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", settings);
                        fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogInformation(ex.Message);
                        _logger.LogError(ex.StackTrace);
                    }

                }

            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
            }
            return ret;
        }



        public static List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> GetTopFeeds(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookRecent100Feeds + profileId);
            // User inMemUser = (User)_memoryCache.Get(user.UserName);
            if (inMemFeeds != null && inMemFeeds.Count > 0)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed", settings);
                var builder = Builders<MongoFacebookFeed>.Sort;
                var sort = builder.Descending(t => t.FeedDate);
                var result = mongorepo.FindWithRange<Domain.Socioboard.Models.Mongo.MongoFacebookFeed>(t => t.ProfileId.Equals(profileId), sort, 0, 100);
                var task = Task.Run(async () =>
                    {
                        return await result;
                    });
                IList<Domain.Socioboard.Models.Mongo.MongoFacebookFeed> lstFbFeeds = task.Result;

                if (lstFbFeeds != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookRecent100Feeds + profileId, lstFbFeeds.ToList());

                    return lstFbFeeds.ToList();
                }

                return null;
            }

        }

        public static List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> GetFbPostComment(string postId, Helper.Cache _redisCache, Helper.AppSettings setting)
        {
            List<Domain.Socioboard.Models.Mongo.MongoFbPostComment> inMemFeeds = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoFbPostComment>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFbPostComment + postId);
            if (inMemFeeds != null && inMemFeeds.Count > 0)
            {
                return inMemFeeds;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoFbPostComment", setting);
                var result = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoFbPostComment>(t => t.PostId == postId);
                var task = Task.Run(async () =>
                 {
                     return await result;
                 });
                IList<Domain.Socioboard.Models.Mongo.MongoFbPostComment> lstFbPostComment = task.Result;
                lstFbPostComment = lstFbPostComment.OrderByDescending(t => t.Commentdate).ToList();
                if (lstFbPostComment != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFbPostComment + postId, lstFbPostComment.ToList());
                    return lstFbPostComment.ToList();
                }
                return null;
            }
        }

        public static string DeleteProfile(Model.DatabaseRepository dbr, string profileId, long userId, Helper.Cache _redisCache)
        {
            Domain.Socioboard.Models.Facebookaccounts fbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(profileId) && t.UserId == userId).FirstOrDefault();
            if (fbAcc != null)
            {
                fbAcc.IsActive = false;
                dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + profileId);
                return "Deleted";
            }
            else
            {
                return "Account Not Exist";
            }
        }

        public static string PostFacebookComment(Model.DatabaseRepository dbr, string message,string profileId, string postId, Helper.Cache _redisCache,Helper.AppSettings settings, ILogger _logger)
        {
            Domain.Socioboard.Models.Facebookaccounts lstFbAcc = new Domain.Socioboard.Models.Facebookaccounts();
            Domain.Socioboard.Models.Facebookaccounts inMemFbAcc = _redisCache.Get<Domain.Socioboard.Models.Facebookaccounts>(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + profileId);
            if (inMemFbAcc == null)
            {
                lstFbAcc = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId.Equals(profileId));
                if (lstFbAcc != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheFacebookAccount + profileId, lstFbAcc);
                }

            }
            else
            {
                lstFbAcc = inMemFbAcc;
            }
            string commentId = FbUser.postComments(lstFbAcc.AccessToken,postId, message);
            if(!string.IsNullOrEmpty(commentId))
            {
                MongoFbPostComment fbPostComment = new MongoFbPostComment();
                fbPostComment.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                fbPostComment.EntryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                fbPostComment.Commentdate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                fbPostComment.PostId = postId;
                fbPostComment.Likes = 0;
                fbPostComment.UserLikes = 0;
                fbPostComment.PictureUrl = message;
                fbPostComment.FromName = lstFbAcc.FbUserName;
                fbPostComment.FromId = lstFbAcc.FbUserId;
                fbPostComment.CommentId = commentId;
                fbPostComment.Comment = message;
                try
                {

                    MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", settings);
                    fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    return "posted successfully";
                }
                catch (Exception ex)
                {
                    _logger.LogInformation(ex.Message);
                    _logger.LogError(ex.StackTrace);
                }
            }
            return "";
        }
    }
}
