using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Gplus
{
    public static class GooglePlusFeed
    {
        public static void GetUserActivities(string ProfileId, string AcessToken)
        {
            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(Helper.AppSettings.GoogleConsumerKey, Helper.AppSettings.GoogleConsumerSecret, Helper.AppSettings.GoogleRedirectUri);
            try
            {
                //Domain.Socioboard.Domain.GooglePlusActivities _GooglePlusActivities = null;
                MongoGplusFeed _GooglePlusActivities;
                string _Activities = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetActivitiesList.Replace("[ProfileId]", ProfileId) + "?key=" + Helper.AppSettings.GoogleApiKey, AcessToken);
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
                    MongoRepository gplusFeedRepo = new MongoRepository("MongoGplusFeed");
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
                        GetGooglePlusComments(_GooglePlusActivities.ActivityId, AcessToken, ProfileId);
                    }).Start();

                  
                }
            }
            catch (Exception ex)
            {
            }
        }


        public static void GetGooglePlusComments(string feedId, string AccessToken, string profileId)
        {
            MongoRepository gplusCommentRepo = new MongoRepository("GoogleplusComments");
            oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(Helper.AppSettings.GoogleConsumerKey, Helper.AppSettings.GoogleConsumerSecret, Helper.AppSettings.GoogleRedirectUri);

            MongoGoogleplusComments _GoogleplusComments = new MongoGoogleplusComments();
            try
            {
                string _Comments = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetCommentListByActivityId.Replace("[ActivityId]", feedId) + "?key=" + Helper.AppSettings.GoogleApiKey, AccessToken);
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


                    }
                    catch (Exception ex)
                    {
                        
                    }
                }

                gplusCommentRepo.AddList(lstGoogleplusComments);

            }
            catch (Exception ex)
            {
            }

        }
    }
}
