using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Instagram.App.Core;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.MediaMethods;
using Socioboard.Instagram.Instagram.Core.UsersMethods;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace SocioboardDataServices.Instagram
{
    public  class InstagramFeeds
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 300;


        public static  int updateInstagramFeeds(Domain.Socioboard.Models.Instagramaccounts insAcc)
        {
            apiHitsCount = 0;
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.Groupprofiles _grpProfile = dbr.Single<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(insAcc.InstagramId));
            if (insAcc.lastUpdate.AddHours(1)<=DateTime.UtcNow)
            {
                if(insAcc.IsActive)
                {

                  //  Domain.Socioboard.Models.Instagramaccounts Instagramaccounts = new Domain.Socioboard.Models.Instagramaccounts();
                    Domain.Socioboard.Models.Instagramaccounts objInstagramAccount;
                    UserController objusercontroller = new UserController();
                    ConfigurationIns configi = new ConfigurationIns("https://api.instagram.com/oauth/authorize/", "d89b5cfa3796458ebbb2520d70eeb498", "e4663d0a287243f88ac619b5692119c8", "https://www.socioboard.com/InstagramManager/Instagram", "https://api.instagram.com/oauth/access_token", "https://api.instagram.com/v1/", "");
                    oAuthInstagram _api = new oAuthInstagram();
                    _api = oAuthInstagram.GetInstance(configi);
                    InstagramResponse<User> objuser = objusercontroller.GetUserDetails(insAcc.InstagramId,insAcc.AccessToken);

                  //  objInstagramAccount = new Domain.Socioboard.Models.Instagramaccounts();


                    if (objuser!=null)
                    {
                        try
                        {
                            insAcc.ProfileUrl = objuser.data.profile_picture;
                            _grpProfile.profilePic= objuser.data.profile_picture;
                        }
                        catch (Exception ex)
                        {
                            insAcc.ProfileUrl = insAcc.ProfileUrl;
                            _grpProfile.profilePic = insAcc.ProfileUrl;
                        }
                        try
                        {
                            insAcc.TotalImages = objuser.data.counts.media;
                        }
                        catch (Exception ex)
                        {
                            insAcc.TotalImages = insAcc.TotalImages;
                        }
                        try
                        {
                            insAcc.FollowedBy = objuser.data.counts.followed_by;
                        }
                        catch (Exception ex)
                        {
                            insAcc.FollowedBy = insAcc.FollowedBy;
                        }
                        try
                        {
                            insAcc.Followers = objuser.data.counts.follows;
                        }
                        catch (Exception ex)
                        {
                            insAcc.Followers = insAcc.Followers;
                        }
                        try
                        {
                            insAcc.bio = objuser.data.bio;
                        }
                        catch (Exception ex)
                        {
                            insAcc.bio = insAcc.bio;
                        }
                        dbr.Update<Domain.Socioboard.Models.Groupprofiles>(_grpProfile);
                        dbr.Update<Domain.Socioboard.Models.Instagramaccounts>(insAcc); 
                    }
                    while (apiHitsCount<MaxapiHitsCount)
                    {
                        try
                        {
                            GetInstagramSelfFeeds(insAcc.InstagramId, insAcc.AccessToken);
                        }
                        catch { }
                        try
                        {
                            GetInstagramUserDetails(insAcc.InstagramId, insAcc.AccessToken, insAcc);
                        }
                        catch { }
                        try
                        {
                            GetInstagramPostLikes(insAcc.InstagramId, insAcc.AccessToken);
                        }
                        catch { }
                        try
                        {
                            GetInstagramPostComments(insAcc.InstagramId, insAcc.AccessToken);
                        }
                        catch { }
                        try
                        {
                            GetInstagramFollowing(insAcc.InstagramId, insAcc.AccessToken, 1);
                        }
                        catch { }
                        try
                        {
                            GetInstagramFollower(insAcc.InstagramId, insAcc.AccessToken, 1);
                        }
                        catch { }
                    }
                    insAcc.lastUpdate = DateTime.UtcNow;
                    dbr.Update<Domain.Socioboard.Models.Instagramaccounts>(insAcc);
                }
            }
            else
            {
                apiHitsCount = 0;
            }
           
            return 0;
        }
        public static void GetInstagramSelfFeeds(string instagramId, string accessToken)
        {
            MongoRepository instagarmCommentRepo = new MongoRepository("InstagramComment");
            MongoRepository instagramFeedRepo = new MongoRepository("InstagramFeed");
            try
            {
                Users userInstagram = new Users();
                Media _Media = new Media();
                InstagramResponse<Comment[]> usercmts = new InstagramResponse<Comment[]>();
                CommentController objComment = new CommentController();
                LikesController objLikes = new LikesController();
                string feeds = _Media.UserResentFeeds(instagramId, accessToken);
                if (feeds != null)
                {
                    apiHitsCount++;
                    JObject feed_data = JObject.Parse(feeds);

                    foreach (var item in feed_data["data"])
                    {
                        try
                        {
                            Domain.Socioboard.Models.Mongo.InstagramFeed objInstagramFeed = new Domain.Socioboard.Models.Mongo.InstagramFeed();
                            try
                            {
                                objInstagramFeed.FeedDate = Convert.ToDouble(item["created_time"].ToString());
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.FeedId = item["id"].ToString();
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.Type = item["type"].ToString();
                                if (objInstagramFeed.Type == "video")
                                {
                                    objInstagramFeed.VideoUrl = item["videos"]["standard_resolution"]["url"].ToString();
                                }
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.FeedImageUrl = item["images"]["standard_resolution"]["url"].ToString();
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.InstagramId = instagramId;
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.LikeCount = Int32.Parse(item["likes"]["count"].ToString());
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.CommentCount = Int32.Parse(item["comments"]["count"].ToString());
                            }
                            catch { }
                            try
                            {
                                string str = item["user_has_liked"].ToString();
                                if (str.ToLower() == "false")
                                {
                                    objInstagramFeed.IsLike = 0;
                                }
                                else { objInstagramFeed.IsLike = 1; }
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.AdminUser = item["user"]["username"].ToString();
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.Feed = item["caption"]["text"].ToString();
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.ImageUrl = item["user"]["profile_picture"].ToString();
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.FromId = item["user"]["id"].ToString();
                            }
                            catch { }
                            try
                            {
                                objInstagramFeed.FeedUrl = item["link"].ToString();
                            }
                            catch { }

                            var ret = instagramFeedRepo.Find<Domain.Socioboard.Models.Mongo.InstagramFeed>(t => t.FeedId.Equals(objInstagramFeed.FeedId) && t.InstagramId.Equals(objInstagramFeed.InstagramId));
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            int count = task.Result.Count;

                            if (count < 1)
                            {
                                instagramFeedRepo.Add(objInstagramFeed);
                            }
                            else
                            {
                                FilterDefinition<BsonDocument> filter = new BsonDocument("FeedId", objInstagramFeed.FeedId);
                                var update = Builders<BsonDocument>.Update.Set("IsLike", objInstagramFeed.IsLike).Set("CommentCount", objInstagramFeed.CommentCount).Set("LikeCount", objInstagramFeed.LikeCount).Set("Type", objInstagramFeed.Type).Set("VideoUrl", objInstagramFeed.VideoUrl);
                                instagramFeedRepo.Update<Domain.Socioboard.Models.Mongo.InstagramFeed>(update, filter);
                            }
                            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstInstagramComment = new List<Domain.Socioboard.Models.Mongo.InstagramComment>();
                            usercmts = objComment.GetComment(objInstagramFeed.FeedId, accessToken);
                            if (usercmts.data.Count()>0)
                            {
                                apiHitsCount++;
                                for (int cmt = 0; cmt < usercmts.data.Count(); cmt++)
                                {
                                    try
                                    {
                                        Domain.Socioboard.Models.Mongo.InstagramComment objInstagramComment = new Domain.Socioboard.Models.Mongo.InstagramComment();
                                        try
                                        {
                                            objInstagramComment.Comment = usercmts.data[cmt].text;
                                        }
                                        catch { }
                                        try
                                        {
                                            objInstagramComment.CommentDate =Convert.ToDouble(usercmts.data[cmt].created_time.ToString());
                                        }
                                        catch { }
                                        try
                                        {
                                            objInstagramComment.CommentId = usercmts.data[cmt].id;
                                        }
                                        catch { }

                                        try
                                        {
                                            objInstagramComment.FeedId = objInstagramFeed.FeedId;
                                        }
                                        catch { }
                                        try
                                        {
                                            objInstagramComment.InstagramId = instagramId;
                                        }
                                        catch { }
                                        try
                                        {
                                            objInstagramComment.FromName = usercmts.data[cmt].from.username;
                                        }
                                        catch { }
                                        try
                                        {
                                            objInstagramComment.FromProfilePic = usercmts.data[cmt].from.profile_picture;
                                        }
                                        catch { }

                                        lstInstagramComment.Add(objInstagramComment);
                                    }
                                    catch (Exception ex)
                                    {

                                    }
                                }
                                instagarmCommentRepo.AddList(lstInstagramComment); 
                            }
                        }
                        catch (Exception ex)
                        {
                            apiHitsCount = MaxapiHitsCount;
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

        public static string GetInstagramUserDetails(string profile_id, string access_token,Domain.Socioboard.Models.Instagramaccounts _Instagramaccounts)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            string code_status = "false";
            Domain.Socioboard.Models.Mongo.InstagramUserDetails insert = new Domain.Socioboard.Models.Mongo.InstagramUserDetails();
            JObject post_data = new JObject();
            string url = "https://api.instagram.com/v1/users/" + profile_id + "?access_token=" + access_token;

            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));
            }
            catch (Exception)
            {
            }

            try
            {
                dynamic item = post_data["data"];

                if (item!=null)
                {
                    apiHitsCount++;
                    try
                    {
                        string insta_name = item["username"].ToString();
                        string full_name = item["full_name"].ToString();
                        string imageUrl = item["profile_picture"].ToString();
                        string media_count = item["counts"]["media"].ToString();
                        DateTime Created_Time = DateTime.Now;
                        string follower = item["counts"]["followed_by"].ToString();
                        string following = item["counts"]["follows"].ToString();
                        Domain.Socioboard.Models.Instagramaccounts Instagramaccounts = _Instagramaccounts;

                        if (Instagramaccounts != null && Instagramaccounts.IsActive == true)
                        {
                            Instagramaccounts.TotalImages = Convert.ToInt32(media_count);
                            Instagramaccounts.Followers = Convert.ToInt32(follower);
                            Instagramaccounts.FollowedBy = Convert.ToInt32(following);
                            Instagramaccounts.InsUserName = insta_name;
                            Instagramaccounts.ProfileUrl = imageUrl;
                            Instagramaccounts.InstagramId = profile_id;
                            dbr.Update<Domain.Socioboard.Models.Instagramaccounts>(Instagramaccounts);
                        }

                        DateTime t1 = DateTime.Now.Date;
                        DateTime t2 = DateTime.Now.Date.AddHours(12);
                        DateTime t3 = DateTime.Now.AddDays(1).Date.AddSeconds(-1);
                        if (DateTime.Now.TimeOfDay >= t1.TimeOfDay && DateTime.Now.TimeOfDay < t2.TimeOfDay)
                        {
                            if (Instagramaccounts != null && Instagramaccounts.IsActive == true)
                            {
                                Instagramaccounts.TotalImages = Convert.ToInt32(media_count);
                                Instagramaccounts.Followers = Convert.ToInt32(follower);
                                Instagramaccounts.FollowedBy = Convert.ToInt32(following);
                                Instagramaccounts.InsUserName = insta_name;
                                Instagramaccounts.ProfileUrl = imageUrl;
                                Instagramaccounts.InstagramId = profile_id;
                                dbr.Update<Domain.Socioboard.Models.Instagramaccounts>(Instagramaccounts);
                            }
                        }
                        if (DateTime.Now.TimeOfDay >= t2.TimeOfDay && DateTime.Now.TimeOfDay < t3.TimeOfDay)
                        {
                            if (Instagramaccounts != null && Instagramaccounts.IsActive == true)
                            {
                                Instagramaccounts.TotalImages = Convert.ToInt32(media_count);
                                Instagramaccounts.Followers = Convert.ToInt32(follower);
                                Instagramaccounts.FollowedBy = Convert.ToInt32(following);
                                Instagramaccounts.InsUserName = insta_name;
                                Instagramaccounts.ProfileUrl = imageUrl;
                                Instagramaccounts.InstagramId = profile_id;
                                dbr.Update<Domain.Socioboard.Models.Instagramaccounts>(Instagramaccounts);
                            }
                        }

                        code_status = "true";



                    }
                    catch (Exception ex)
                    {
                    } 
                }
                else
                {
                    apiHitsCount = MaxapiHitsCount;
                }

            }
            catch (Exception ex)
            {

            }
            return code_status;
        }

        public static string GetInstagramPostLikes(string profile_id, string access_token)
        {

            MongoRepository InstagramPostLikesRepo = new MongoRepository("InstagramPostLikes");
            MongoRepository InstagramSelfFeedRepo = new MongoRepository("InstagramSelfFeed");
            string code_status = "false";
            Domain.Socioboard.Models.Mongo.InstagramPostLikes insert = new Domain.Socioboard.Models.Mongo.InstagramPostLikes();
            JObject post_data = new JObject();
            string url = "https://api.instagram.com/v1/users/" + profile_id + "/media/recent?access_token=" + access_token + "&count=30";
            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));
            }
            catch (Exception ex)
            {
            }
            try
            {
                dynamic items = post_data["data"];
                if (items!=null)
                {
                    apiHitsCount++;
                    foreach (var item in items)
                    {
                        string post_url = string.Empty;
                        string feed_url = string.Empty;
                        string user_name = string.Empty;

                        string feed_id = item["id"].ToString();
                        string feed_type = item["type"].ToString();
                        string created_time_feed = item["created_time"].ToString();
                        DateTime create_time_feed = ToDateTime(DateTime.Now, long.Parse(created_time_feed));

                        Domain.Socioboard.Models.Mongo.InstagramSelfFeed send_data = new Domain.Socioboard.Models.Mongo.InstagramSelfFeed();

                        try
                        {
                            if (feed_type.Equals("video"))
                            {
                                try
                                {
                                    post_url = item["videos"]["standard_resolution"]["url"].ToString();
                                    feed_url = item["link"].ToString();
                                    user_name = item["user"]["username"].ToString();
                                }
                                catch (Exception)
                                {
                                }

                            }
                            else if (feed_type.Equals("image"))
                            {
                                try
                                {
                                    post_url = item["images"]["standard_resolution"]["url"].ToString();
                                    feed_url = item["link"].ToString();
                                    user_name = item["user"]["username"].ToString();
                                }
                                catch (Exception)
                                {
                                }
                            }

                            send_data.User_name = user_name;
                            send_data.ProfileId = profile_id;
                            send_data.FeedId = feed_id;
                            send_data.Accesstoken = access_token;
                            send_data.Post_url = post_url;
                            send_data.Link = feed_url;
                            send_data.Type = feed_type;
                            send_data.Created_Time = created_time_feed;
                            var ret = InstagramSelfFeedRepo.Find<Domain.Socioboard.Models.Mongo.InstagramSelfFeed>(t => t.FeedId.Equals(send_data.FeedId));
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            int count = task.Result.Count;

                            if (count < 1)
                            {
                                InstagramSelfFeedRepo.Add(send_data);
                            }
                        }
                        catch (Exception ex)
                        {
                        }



                        try
                        {
                            dynamic likes = item["likes"]["data"];
                            if (likes!=null)
                            {
                                apiHitsCount++;
                                foreach (var like in likes)
                                {
                                    try
                                    {
                                        string liked_by_id = like["id"].ToString();
                                        string liked_by_name = like["username"].ToString();
                                        insert.Profile_Id = profile_id;
                                        insert.Feed_Id = feed_id;
                                        insert.Liked_By_Id = liked_by_id;
                                        insert.Liked_By_Name = liked_by_name;
                                        insert.Feed_Type = feed_type;
                                        insert.Created_Date = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                        insert.Status = 1;
                                        var ret = InstagramPostLikesRepo.Find<Domain.Socioboard.Models.Mongo.InstagramPostLikes>(t => t.Feed_Id.Equals(insert.Feed_Id));
                                        var task = Task.Run(async () =>
                                        {
                                            return await ret;
                                        });
                                        int count = task.Result.Count;

                                        if (count < 1)
                                        {
                                            InstagramPostLikesRepo.Add(insert);
                                        }
                                        code_status = "true";
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


            return code_status;

        }

        public static string GetInstagramPostComments(string profile_id, string access_token)
        {

            MongoRepository InstagramPostCommentsRepo = new MongoRepository("InstagramPostComments");
            string code_status = "false";
            Domain.Socioboard.Models.Mongo.InstagramPostComments insert = new Domain.Socioboard.Models.Mongo.InstagramPostComments();
            JObject post_data = new JObject();
            string url = "https://api.instagram.com/v1/users/" + profile_id + "/media/recent?access_token=" + access_token + "&count=100";
            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            try
            {
                dynamic items = post_data["data"];
                if (items!=null)
                {
                    apiHitsCount++;
                    foreach (var item in items)
                    {

                        Guid Id = Guid.NewGuid();
                        string feed_id = item["id"].ToString();
                        string feed_type = item["type"].ToString();
                        string created_time_feed = item["created_time"].ToString();
                        DateTime create_time_feed = ToDateTime(DateTime.Now, long.Parse(created_time_feed));
                        if (create_time_feed.Date >= DateTime.Now.AddDays(-90).Date)
                        {
                            dynamic comments = item["comments"]["data"];

                            foreach (var comment in comments)
                            {

                                string created_time = comment["created_time"].ToString();
                                DateTime create_time = ToDateTime(DateTime.Now, long.Parse(created_time));
                                string text = comment["text"].ToString();
                                string commented_by_id = comment["from"]["id"].ToString();
                                string commented_by_name = comment["from"]["username"].ToString();
                                string comment_id = comment["id"].ToString();

                                insert.Profile_Id = profile_id;
                                insert.Feed_Id = feed_id;
                                insert.Commented_By_Id = commented_by_id;
                                insert.Commented_By_Name = commented_by_name;
                                insert.Created_Time = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(created_time));
                                insert.Comment_Id = comment_id;
                                insert.Comment = text;
                                insert.Feed_Type = feed_type;
                                var ret = InstagramPostCommentsRepo.Find<Domain.Socioboard.Models.Mongo.InstagramPostComments>(t => t.Feed_Id.Equals(insert.Feed_Id));
                                var task = Task.Run(async () =>
                                {
                                    return await ret;
                                });
                                int count = task.Result.Count;

                                if (count < 1)
                                {
                                    InstagramPostCommentsRepo.Add(insert);
                                }
                                code_status = "true";
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
            }



            return code_status;

        }

        public static void GetInstagramFollowing(string profile_id, string access_token, int status)
        {

            Domain.Socioboard.Models.Mongo.MongoTwitterMessage _MongoTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
            JObject post_data = new JObject();
            string url = "https://api.instagram.com/v1/users/" + profile_id + "/follows?access_token=" + access_token + "&count=100";
            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));

            }
            catch (Exception ex)
            {

            }
            try
            {
                dynamic items = post_data["data"];
                foreach (var item in items)
                {
                    try
                    {
                        Guid Id = Guid.NewGuid();

                        string user_name = item["username"].ToString();
                        string id = item["id"].ToString();
                        string full_name = item["full_name"].ToString();
                        DateTime CreatedTime = DateTime.Now;

                        _MongoTwitterMessage.id = ObjectId.GenerateNewId();
                        _MongoTwitterMessage.messageId = "";
                        _MongoTwitterMessage.profileId = profile_id;
                        _MongoTwitterMessage.fromId = profile_id;
                        _MongoTwitterMessage.fromName = "";
                        _MongoTwitterMessage.RecipientId = id;
                        _MongoTwitterMessage.RecipientName = full_name;
                        _MongoTwitterMessage.twitterMsg = "";
                        _MongoTwitterMessage.fromProfileUrl = "";
                        _MongoTwitterMessage.RecipientName = "";
                        _MongoTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.InstagramFollowing;
                        _MongoTwitterMessage.messageDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        _MongoTwitterMessage.FollowerCount = 0;
                        _MongoTwitterMessage.FollowingCount = 0;
                        _MongoTwitterMessage.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                        var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.RecipientId == _MongoTwitterMessage.RecipientId && t.fromId == _MongoTwitterMessage.fromId && t.type == Domain.Socioboard.Enum.TwitterMessageType.InstagramFollowing);
                        var task = Task.Run(async () => {
                            return await ret;
                        });
                        if (task.Result != null)
                        {
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add(_MongoTwitterMessage);
                            }
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
            }
            catch (Exception ex)
            {

            }


        }

        public static void GetInstagramFollower(string profile_id, string access_token, int status)
        {

            Domain.Socioboard.Models.Mongo.MongoTwitterMessage _MongoTwitterMessage = new Domain.Socioboard.Models.Mongo.MongoTwitterMessage();
            JObject post_data = new JObject();
            string url = "https://api.instagram.com/v1/users/" + profile_id + "/followed-by?access_token=" + access_token + "&cout=100";
            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));
            }
            catch (Exception ex)
            {
            }
            try
            {
                dynamic items = post_data["data"];
                foreach (var item in items)
                {
                    try
                    {
                        Guid Id = Guid.NewGuid();
                        string user_name = item["username"].ToString();
                        string id = item["id"].ToString();
                        string full_name = item["full_name"].ToString();
                        string image_url = item["profile_picture"].ToString();
                        DateTime CreatedTime = DateTime.UtcNow;
                        _MongoTwitterMessage.id = ObjectId.GenerateNewId();
                        _MongoTwitterMessage.profileId = profile_id;
                        _MongoTwitterMessage.fromId = id;
                        _MongoTwitterMessage.fromName = user_name;
                        _MongoTwitterMessage.RecipientId = profile_id;
                        _MongoTwitterMessage.RecipientName = "";
                        _MongoTwitterMessage.fromProfileUrl = image_url;
                        _MongoTwitterMessage.type = Domain.Socioboard.Enum.TwitterMessageType.InstagramFollower;
                        _MongoTwitterMessage.FollowerCount = 0;
                        _MongoTwitterMessage.FollowingCount = 0;
                        _MongoTwitterMessage.readStatus = status;
                        _MongoTwitterMessage.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
                        var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.RecipientId == _MongoTwitterMessage.RecipientId && t.fromId == _MongoTwitterMessage.fromId && t.type == Domain.Socioboard.Enum.TwitterMessageType.InstagramFollower);
                        var task = Task.Run(async()=>{
                            return await ret;
                        });
                        if (task.Result!=null)
                        {
                            int count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add(_MongoTwitterMessage);
                            }
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
            }
            catch (Exception ex)
            {

            }


        }


        public static DateTime ToDateTime(DateTime target, long timestamp)
        {
            var dateTime = new DateTime(1970, 1, 1, 0, 0, 0, target.Kind);

            return dateTime.AddSeconds(timestamp);
        }

        public static string ApiInstagramHttp(string url)
        {
            try
            {

                HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(url);
                httpRequest.Method = "GET";
                httpRequest.ContentType = "application/x-www-form-urlencoded";
                HttpWebResponse httResponse = (HttpWebResponse)httpRequest.GetResponse();
                Stream responseStream = httResponse.GetResponseStream();
                StreamReader responseStreamReader = new StreamReader(responseStream, System.Text.Encoding.Default);
                string pageContent = responseStreamReader.ReadToEnd();
                responseStreamReader.Close();
                responseStream.Close();
                httResponse.Close();
                return pageContent;
            }
            catch (Exception ex)
            {
                return "";
            }

        }
    }
}
