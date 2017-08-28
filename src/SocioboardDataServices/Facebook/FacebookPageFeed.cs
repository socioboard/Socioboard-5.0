using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Socioboard.Facebook.Data;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices.Facebook
{
    public static class FacebookPageFeed
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 25;


        public static int updateFacebookPageFeeds(Domain.Socioboard.Models.Facebookaccounts fbAcc)
        {
            apiHitsCount = 0;
            Model.DatabaseRepository dbr = new DatabaseRepository();
           
            if (fbAcc.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (fbAcc.IsAccessTokenActive)
                {
                    dynamic profile = Fbpages.getFbPageData(fbAcc.AccessToken);
                    if (fbAcc.FbPageSubscription == Domain.Socioboard.Enum.FbPageSubscription.NotSubscribed)
                    {
                        string subscribed_apps = Fbpages.subscribed_apps(fbAcc.AccessToken, Convert.ToString(profile["id"]));
                        fbAcc.FbPageSubscription = Domain.Socioboard.Enum.FbPageSubscription.Subscribed;
                    }                   
                    apiHitsCount++;
                    if (Convert.ToString(profile) != "Invalid Access Token")
                    {
                        try
                        {
                            fbAcc.Friends = (Convert.ToInt64(profile["fan_count"]));
                        }
                        catch (Exception)
                        {
                            fbAcc.Friends = fbAcc.Friends;
                        }

                        try
                        {
                            fbAcc.EmailId = (Convert.ToString(profile["emails"]));
                            fbAcc.EmailId = fbAcc.EmailId.Replace("[","").Replace("]","").Replace("\"","");
                        }
                        catch (Exception)
                        {
                            fbAcc.EmailId = fbAcc.EmailId;
                        }

                        try
                        {
                            fbAcc.coverPic = (Convert.ToString(profile["cover"]["source"]));
                        }
                        catch (Exception)
                        {

                        }
                        try
                        {

                            dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(fbAcc);
                        }
                        catch { }
                        while (apiHitsCount < MaxapiHitsCount)
                        {
                            SaveFacebookFeeds(fbAcc.AccessToken, fbAcc.FbUserId,fbAcc.FbUserName);
                            SavePageConversations(fbAcc.AccessToken, fbAcc.FbUserId);
                            SaveFacebookPageFeed(fbAcc.AccessToken, fbAcc.FbUserId,fbAcc.FbUserName);
                            SaveFacebookPagePromotionalDetails(fbAcc.AccessToken, fbAcc.FbUserId);
                            SaveFacebookPageTaggedDetails(fbAcc.AccessToken, fbAcc.FbUserId);
                            // SavePageNotification(fbAcc.AccessToken, fbAcc.FbUserId);
                        }
                    }

                }
            }
            else
            {
                apiHitsCount = 0;
            }
            return 0;
        }

        public static void SaveFacebookFeeds(string AccessToken, string ProfileId,string UserName)
        {
            dynamic feeds = FbUser.getFeeds(AccessToken);

            while (apiHitsCount < MaxapiHitsCount && feeds != null && feeds["data"] != null)
            {
                apiHitsCount++;
                foreach (var result in feeds["data"])
                {
                    MongoFacebookFeed objFacebookFeed = new MongoFacebookFeed();
                    objFacebookFeed.Type = "fb_feed";
                    objFacebookFeed.ProfileId = ProfileId;
                    objFacebookFeed.Id = MongoDB.Bson.ObjectId.GenerateNewId();
                    try
                    {
                        objFacebookFeed.FromProfileUrl = "http://graph.facebook.com/" + result["from"]["id"] + "/picture?type=small";
                    }
                    catch (Exception)
                    {
                        objFacebookFeed.FromProfileUrl= "http://graph.facebook.com/" +ProfileId + "/picture?type=small";
                    }
                    try
                    {
                        objFacebookFeed.FromName = result["from"]["name"].ToString();
                    }
                    catch (Exception)
                    {

                        objFacebookFeed.FromName = UserName;
                    }
                    try
                    {
                        objFacebookFeed.FromId = result["from"]["id"].ToString();
                    }
                    catch (Exception)
                    {

                        objFacebookFeed.FromId = ProfileId;
                    }
                    objFacebookFeed.FeedId = result["id"].ToString();
                    objFacebookFeed.FeedDate = DateTime.Parse(result["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                    try
                    {
                        objFacebookFeed.FbComment = "http://graph.facebook.com/" + result["id"] + "/comments";
                        objFacebookFeed.FbLike = "http://graph.facebook.com/" + result["id"] + "/likes";
                    }
                    catch (Exception)
                    {
                        
                    }
                    try
                    {
                        objFacebookFeed.postType = result["type"].ToString();
                    }
                    catch
                    {
                        objFacebookFeed.postType = "status";
                    }
                    try
                    {
                        objFacebookFeed.postingFrom = result["application"]["name"].ToString();
                    }
                    catch
                    {
                        objFacebookFeed.postingFrom = "Facebook";
                    }
                    try
                    {
                        objFacebookFeed.Picture = result["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        objFacebookFeed.Picture = "";
                    }
                    try
                    {
                        objFacebookFeed.Likecount = result["likes"]["summary"]["total_count"].ToString();
                    }
                    catch (Exception ex)
                    {

                    }
                    try
                    {
                        objFacebookFeed.Commentcount = result["comments"]["summary"]["total_count"].ToString();
                    }
                    catch (Exception ex)
                    {

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
                    objFacebookFeed._facebookComment = FbPostComments(objFacebookFeed.FeedId, AccessToken);
                    try
                    {
                        MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed");
                        var ret = mongorepo.Find<MongoFacebookFeed>(t => t.FeedId == objFacebookFeed.FeedId);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            mongorepo.Add<MongoFacebookFeed>(objFacebookFeed);
                        }
                        else
                        {
                            try
                            {
                                FilterDefinition<BsonDocument> filter = new BsonDocument("FeedId", objFacebookFeed.FeedId);
                                var update = Builders<BsonDocument>.Update.Set("postType", objFacebookFeed.postType).Set("postingFrom", objFacebookFeed.postingFrom).Set("Likecount", objFacebookFeed.Likecount).Set("Commentcount", objFacebookFeed.Commentcount);
                                mongorepo.Update<MongoFacebookFeed>(update, filter);
                            }
                            catch { }
                        }

                    }
                    catch (Exception ex)
                    {
                        apiHitsCount = MaxapiHitsCount;
                    }
                    if (apiHitsCount < MaxapiHitsCount) {
                        // AddFbPostComments(objFacebookFeed.FeedId, AccessToken);
                    }
                       
                }

            }
        }

        public static List<MongoFbPostComment> FbPostComments(string postid, string AccessToken)
        {
            apiHitsCount++;
            List<MongoFbPostComment> lstFbPOstComment = new List<MongoFbPostComment>();
            string ret = string.Empty;
            try
            {

                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                dynamic post = FbUser.getPostComments(AccessToken, postid);

                foreach (var item in post["data"])
                {
                    MongoFbPostComment fbPostComment = new MongoFbPostComment();
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
                        lstFbPOstComment.Add(fbPostComment);

                        //MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment", settings);
                        //fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    }
                    catch (Exception ex)
                    {
                        
                       
                        new List<MongoFbPostComment>();

                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        
                       
                    }

                }

            }
            catch (Exception ex)
            {
                
               
            }
            return lstFbPOstComment;
        }

        public static void SavePageConversations(string AccessToken, string ProfileId)
        {
            try
            {

                Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages _TwitterDirectMessages;
                dynamic data = FbUser.conversations(AccessToken);
                if (data != null)
                {
                    apiHitsCount++;
                    foreach (var item in data["data"])
                    {
                        foreach (var msg_item in item["messages"]["data"])
                        {
                            _TwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();

                            try
                            {
                                _TwitterDirectMessages.messageId = msg_item["id"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.createdDate = Convert.ToDateTime(msg_item["created_time"].ToString()).ToString("yyyy/MM/dd HH:mm:ss");
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.senderId = msg_item["from"]["id"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.senderScreenName = msg_item["from"]["name"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.senderProfileUrl = "http://graph.facebook.com/" + _TwitterDirectMessages.senderId + "/picture?type=small";
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.recipientId = msg_item["to"]["data"][0]["id"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.recipientScreenName = msg_item["to"]["data"][0]["name"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.recipientProfileUrl = "http://graph.facebook.com/" + _TwitterDirectMessages.recipientId + "/picture?type=small";
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.message = msg_item["message"].ToString();
                                if (string.IsNullOrEmpty(_TwitterDirectMessages.message))
                                {
                                    if ((msg_item["attachments"]["data"][0]["mime_type"].ToString()).Contains("image"))
                                    {
                                        _TwitterDirectMessages.image = msg_item["attachments"]["data"][0]["image_data"]["url"].ToString();
                                    }
                                    else
                                    {
                                        _TwitterDirectMessages.message = msg_item["attachments"]["data"][0]["name"].ToString();
                                    }
                                }
                            }
                            catch (Exception ex)
                            {

                            }
                            try
                            {
                                _TwitterDirectMessages.image = msg_item["shares"]["data"][0]["link"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }
                            if (_TwitterDirectMessages.senderId == ProfileId)
                            {
                                _TwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.FacebookPageDirectMessageSent;
                            }
                            else
                            {
                                _TwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.FacebookPagDirectMessageReceived;
                            }

                            //code to add facebook page conversations
                            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
                            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => t.messageId == _TwitterDirectMessages.messageId);
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count > 0)
                            {

                            }
                            else
                            {
                                mongorepo.Add(_TwitterDirectMessages);
                            }
                        }
                    }
                }
                else
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
        }

        public static void SaveFacebookPageFeed(string accesstoken, string facebookid,string PageName)
        {
            try
            {

                dynamic fbfeeds = FbUser.getFeeds(accesstoken, facebookid);
                if (fbfeeds != null)
                {
                    apiHitsCount++;
                    foreach (var _feed in fbfeeds["data"])
                    {
                        try
                        {
                            Domain.Socioboard.Models.Mongo.FacebookPagePost _FacebookPagePost = new Domain.Socioboard.Models.Mongo.FacebookPagePost();
                            _FacebookPagePost.Id = ObjectId.GenerateNewId();
                            _FacebookPagePost.strId = ObjectId.GenerateNewId().ToString();
                            _FacebookPagePost.PageId = facebookid;
                            try
                            {
                                _FacebookPagePost.PageName = _feed["from"]["name"].ToString();
                            }
                            catch {
                                _FacebookPagePost.PageName = PageName;
                            }
                            try
                            {
                                _FacebookPagePost.PostId = _feed["id"].ToString();
                            }
                            catch { }
                            try
                            {
                                _FacebookPagePost.Message = _feed["message"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Message = "";
                            }
                            try
                            {
                                _FacebookPagePost.Link = _feed["link"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Link = "";
                            }
                            try
                            {
                                _FacebookPagePost.Name = _feed["name"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Name = "";
                            }
                            try
                            {
                                _FacebookPagePost.Picture = _feed["picture"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Picture = "";
                            }
                            try
                            {
                                _FacebookPagePost.Description = _feed["description"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Description = "";
                            }
                            try
                            {
                                _FacebookPagePost.Type = _feed["type"].ToString();
                            }
                            catch
                            {
                                _FacebookPagePost.Type = "";
                            }
                            try
                            {
                                _FacebookPagePost.CreatedTime = ToUnixTimestamp(Convert.ToDateTime(_feed["created_time"].ToString()));
                            }
                            catch
                            {
                                _FacebookPagePost.CreatedTime = ToUnixTimestamp(DateTime.UtcNow);
                            }

                            try
                            {
                                dynamic feeddetails = FbUser.getFeedDetail(accesstoken, _FacebookPagePost.PostId);

                                try
                                {
                                    _FacebookPagePost.Likes = feeddetails["likes"]["summary"]["total_count"].ToString();
                                }
                                catch
                                {
                                    _FacebookPagePost.Likes = "0";
                                }
                                try
                                {
                                    _FacebookPagePost.Comments = feeddetails["comments"]["summary"]["total_count"].ToString();
                                }
                                catch
                                {
                                    _FacebookPagePost.Comments = "0";
                                }
                                try
                                {
                                    _FacebookPagePost.Shares = feeddetails["shares"]["count"].ToString();
                                }
                                catch
                                {
                                    _FacebookPagePost.Shares = "0";
                                }
                            }
                            catch (Exception ex)
                            {
                            }

                            try
                            {
                                dynamic postdetails = FbUser.postdetails(accesstoken, _FacebookPagePost.PostId);
                                string _clicks = string.Empty;
                                foreach (var _details in postdetails["data"])
                                {
                                    if (_details["name"].ToString() == "post_story_adds_unique")
                                    {
                                        try
                                        {
                                            _FacebookPagePost.Talking = _details["values"][0]["value"].ToString();
                                        }
                                        catch (Exception ex)
                                        {
                                            _FacebookPagePost.Talking = "0";
                                        }
                                    }
                                    else if (_details["name"].ToString() == "post_impressions_unique")
                                    {
                                        try
                                        {
                                            _FacebookPagePost.Reach = _details["values"][0]["value"].ToString();
                                        }
                                        catch (Exception ex)
                                        {
                                            _FacebookPagePost.Reach = "0";
                                        }
                                    }
                                    else if (_details["name"].ToString() == "post_consumptions_by_type_unique")
                                    {
                                        try
                                        {
                                            _clicks = _details["values"][0]["value"]["other clicks"].ToString();
                                        }
                                        catch (Exception ex)
                                        {
                                            _clicks = "0";
                                        }
                                    }
                                }
                                try
                                {
                                    _FacebookPagePost.EngagedUsers = (Int32.Parse(_clicks) + Int32.Parse(_FacebookPagePost.Talking)).ToString();
                                }
                                catch (Exception ex)
                                {
                                    _FacebookPagePost.EngagedUsers = "0";
                                }

                                try
                                {
                                    _FacebookPagePost.Engagement = (double.Parse(_FacebookPagePost.EngagedUsers.ToString()) * 100) / double.Parse(_FacebookPagePost.Reach.ToString());
                                }
                                catch (Exception)
                                {

                                    _FacebookPagePost.Engagement = 0.00;
                                }
                            }
                            catch { }
                            //code to save facebookpage post data
                            MongoRepository reppoFacebookPagePost = new MongoRepository("FacebookPagePost");
                            var ret = reppoFacebookPagePost.Find<Domain.Socioboard.Models.Mongo.FacebookPagePost>(t => t.PostId == _FacebookPagePost.PostId);
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            int count = task.Result.Count;
                            if (count > 0)
                            {
                                var update = Builders<Domain.Socioboard.Models.Mongo.FacebookPagePost>.Update.Set(t => t.Likes, _FacebookPagePost.Likes).Set(t => t.Comments, _FacebookPagePost.Comments).Set(t => t.Shares, _FacebookPagePost.Shares)
                                .Set(t => t.EngagedUsers, _FacebookPagePost.EngagedUsers).Set(t => t.Talking, _FacebookPagePost.Talking).Set(t => t.Engagement, _FacebookPagePost.Engagement)
                                .Set(t => t.Reach, _FacebookPagePost.Reach).Set(t => t.Link, _FacebookPagePost.Link);
                                reppoFacebookPagePost.Update<Domain.Socioboard.Models.Mongo.FacebookPagePost>(update, t => t.PostId == _FacebookPagePost.PostId);
                            }
                            else
                            {
                                reppoFacebookPagePost.Add(_FacebookPagePost);
                            }

                        }
                        catch (Exception ex)
                        {
                        }
                    }
                }
                else
                {
                    apiHitsCount = MaxapiHitsCount;
                }
            }
            catch (Exception ex)
            {
                apiHitsCount = MaxapiHitsCount;
            }
        }

        public static void SavePageNotification(string AccessToken, string ProfileIds)
        {
            try
            {
                dynamic data = FbUser.notifications(AccessToken);
                Domain.Socioboard.Models.Mongo.MongoTwitterMessage _InboxMessages;
                if (data != null)
                {
                    apiHitsCount++;
                    foreach (var item in data["data"])
                    {
                        _InboxMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();

                        _InboxMessages.profileId = ProfileIds;
                        _InboxMessages.type = Domain.Socioboard.Enum.TwitterMessageType.FacebookPageNotification;
                        _InboxMessages.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        try
                        {
                            _InboxMessages.twitterMsg = item["title"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            _InboxMessages.messageId = item["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            _InboxMessages.fromId = item["from"]["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            _InboxMessages.fromName = item["from"]["name"].ToString();
                            _InboxMessages.fromScreenName = item["from"]["name"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            _InboxMessages.fromProfileUrl = "http://graph.facebook.com/" + _InboxMessages.fromId + "/picture?type=small";
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            _InboxMessages.RecipientId = item["to"]["id"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        try
                        {
                            _InboxMessages.RecipientName = item["to"]["name"].ToString();
                        }
                        catch (Exception ex)
                        {
                        }
                        //try
                        //{
                        //    _InboxMessages.r = "http://graph.facebook.com/" + _InboxMessages.RecipientId + "/picture?type=small";
                        //}
                        //catch (Exception ex)
                        //{
                        //    _logger.LogError("Facebook.asmx = > getUserNotifications = > " + ex.Message);
                        //}
                        try
                        {
                            _InboxMessages.messageDate = Convert.ToDateTime(item["created_time"].ToString());
                        }
                        catch (Exception ex)
                        {
                        }
                        MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                        var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.profileId == _InboxMessages.profileId && t.messageId == _InboxMessages.messageId);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(_InboxMessages);
                        }
                    }
                }
            }
            catch (Exception)
            {
                apiHitsCount = MaxapiHitsCount;
            }
        }

        public static void SaveFacebookPageTaggedDetails(string accesstoken, string facebookid)
        {
            try
            {
                dynamic data = FbUser.getPageTaggedPostDetails(accesstoken);
                Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails _InboxMessages;

                foreach (var item in data["data"])
                {
                    _InboxMessages = new Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails();

                    _InboxMessages.ProfileId = facebookid;
                    _InboxMessages.type = Domain.Socioboard.Enum.FacebookPagePromotion.tagged;
                    _InboxMessages.EntryDate = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                    try
                    {
                        _InboxMessages.message = item["message"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FeedId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FromId = item["from"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FromName = item["from"]["name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FromProfileUrl = "http://graph.facebook.com/" + _InboxMessages.FromId + "/picture?type=small";
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.ProfileId = facebookid;
                    }
                    catch (Exception ex)
                    {
                        
                    }

                    try
                    {
                        _InboxMessages.FeedDate = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_time"].ToString()));
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.Picture = item["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FeedDescription = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    MongoRepository mongorepo = new MongoRepository("FacebookPagePromotionDetails");
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(t => t.ProfileId == _InboxMessages.ProfileId && t.FeedId == _InboxMessages.FeedId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(_InboxMessages);
                    }
                }
            }
            catch (Exception)
            {

            }
        }
        public static void SaveFacebookPagePromotionalDetails(string accesstoken, string facebookid)
        {
            try
            {
                dynamic data = FbUser.getPromotablePostsDetails(accesstoken);
                Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails _InboxMessages;

                foreach (var item in data["data"])
                {
                    _InboxMessages = new Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails();

                    _InboxMessages.ProfileId = facebookid;
                    _InboxMessages.type = Domain.Socioboard.Enum.FacebookPagePromotion.promotable_posts;
                    _InboxMessages.EntryDate = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                    try
                    {
                        _InboxMessages.message = item["message"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FeedId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FromId = item["from"]["id"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FromName = item["from"]["name"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FromProfileUrl = "http://graph.facebook.com/" + _InboxMessages.FromId + "/picture?type=small";
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.ProfileId = facebookid;
                    }
                    catch (Exception ex)
                    {
                        
                    }

                    try
                    {
                        _InboxMessages.FeedDate = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(item["created_time"].ToString()));
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.Picture = item["picture"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    try
                    {
                        _InboxMessages.FeedDescription = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {
                        
                    }
                    MongoRepository mongorepo = new MongoRepository("FacebookPagePromotionDetails");
                    var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(t => t.ProfileId == _InboxMessages.ProfileId && t.FeedId == _InboxMessages.FeedId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        mongorepo.Add<Domain.Socioboard.Models.Mongo.FacebookPagePromotionDetails>(_InboxMessages);
                    }
                }
            }
            catch (Exception)
            {

            }
        }


        public static string AddFbPostComments(string postid, string AccessToken)
        {
            MongoFbPostComment fbPostComment = new MongoFbPostComment();
            string ret = string.Empty;
            try
            {

                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                apiHitsCount++;
                dynamic post = Socioboard.Facebook.Data.FbUser.getPostComments(AccessToken, postid);

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

                        MongoRepository fbPostRepo = new MongoRepository("MongoFbPostComment");
                        fbPostRepo.Add<MongoFbPostComment>(fbPostComment);
                    }
                    catch (Exception ex)
                    {
                        //
                        //_logger.LogError(ex.StackTrace);
                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        //
                        //_logger.LogError(ex.StackTrace);
                    }

                }

            }
            catch (Exception ex)
            {
                //
                //_logger.LogError(ex.StackTrace);
            }
            return ret;
        }

        public static long ToUnixTimestamp(this DateTime target)
        {
            var date = new DateTime(1970, 1, 1, 0, 0, 0, target.Kind);
            var unixTimestamp = System.Convert.ToInt64((target - date).TotalSeconds);

            return unixTimestamp;
        }

    }
}
