using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using FluentScheduler;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Instagram.App.Core;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.MediaMethods;
using Socioboard.Instagram.Instagram.Core.UsersMethods;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Instagram
{
    public class InstagramServiceHelper
    {
        #region Properties
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 300;
        #endregion

        #region Get all Instagram Accounts
        /// <summary>
        /// To get all the instagram accounts
        /// </summary>
        /// <returns>List of instagram accounts</returns>
        private static IEnumerable<Instagramaccounts> GetInstagramAccounts()
        {
            var databaseRepository = new DatabaseRepository();
            var lstInstagramaccount = databaseRepository.Find<Instagramaccounts>(t => t.IsActive).ToList();
            return lstInstagramaccount;
        }
        #endregion

        #region StartInstagramServices
        public void UpdateInstagramAccounts()
        {
            try
            {
                JobManager.AddJob(() =>
                {
                    Thread.CurrentThread.IsBackground = false;
                    var status = DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.InstagramUpdateDetails, objStatus => false);

                    if (!status)
                        StartUpdateAccountDetails();

                }, x => x.ToRunOnceAt(DateTime.Now).AndEvery(10).Minutes());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        #endregion

        #region UpdatingAccounts
        private void StartUpdateAccountDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.InstagramUpdateDetails, true, (enumType, runningStatus) => true);
                var instagramAccounts = GetInstagramAccounts();

                Parallel.ForEach(instagramAccounts, new ParallelOptions { MaxDegreeOfParallelism = 5 }, instagramAccount =>
                {
                    UpdateInstagramFeeds(instagramAccount);
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.InstagramUpdateDetails, true, (enumType, runningStatus) => false);
        }

        private int UpdateInstagramFeeds(Instagramaccounts instagramAccount)
        {
            var databaseRepository = new DatabaseRepository();

            if (instagramAccount.lastUpdate.AddHours(1) <= DateTime.UtcNow)
            {
                if (!instagramAccount.IsActive)
                    return 0;

                UserController objusercontroller = new UserController();
                var configi = new ConfigurationIns(AppSettings.instaAuthUrl, AppSettings.instaClientId, AppSettings.instaClientSecret, AppSettings.instaReturnUrl, AppSettings.instaTokenRetrivelUrl, AppSettings.instaApiBaseUrl, "");
                var _api = oAuthInstagram.GetInstance(configi);

                ParseAndUpdateInstagramAccount(instagramAccount, objusercontroller, databaseRepository);

                GetParseInstagramSelfFeeds(instagramAccount.InstagramId, instagramAccount.AccessToken);
                GetParseInstagramUserDetails(instagramAccount.InstagramId, instagramAccount.AccessToken, instagramAccount);
                GetParseInstagramPostLikes(instagramAccount.InstagramId, instagramAccount.AccessToken);
                GetInstagramPostComments(instagramAccount.InstagramId, instagramAccount.AccessToken);
                GetInstagramFollowing(instagramAccount.InstagramId, instagramAccount.AccessToken);
                GetInstagramFollower(instagramAccount.InstagramId, instagramAccount.AccessToken);
            }
            else
                apiHitsCount = 0;
            return 0;
        }


        private void ParseAndUpdateInstagramAccount(Instagramaccounts insAcc, UserController objusercontroller, DatabaseRepository databaseRepository)
        {
            var objuser = objusercontroller.GetUserDetails(insAcc.InstagramId, insAcc.AccessToken);
            var _grpProfile = databaseRepository.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(insAcc.InstagramId)).ToList();


            if (objuser != null)
            {
                insAcc.ProfileUrl = objuser?.data?.profile_picture ?? insAcc.ProfileUrl;
                _grpProfile.Select(s => { s.profilePic = objuser?.data?.profile_picture ?? insAcc.ProfileUrl; return s; }).ToList();
                insAcc.TotalImages = objuser?.data?.counts.media ?? insAcc.TotalImages;
                insAcc.FollowedBy = objuser?.data?.counts.followed_by ?? insAcc.FollowedBy;
                insAcc.Followers = objuser?.data?.counts.follows ?? insAcc.Followers;
                insAcc.bio = objuser?.data?.bio ?? insAcc.bio;

                foreach (var item_grpProfile in _grpProfile)
                {
                    databaseRepository.Update<Groupprofiles>(item_grpProfile);
                }
                databaseRepository.Update<Instagramaccounts>(insAcc);
            }
        } 
        #endregion

        #region Instagram Methods
        private static void GetParseInstagramSelfFeeds(string instagramId, string accessToken)
        {
            var instagramFeedRepo = new MongoRepository("InstagramFeed");
            try
            {
                var _Media = new Media();
                var usercmts = new InstagramResponse<Comment[]>();
                var objComment = new CommentController();

                string feeds = _Media.UserResentFeeds(instagramId, accessToken);
                if (feeds != null)
                {
                    apiHitsCount++;
                    JObject feed_data = JObject.Parse(feeds);

                    foreach (var item in feed_data["data"])
                    {
                        try
                        {
                            var objInstagramFeed = new InstagramFeed();

                            objInstagramFeed.FeedDate = Convert.ToDouble(item.SelectToken("created_time")?.ToString() ?? "0");
                            objInstagramFeed.FeedId = item.SelectToken("id")?.ToString();
                            objInstagramFeed.Type = item.SelectToken("type")?.ToString();
                            if (objInstagramFeed.Type == "video")
                            {
                                objInstagramFeed.VideoUrl = item.SelectToken("videos.standard_resolution.url")?.ToString();
                            }
                            objInstagramFeed.FeedImageUrl = item.SelectToken("images.standard_resolution.url")?.ToString();
                            objInstagramFeed.InstagramId = instagramId;
                            objInstagramFeed.LikeCount = Int32.Parse(item.SelectToken("likes.count")?.ToString() ?? "0");
                            objInstagramFeed.CommentCount = Int32.Parse(item.SelectToken("comments.count")?.ToString() ?? "0");
                            string str = item.SelectToken("user_has_liked")?.ToString();
                            if (str.ToLower() == "false")
                            {
                                objInstagramFeed.IsLike = 0;
                            }
                            else { objInstagramFeed.IsLike = 1; }
                            objInstagramFeed.AdminUser = item.SelectToken("user.username")?.ToString();
                            objInstagramFeed.Feed = item.SelectToken("caption.text")?.ToString();
                            objInstagramFeed.ImageUrl = item.SelectToken("user.profile_picture")?.ToString();
                            objInstagramFeed.FromId = item.SelectToken("user.id")?.ToString();
                            objInstagramFeed.FeedUrl = item.SelectToken("link")?.ToString();


                            var lstInstagramComment = new List<InstagramComment>();
                            usercmts = objComment.GetComment(objInstagramFeed.FeedId, accessToken);

                            for (int cmt = 0; cmt < usercmts.data.Count(); cmt++)
                            {
                                try
                                {
                                    var objInstagramComment = new InstagramComment();

                                    objInstagramComment.Comment = usercmts?.data[cmt]?.text ?? "0";
                                    objInstagramComment.CommentDate = Convert.ToDouble(usercmts?.data[cmt]?.created_time.ToString() ?? "0");
                                    objInstagramComment.CommentId = usercmts?.data[cmt]?.id ?? "";
                                    objInstagramComment.FeedId = objInstagramFeed?.FeedId ?? "";
                                    objInstagramComment.InstagramId = instagramId;
                                    objInstagramComment.FromName = usercmts?.data[cmt]?.from?.username ?? "";
                                    objInstagramComment.FromProfilePic = usercmts?.data[cmt]?.from?.profile_picture ?? "";

                                    lstInstagramComment.Add(objInstagramComment);
                                }
                                catch (Exception ex)
                                {

                                }
                            }
                            objInstagramFeed._InstagramComment = lstInstagramComment;
                            var ret = instagramFeedRepo.Find<InstagramFeed>(t => t.FeedId.Equals(objInstagramFeed.FeedId) && t.InstagramId.Equals(objInstagramFeed.InstagramId));
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
                                var filter = new BsonDocument("FeedId", objInstagramFeed.FeedId);
                                var update = Builders<BsonDocument>.Update.Set("IsLike", objInstagramFeed.IsLike).Set("CommentCount", objInstagramFeed.CommentCount).Set("LikeCount", objInstagramFeed.LikeCount).Set("Type", objInstagramFeed.Type).Set("VideoUrl", objInstagramFeed.VideoUrl).Set("_InstagramComment", objInstagramFeed._InstagramComment);
                                instagramFeedRepo.Update<InstagramFeed>(update, filter);
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

        private static string GetParseInstagramUserDetails(string profile_id, string access_token, Instagramaccounts instagramaccounts)
        {
            var databaseRepository = new DatabaseRepository();
            string code_status = "false";
            var insert = new InstagramUserDetails();
            var post_data = new JObject();
            string url = "https://api.instagram.com/v1/users/" + profile_id + "?access_token=" + access_token;

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
                var item = post_data["data"];

                if (item != null)
                {
                    apiHitsCount++;
                    try
                    {
                        string insta_name = item.SelectToken("username")?.ToString();
                        string full_name = item.SelectToken("full_name")?.ToString();
                        string imageUrl = item.SelectToken("profile_picture")?.ToString();
                        string media_count = item.SelectToken("counts.media")?.ToString();
                        DateTime Created_Time = DateTime.Now;
                        string follower = item.SelectToken("counts.followed_by")?.ToString();
                        string following = item.SelectToken("counts.follows")?.ToString();


                        if (instagramaccounts != null && instagramaccounts.IsActive == true)
                        {
                            instagramaccounts.TotalImages = Convert.ToInt32(media_count);
                            instagramaccounts.Followers = Convert.ToInt32(follower);
                            instagramaccounts.FollowedBy = Convert.ToInt32(following);
                            instagramaccounts.InsUserName = insta_name;
                            instagramaccounts.ProfileUrl = imageUrl;
                            instagramaccounts.InstagramId = profile_id;
                            databaseRepository.Update(instagramaccounts);
                        }

                        DateTime t1 = DateTime.Now.Date;
                        DateTime t2 = DateTime.Now.Date.AddHours(12);
                        DateTime t3 = DateTime.Now.AddDays(1).Date.AddSeconds(-1);
                        if (DateTime.Now.TimeOfDay >= t1.TimeOfDay && DateTime.Now.TimeOfDay < t2.TimeOfDay)
                        {
                            if (instagramaccounts != null && instagramaccounts.IsActive == true)
                            {
                                instagramaccounts.TotalImages = Convert.ToInt32(media_count);
                                instagramaccounts.Followers = Convert.ToInt32(follower);
                                instagramaccounts.FollowedBy = Convert.ToInt32(following);
                                instagramaccounts.InsUserName = insta_name;
                                instagramaccounts.ProfileUrl = imageUrl;
                                instagramaccounts.InstagramId = profile_id;
                                databaseRepository.Update(instagramaccounts);
                            }
                        }
                        if (DateTime.Now.TimeOfDay >= t2.TimeOfDay && DateTime.Now.TimeOfDay < t3.TimeOfDay)
                        {
                            if (instagramaccounts != null && instagramaccounts.IsActive == true)
                            {
                                instagramaccounts.TotalImages = Convert.ToInt32(media_count);
                                instagramaccounts.Followers = Convert.ToInt32(follower);
                                instagramaccounts.FollowedBy = Convert.ToInt32(following);
                                instagramaccounts.InsUserName = insta_name;
                                instagramaccounts.ProfileUrl = imageUrl;
                                instagramaccounts.InstagramId = profile_id;
                                databaseRepository.Update(instagramaccounts);
                            }
                        }

                        code_status = "true";

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }
                else
                {
                    apiHitsCount = MaxapiHitsCount;
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return code_status;
        }

        private static string GetParseInstagramPostLikes(string profile_id, string access_token)
        {

            var InstagramPostLikesRepo = new MongoRepository("InstagramPostLikes");
            var InstagramSelfFeedRepo = new MongoRepository("InstagramSelfFeed");
            string code_status = "false";
            var insert = new InstagramPostLikes();
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
                var items = post_data["data"];
                if (items != null)
                {
                    apiHitsCount++;
                    foreach (var item in items)
                    {
                        string post_url = string.Empty;
                        string feed_url = string.Empty;
                        string user_name = string.Empty;

                        string feed_id = item.SelectToken("id")?.ToString();
                        string feed_type = item.SelectToken("type")?.ToString();
                        string created_time_feed = item.SelectToken("created_time")?.ToString();
                        DateTime create_time_feed = ToDateTime(DateTime.Now, long.Parse(created_time_feed ?? "0"));

                        var send_data = new InstagramSelfFeed();

                        try
                        {

                            post_url = feed_type == "video" ? item.SelectToken("videos.standard_resolution.url")?.ToString() : item.SelectToken("images.standard_resolution.url")?.ToString();
                            feed_url = item.SelectToken("link")?.ToString();
                            user_name = item.SelectToken("user.username")?.ToString();
                            

                            send_data.User_name = user_name;
                            send_data.ProfileId = profile_id;
                            send_data.FeedId = feed_id;
                            send_data.Accesstoken = access_token;
                            send_data.Post_url = post_url;
                            send_data.Link = feed_url;
                            send_data.Type = feed_type;
                            send_data.Created_Time = created_time_feed;
                            var ret = InstagramSelfFeedRepo.Find<InstagramSelfFeed>(t => t.FeedId.Equals(send_data.FeedId));
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
                            //https://api.instagram.com/v1/media/{media-id}/likes?access_token=ACCESS-TOKEN

                            string like_url = "https://api.instagram.com/v1/media/" + feed_id + "/likes?access_token=" + access_token + "&count=30";
                            post_data = JObject.Parse(ApiInstagramHttp(like_url));

                            var likes_items = post_data["data"];
                            if (likes_items != null)
                            {
                                apiHitsCount++;
                                foreach (var itemLike in likes_items)
                                {
                                    var likes = itemLike.SelectToken("data");
                                    //dynamic likes = item1["likes"]["data"];
                                    if (itemLike != null)
                                    {
                                        apiHitsCount++;
                                        //foreach (var like in likes)
                                        //{
                                        try
                                        {
                                            string liked_by_id = itemLike.SelectToken("id")?.ToString();
                                            string liked_by_name = itemLike.SelectToken("username")?.ToString();
                                            insert.Profile_Id = profile_id;
                                            insert.Feed_Id = feed_id;
                                            insert.Liked_By_Id = liked_by_id;
                                            insert.Liked_By_Name = liked_by_name;
                                            insert.Feed_Type = feed_type;
                                            insert.Created_Date = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                            insert.Status = 1;
                                            var ret = InstagramPostLikesRepo.Find<InstagramPostLikes>(t => t.Liked_By_Id.Equals(insert.Liked_By_Id));

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
                            }
                            //dynamic likes = item["likes"]["data"];

                            else
                            {
                                apiHitsCount = MaxapiHitsCount;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
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
                Console.WriteLine(ex.Message);
            }

            return code_status;
        }

        private static string GetInstagramPostComments(string profile_id, string access_token)
        {

            var InstagramPostCommentsRepo = new MongoRepository("InstagramPostComments");
            var code_status = "false";
            var insert = new InstagramPostComments();
            var post_data = new JObject();
            var url = "https://api.instagram.com/v1/users/" + profile_id + "/media/recent?access_token=" + access_token + "&count=100";
            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));

                var items = post_data.SelectToken("data");

                if (items != null)
                {
                    apiHitsCount++;
                    foreach (var item in items)
                    {

                        Guid Id = Guid.NewGuid();
                        string feed_id = item.SelectToken("id")?.ToString();
                        string feed_type = item.SelectToken("type")?.ToString();
                        string created_time_feed = item.SelectToken("created_time")?.ToString()??"0";
                        DateTime create_time_feed = ToDateTime(DateTime.Now, long.Parse(created_time_feed));
                        if (create_time_feed.Date >= DateTime.Now.AddDays(-90).Date)
                        {
                            var comments = item.SelectToken("comments.data");

                            foreach (var comment in comments)
                            {

                                var created_time = comment.SelectToken("created_time")?.ToString()??"0";
                                DateTime create_time = ToDateTime(DateTime.Now, long.Parse(created_time));
                                var text = comment.SelectToken("text")?.ToString();
                                var commented_by_id = comment.SelectToken("from.id")?.ToString();
                                var commented_by_name = comment.SelectToken("from.username")?.ToString();
                                var comment_id = comment.SelectToken("id")?.ToString();

                                insert.Profile_Id = profile_id;
                                insert.Feed_Id = feed_id;
                                insert.Commented_By_Id = commented_by_id;
                                insert.Commented_By_Name = commented_by_name;
                                insert.Created_Time = SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(created_time));
                                insert.Comment_Id = comment_id;
                                insert.Comment = text;
                                insert.Feed_Type = feed_type;
                                var ret = InstagramPostCommentsRepo.Find<InstagramPostComments>(t => t.Feed_Id.Equals(insert.Feed_Id));
                                var task = Task.Run(async () =>
                                {
                                    return await ret;
                                });
                                var count = task.Result.Count;

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

        private static void GetInstagramFollowing(string profile_id, string access_token)
        {

            var objMessageModel = new MongoMessageModel();
            var post_data = new JObject();
            var next_post_data = new JObject();
            var url = "https://api.instagram.com/v1/users/" + profile_id + "/follows?access_token=" + access_token + "&count=100";
            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));

                var items = post_data.SelectToken("data");
                var link = post_data.SelectToken("pagination");
                var nextpage = link.SelectToken("next_url")?.ToString();
                foreach (var item in items)
                {
                    try
                    {
                        ///*  Guid Id = Guid.NewGuid(*/);

                        var user_name = item.SelectToken("username")?.ToString();
                        var id = item.SelectToken("id")?.ToString();
                        var full_name = item.SelectToken("full_name")?.ToString();
                        DateTime CreatedTime = DateTime.Now;

                        objMessageModel.id = ObjectId.GenerateNewId();
                        objMessageModel.messageId = Generatetxnid();
                        objMessageModel.profileId = profile_id;
                        objMessageModel.fromId = profile_id;
                        objMessageModel.fromName = "";
                        objMessageModel.RecipientId = id;
                        objMessageModel.RecipientName = full_name;
                        objMessageModel.Message = "";
                        objMessageModel.fromProfileUrl = "";
                        objMessageModel.RecipientName = "";
                        objMessageModel.type = Domain.Socioboard.Enum.MessageType.InstagramFollowing;
                        objMessageModel.messageDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                        objMessageModel.FollowerCount = 0;
                        objMessageModel.FollowingCount = 0;
                        objMessageModel.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        var mongorepo = new MongoRepository("MongoMessageModel");
                        var ret = mongorepo.Find<MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.fromId == objMessageModel.fromId && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        if (task.Result != null)
                        {
                            var count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add(objMessageModel);
                            }
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
                do
                {

                    if (nextpage != null)
                    {
                        try
                        {
                            next_post_data = JObject.Parse(ApiInstagramHttp(nextpage));
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    var items1 = next_post_data.SelectToken("data");

                    foreach (var item in items1)
                    {
                        try
                        {


                            var user_name = item.SelectToken("username")?.ToString();
                            var id = item.SelectToken("id")?.ToString();
                            var full_name = item.SelectToken("full_name")?.ToString();
                            DateTime CreatedTime = DateTime.Now;

                            objMessageModel.id = ObjectId.GenerateNewId();
                            objMessageModel.messageId = Generatetxnid();
                            objMessageModel.profileId = profile_id;
                            objMessageModel.fromId = profile_id;
                            objMessageModel.fromName = "";
                            objMessageModel.RecipientId = id;
                            objMessageModel.RecipientName = full_name;
                            objMessageModel.Message = "";
                            objMessageModel.fromProfileUrl = "";
                            objMessageModel.RecipientName = "";
                            objMessageModel.type = Domain.Socioboard.Enum.MessageType.InstagramFollowing;
                            objMessageModel.messageDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                            objMessageModel.FollowerCount = 0;
                            objMessageModel.FollowingCount = 0;
                            objMessageModel.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                            var mongorepo = new MongoRepository("MongoMessageModel");
                            var ret = mongorepo.Find<MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.fromId == objMessageModel.fromId && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing);
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            if (task.Result != null)
                            {
                                var count = task.Result.Count;
                                if (count < 1)
                                {
                                    mongorepo.Add(objMessageModel);
                                }
                            }
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    link = next_post_data.SelectToken("pagination");
                    nextpage = link.SelectToken("next_url")?.ToString();

                }
                while (next_post_data != null);


            }
            catch (Exception ex)
            {

            }


        }

        private static void GetInstagramFollower(string profile_id, string access_token)
        {

            var objMessageModel = new MongoMessageModel();
            var post_data = new JObject();
            var next_post_data = new JObject();
            var url = "https://api.instagram.com/v1/users/" + profile_id + "/followed-by?access_token=" + access_token + "&cout=500";

            try
            {
                post_data = JObject.Parse(ApiInstagramHttp(url));

                var items = post_data.SelectToken("data");
                var link = post_data.SelectToken("pagination");
                var nextpage = link.SelectToken("next_url")?.ToString();
                foreach (var item in items)
                {
                    try
                    {
                        //Guid Id = Guid.NewGuid();
                        var user_name = item.SelectToken("username")?.ToString();
                        var id = item.SelectToken("id")?.ToString();
                        var full_name = item.SelectToken("full_name")?.ToString();
                        var image_url = item.SelectToken("profile_picture")?.ToString();
                        var CreatedTime = DateTime.UtcNow;
                        objMessageModel.id = ObjectId.GenerateNewId();
                        objMessageModel.profileId = profile_id;
                        objMessageModel.fromId = id;
                        objMessageModel.fromName = user_name;
                        objMessageModel.messageId = Generatetxnid();
                        objMessageModel.RecipientId = profile_id;
                        objMessageModel.RecipientName = "";
                        objMessageModel.fromProfileUrl = image_url;
                        objMessageModel.type = Domain.Socioboard.Enum.MessageType.InstagramFollower;
                        objMessageModel.FollowerCount = 0;
                        objMessageModel.FollowingCount = 0;
                        objMessageModel.readStatus = 1;
                        objMessageModel.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        var mongorepo = new MongoRepository("MongoMessageModel");
                        var ret = mongorepo.Find<MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.fromId == objMessageModel.fromId && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollower);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        if (task.Result != null)
                        {
                            var count = task.Result.Count;
                            if (count < 1)
                            {
                                mongorepo.Add(objMessageModel);
                            }
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
                do
                {

                    if (nextpage != null)
                    {
                        try
                        {
                            next_post_data = JObject.Parse(ApiInstagramHttp(nextpage));

                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    var items1 = next_post_data.SelectToken("data");

                    foreach (var item in items1)
                    {
                        try
                        {


                            //Guid Id = Guid.NewGuid();
                            var user_name = item.SelectToken("username")?.ToString();
                            var id = item.SelectToken("id")?.ToString();
                            var full_name = item.SelectToken("full_name")?.ToString();
                            var image_url = item.SelectToken("profile_picture")?.ToString();
                            var CreatedTime = DateTime.UtcNow;
                            objMessageModel.id = ObjectId.GenerateNewId();
                            objMessageModel.profileId = profile_id;
                            objMessageModel.fromId = id;
                            objMessageModel.fromName = user_name;
                            objMessageModel.messageId = Generatetxnid();
                            objMessageModel.RecipientId = profile_id;
                            objMessageModel.RecipientName = "";
                            objMessageModel.fromProfileUrl = image_url;
                            objMessageModel.type = Domain.Socioboard.Enum.MessageType.InstagramFollower;
                            objMessageModel.FollowerCount = 0;
                            objMessageModel.FollowingCount = 0;
                            objMessageModel.readStatus = 1;
                            objMessageModel.messageTimeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                            var mongorepo = new MongoRepository("MongoMessageModel");
                            var ret = mongorepo.Find<MongoMessageModel>(t => t.RecipientId == objMessageModel.RecipientId && t.fromId == objMessageModel.fromId && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollower);
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            if (task.Result != null)
                            {
                                var count = task.Result.Count;
                                if (count < 1)
                                {
                                    mongorepo.Add(objMessageModel);
                                }
                            }
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                    link = next_post_data.SelectToken("pagination");
                    nextpage = link.SelectToken("next_url")?.ToString();

                }
                while (next_post_data != null);


            }
            catch (Exception ex)
            {

            }

        }

        #region Utilities
        private static string Generatetxnid()
        {

            var rnd = new Random();
            var strHash = Generatehash512(rnd.ToString() + DateTime.Now);
            var txnid1 = strHash.ToString().Substring(0, 20);

            return txnid1;
        }

        private static string Generatehash512(string text)
        {

            var message = Encoding.UTF8.GetBytes(text);
            var UE = new UnicodeEncoding();
            var hashString = new SHA512Managed();
            var hex = "";
            var hashValue = hashString.ComputeHash(message);
            foreach (byte x in hashValue)
            {
                hex += String.Format("{0:x2}", x);
            }
            return hex;

        }
        private static DateTime ToDateTime(DateTime target, long timestamp)
        {
            try
            {
                var dateTime = new DateTime(1970, 1, 1, 0, 0, 0, target.Kind);
                return dateTime.AddSeconds(timestamp);

            }
            catch (Exception)
            {
                return DateTime.Now;
            }
        }

        private static string ApiInstagramHttp(string url)
        {
            try
            {

                var httpRequest = (HttpWebRequest)WebRequest.Create(url);
                httpRequest.Method = "GET";
                httpRequest.ContentType = "application/x-www-form-urlencoded";
                var httResponse = (HttpWebResponse)httpRequest.GetResponse();
                Stream responseStream = httResponse.GetResponseStream();
                var responseStreamReader = new StreamReader(responseStream, System.Text.Encoding.Default);
                var pageContent = responseStreamReader.ReadToEnd();
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
        #endregion


        #endregion

    }
}
