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
        public static int MaxapiHitsCount = 150;


        public static int updateFacebookPageFeeds(Domain.Socioboard.Models.Facebookaccounts fbAcc)
        {
            apiHitsCount = 0;
            if (fbAcc.LastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (fbAcc.IsAccessTokenActive)
                {

                    while (apiHitsCount < MaxapiHitsCount)
                    {
                        SaveFacebookFeeds(fbAcc.AccessToken, fbAcc.FbUserId);
                        SavePageConversations(fbAcc.AccessToken, fbAcc.FbUserId);
                        SaveFacebookPageFeed(fbAcc.AccessToken, fbAcc.FbUserId);
                    }


                }
            }
            return 0;
        }

        public static void SaveFacebookFeeds(string AccessToken, string ProfileId)
        {
            dynamic feeds = FbUser.getFeeds(AccessToken);

            if (feeds != null)
            {
                apiHitsCount++;
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
                        MongoRepository mongorepo = new MongoRepository("MongoFacebookFeed");
                        var ret = mongorepo.Find<MongoFacebookFeed>(t => t.FeedId == objFacebookFeed.FeedId);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count<1)
                        {
                            mongorepo.Add<MongoFacebookFeed>(objFacebookFeed); 
                        }
                        
                    }
                    catch (Exception ex)
                    {
                        apiHitsCount = MaxapiHitsCount;
                    }

                    AddFbPostComments(objFacebookFeed.FeedId, AccessToken);
                }

            }
            else
            {
                apiHitsCount = MaxapiHitsCount;
            }

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

        public static void SaveFacebookPageFeed(string accesstoken, string facebookid)
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
                            catch { }
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
                            catch {
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
                        //_logger.LogInformation(ex.Message);
                        //_logger.LogError(ex.StackTrace);
                    }
                    try
                    {
                        //   AddFbPagePostCommentsLikes(objFbPageComment.CommentId, accesstoken, userid);
                    }
                    catch (Exception ex)
                    {
                        //_logger.LogInformation(ex.Message);
                        //_logger.LogError(ex.StackTrace);
                    }

                }

            }
            catch (Exception ex)
            {
                //_logger.LogInformation(ex.Message);
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
