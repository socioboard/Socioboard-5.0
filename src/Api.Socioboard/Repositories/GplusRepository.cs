using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Socioboard.Repositories
{
    public static class GplusRepository
    {

        public static Domain.Socioboard.Models.Googleplusaccounts getGPlusAccount(string GPlusUserId, Helper.Cache _redisCache, Model.DatabaseRepository dbr)
        {
            try
            {
                Domain.Socioboard.Models.Googleplusaccounts inMemGplusAcc = _redisCache.Get<Domain.Socioboard.Models.Googleplusaccounts>(Domain.Socioboard.Consatants.SocioboardConsts.CacheGplusAccount + GPlusUserId);
                if (inMemGplusAcc != null)
                {
                    return inMemGplusAcc;
                }
            }
            catch { }

            List<Domain.Socioboard.Models.Googleplusaccounts> lstGPlusAcc = dbr.Find<Domain.Socioboard.Models.Googleplusaccounts>(t => t.GpUserId.Equals(GPlusUserId)).ToList();
            if (lstGPlusAcc != null && lstGPlusAcc.Count() > 0)
            {
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheGplusAccount + GPlusUserId, lstGPlusAcc.First());
                return lstGPlusAcc.First();
            }
            else
            {
                return null;
            }



        }


        public static int AddGplusAccount(JObject profile,  Model.DatabaseRepository dbr, Int64 userId, Int64 groupId, string accessToken,string refreshToken ,Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            int isSaved = 0;
            Domain.Socioboard.Models.Googleplusaccounts gplusAcc = GplusRepository.getGPlusAccount(Convert.ToString(profile["id"]), _redisCache, dbr);
            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(settings.GoogleConsumerKey,settings.GoogleConsumerSecret,settings.GoogleRedirectUri);
            if (gplusAcc != null && gplusAcc.IsActive == false)
            {
                gplusAcc.IsActive = true;
                gplusAcc.UserId = userId;
                gplusAcc.AccessToken = accessToken;
                gplusAcc.RefreshToken = refreshToken;
                gplusAcc.EntryDate = DateTime.UtcNow;
                gplusAcc.GpProfileImage = Convert.ToString(profile["picture"]); 
                gplusAcc.AccessToken = accessToken;


                #region Get_InYourCircles
                try
                {
                    string _InyourCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleList.Replace("[userId]", gplusAcc.GpUserId).Replace("[collection]", "visible") + "?key=" + settings.GoogleApiKey, accessToken);
                    JObject J_InyourCircles = JObject.Parse(_InyourCircles);
                    gplusAcc.InYourCircles = Convert.ToInt32(J_InyourCircles["totalItems"].ToString());
                }
                catch (Exception ex)
                {
                    gplusAcc.InYourCircles = 0;
                }
                #endregion

                #region Get_HaveYouInCircles
                try
                {
                    string _HaveYouInCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleProfile + gplusAcc.GpUserId + "?key=" + settings.GoogleApiKey, accessToken);
                    JObject J_HaveYouInCircles = JObject.Parse(_HaveYouInCircles);
                    gplusAcc.HaveYouInCircles = Convert.ToInt32(J_HaveYouInCircles["circledByCount"].ToString());
                }
                catch (Exception ex)
                {
                    gplusAcc.HaveYouInCircles = 0;
                }
                #endregion




                dbr.Update<Domain.Socioboard.Models.Googleplusaccounts>(gplusAcc);
            }
            else
            {
                gplusAcc = new Domain.Socioboard.Models.Googleplusaccounts();
                gplusAcc.UserId = userId;
                gplusAcc.GpUserId = profile["id"].ToString();
                gplusAcc.GpUserName = profile["name"].ToString();
                gplusAcc.IsActive = true;
                gplusAcc.AccessToken = accessToken;
                gplusAcc.RefreshToken = refreshToken;
                gplusAcc.EntryDate = DateTime.UtcNow;
                gplusAcc.GpProfileImage = Convert.ToString(profile["picture"]);
                gplusAcc.AccessToken = accessToken;


                #region Get_InYourCircles
                try
                {
                    string _InyourCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleList.Replace("[userId]", gplusAcc.GpUserId).Replace("[collection]", "visible") + "?key=" + settings.GoogleApiKey, accessToken);
                    JObject J_InyourCircles = JObject.Parse(_InyourCircles);
                    gplusAcc.InYourCircles = Convert.ToInt32(J_InyourCircles["totalItems"].ToString());
                }
                catch (Exception ex)
                {
                    gplusAcc.InYourCircles = 0;
                }
                #endregion

                #region Get_HaveYouInCircles
                try
                {
                    string _HaveYouInCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleProfile + gplusAcc.GpUserId + "?key=" + settings.GoogleApiKey, accessToken);
                    JObject J_HaveYouInCircles = JObject.Parse(_HaveYouInCircles);
                    gplusAcc.HaveYouInCircles = Convert.ToInt32(J_HaveYouInCircles["circledByCount"].ToString());
                }
                catch (Exception ex)
                {
                    gplusAcc.HaveYouInCircles = 0;
                }
                #endregion

                try
                {
                    gplusAcc.EmailId = (Convert.ToString(profile["email"]));
                }
                catch { }
                 isSaved = dbr.Add<Domain.Socioboard.Models.Googleplusaccounts>(gplusAcc);
            }
           
            if (isSaved == 1)
            {
                List<Domain.Socioboard.Models.Googleplusaccounts> lstgplusAcc = dbr.Find<Domain.Socioboard.Models.Googleplusaccounts>(t => t.GpUserId.Equals(gplusAcc.GpUserId)).ToList();
                if (lstgplusAcc != null && lstgplusAcc.Count() > 0)
                {
                    isSaved = GroupProfilesRepository.AddGroupProfile(groupId, lstgplusAcc.First().GpUserId, lstgplusAcc.First().GpUserName, userId, lstgplusAcc.First().GpProfileImage, Domain.Socioboard.Enum.SocialProfileType.GPlus, dbr);
                    //codes to delete cache
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheUserProfileCount + userId);
                    _redisCache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheGroupProfiles + groupId);

                    
                    if (isSaved == 1)
                    {
                        new Thread(delegate ()
                        {
                            GetUserActivities(gplusAcc.GpUserId,gplusAcc.AccessToken,settings,_logger);

                        }).Start();


                    }
                }

            }
            return isSaved;

        }


        public static void GetUserActivities(string ProfileId, string AcessToken, Helper.AppSettings settings, ILogger _logger)
        {
            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(settings.GoogleConsumerKey,settings.GoogleConsumerSecret,settings.GoogleRedirectUri);
            try
            {
                //Domain.Socioboard.Domain.GooglePlusActivities _GooglePlusActivities = null;
                MongoGplusFeed _GooglePlusActivities;
                string _Activities = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetActivitiesList.Replace("[ProfileId]", ProfileId) + "?key=" + settings.GoogleApiKey, AcessToken);
                JObject J_Activities = JObject.Parse(_Activities);
                foreach (var item in J_Activities["items"])
                {
                    _GooglePlusActivities = new MongoGplusFeed();
                    _GooglePlusActivities.Id = ObjectId.GenerateNewId();
                    //_GooglePlusActivities.UserId = Guid.Parse(UserId);
                    _GooglePlusActivities.GpUserId = ProfileId;
                    try
                    {
                        _GooglePlusActivities.FromUserName = item["actor"]["displayName"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.FromId = item["actor"]["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.ActivityId = item["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.ActivityUrl = item["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.Title = item["title"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.FromProfileImage = item["actor"]["image"]["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.Content = item["object"]["content"].ToString();
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.PublishedDate = Convert.ToDateTime(item["published"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.PlusonersCount = Convert.ToInt32(item["object"]["plusoners"]["totalItems"].ToString());
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.RepliesCount = Convert.ToInt32(item["object"]["replies"]["totalItems"].ToString());
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.ResharersCount = Convert.ToInt32(item["object"]["resharers"]["totalItems"].ToString());
                    }
                    catch { }
                    try
                    {
                        _GooglePlusActivities.AttachmentType = item["object"]["attachments"][0]["objectType"].ToString();
                        if (_GooglePlusActivities.AttachmentType == "video")
                        {
                            _GooglePlusActivities.Attachment = item["object"]["attachments"][0]["embed"]["url"].ToString();
                        }
                        else if (_GooglePlusActivities.AttachmentType == "photo")
                        {
                            _GooglePlusActivities.Attachment = item["object"]["attachments"][0]["image"]["url"].ToString();
                        }
                        else if (_GooglePlusActivities.AttachmentType == "album")
                        {
                            _GooglePlusActivities.Attachment = item["object"]["attachments"][0]["thumbnails"][0]["image"]["url"].ToString();
                        }
                        else if (_GooglePlusActivities.AttachmentType == "article")
                        {
                            try
                            {
                                _GooglePlusActivities.Attachment = item["object"]["attachments"][0]["image"]["url"].ToString();
                            }
                            catch { }
                            try
                            {
                                _GooglePlusActivities.ArticleDisplayname = item["object"]["attachments"][0]["displayName"].ToString();
                            }
                            catch { }
                            try
                            {
                                _GooglePlusActivities.ArticleContent = item["object"]["attachments"][0]["content"].ToString();
                            }
                            catch { }
                            try
                            {
                                _GooglePlusActivities.Link = item["object"]["attachments"][0]["url"].ToString();
                            }
                            catch { }
                        }
                    }
                    catch (Exception ex)
                    {
                        _GooglePlusActivities.AttachmentType = "note";
                        _GooglePlusActivities.Attachment = "";
                    }
                    MongoRepository gplusFeedRepo = new MongoRepository("MongoGplusFeed", settings);
                    var ret = gplusFeedRepo.Find<MongoGplusFeed>(t => t.ActivityId.Equals(_GooglePlusActivities.ActivityId));
                    var task = Task.Run(async () => {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        gplusFeedRepo.Add(_GooglePlusActivities);

                    }
                    else
                    {
                        FilterDefinition<BsonDocument> filter = new BsonDocument("ActivityId", _GooglePlusActivities.ActivityId);
                        var update = Builders<BsonDocument>.Update.Set("PlusonersCount", _GooglePlusActivities.PlusonersCount).Set("RepliesCount", _GooglePlusActivities.RepliesCount).Set("ResharersCount", _GooglePlusActivities.ResharersCount);
                        gplusFeedRepo.Update<MongoGplusFeed>(update, filter);
                    }
                    new Thread(delegate () {
                       GetGooglePlusComments(_GooglePlusActivities.ActivityId, AcessToken, ProfileId,settings,_logger);
                    }).Start();

                    new Thread(delegate ()
                    {
                        //GetGooglePlusLikes(_GooglePlusActivities.ActivityId, AcessToken, ProfileId, status);
                    }).Start();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("GetUserActivities => " + ex.Message);
            }
        }




        public static void GetGooglePlusComments(string feedId, string AccessToken, string profileId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository gplusCommentRepo = new MongoRepository("GoogleplusComments",settings);
            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(settings.GoogleConsumerKey,settings.GoogleConsumerSecret,settings.GoogleRedirectUri);

            MongoGoogleplusComments _GoogleplusComments = new MongoGoogleplusComments();
            try
            {
                string _Comments = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetCommentListByActivityId.Replace("[ActivityId]", feedId) + "?key=" + settings.GoogleRedirectUri, AccessToken);
                JObject J_Comments = JObject.Parse(_Comments);
                List<MongoGoogleplusComments> lstGoogleplusComments = new List<MongoGoogleplusComments>();
                foreach (var item in J_Comments["items"])
                {
                    try
                    {
                        _GoogleplusComments.Id = ObjectId.GenerateNewId();
                        _GoogleplusComments.Comment = item["object"]["content"].ToString();
                        _GoogleplusComments.CommentId = item["id"].ToString();
                        _GoogleplusComments.CreatedDate = Convert.ToDateTime(item["published"]).ToString("yyyy/MM/dd HH:mm:ss");
                        _GoogleplusComments.FeedId = feedId;
                        _GoogleplusComments.FromId = item["actor"]["id"].ToString();
                        _GoogleplusComments.FromImageUrl = item["actor"]["image"]["url"].ToString();
                        _GoogleplusComments.FromName = item["actor"]["url"].ToString();
                        _GoogleplusComments.FromUrl = item["actor"]["url"].ToString();
                        _GoogleplusComments.GplusUserId = profileId;

                        lstGoogleplusComments.Add(_GoogleplusComments);

                        //if (!objGoogleplusCommentsRepository.IsExist(_GoogleplusComments.CommentId))
                        //{
                        //    objGoogleplusCommentsRepository.Add(_GoogleplusComments);
                        //}

                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex.Message);
                    }
                }

                gplusCommentRepo.AddList(lstGoogleplusComments);

            }
            catch (Exception ex)
            {
            }

        }

        //public void GetGooglePlusLikes(string feedId, string AccessToken, string ProfileId, int Status, Helper.AppSettings settings, ILogger _logger)
        //{
        //    oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus();

        //    Domain.Socioboard.Domain.GoogleplusLike _GoogleplusLike = new Domain.Socioboard.Domain.GoogleplusLike();
        //    try
        //    {
        //        string _Likes = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strLike.Replace("[ActivityId]", feedId) + "?key=" + ConfigurationManager.AppSettings["Api_Key"].ToString(), AccessToken);
        //        JObject J_Likes = JObject.Parse(_Likes);

        //        foreach (var item in J_Likes["items"])
        //        {
        //            try
        //            {
        //                _GoogleplusLike.Id = Guid.NewGuid();
        //                _GoogleplusLike.FromId = item["id"].ToString();
        //                _GoogleplusLike.FromImageUrl = item["image"]["url"].ToString();
        //                _GoogleplusLike.FromName = item["displayName"].ToString();
        //                _GoogleplusLike.ProfileId = ProfileId;
        //                _GoogleplusLike.FromUrl = item["url"].ToString();
        //                _GoogleplusLike.FeedId = feedId;

        //                if (!objGoogleplusCommentsRepository.IsLikeExist(_GoogleplusLike.FromId, feedId))
        //                {
        //                    objGoogleplusCommentsRepository.AddLikes(_GoogleplusLike);
        //                }
        //            }
        //            catch (Exception ex)
        //            {
        //                logger.Error(ex.Message);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //    }

        //}
    }
}
