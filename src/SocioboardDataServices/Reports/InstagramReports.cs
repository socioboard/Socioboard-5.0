using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports
{
    public class InstagramReports
    {
        public static void CreateInstagrmaReport()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.AccessToken != null).ToList();
                    foreach (var item in lstInsAcc)
                    {
                        if (item.lastpagereportgenerated.AddHours(24) <= DateTime.UtcNow)
                        {
                            CreateReports(item.InstagramId, item.Is90DayDataUpdated);
                            item.Is90DayDataUpdated = true;
                            item.lastpagereportgenerated = DateTime.UtcNow;
                            dbr.Update<Domain.Socioboard.Models.Instagramaccounts>(item);
                        }
                    }
                    Thread.Sleep(120000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }

        public static void CreateReports(string InstagramId, bool is90daysupdated)
        {
            
            int day = 1;
            if (!is90daysupdated)
            {
                day = 90;
            }
            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetVideoPosts = GetVideoPosts(InstagramId, day);
            List<Domain.Socioboard.Models.Mongo.InstagramFeed> lstGetImagePosts = GetImagePosts(InstagramId, day);
            Domain.Socioboard.Models.Instagramaccounts _InstagramUserDetails = GetInstagramUserDeatils(InstagramId);
            List<Domain.Socioboard.Models.Mongo.InstagramComment> lstGetInstagramPostComments = GetInstagramPostComments(InstagramId, day);
            List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstGetInstagramPostLikes = GetInstagramPostLikes(InstagramId, day);
            List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstMongoTwitterMessage = GetInstagramFollwerFollowing(InstagramId, day);
            for (int i = 1; i < day; i++)
            {
                Domain.Socioboard.Models.Mongo.InstagramDailyReport _InstagramDailyReport = new Domain.Socioboard.Models.Mongo.InstagramDailyReport();
                double since = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(i)).Year, DateTime.UtcNow.AddDays(-(i)).Month, DateTime.UtcNow.AddDays(-(i)).Day, 0, 0, 0, DateTimeKind.Utc));
                double until = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-i).Year, DateTime.UtcNow.AddDays(-i).Month, DateTime.UtcNow.AddDays(-i ).Day, 23, 59, 59, DateTimeKind.Utc));
               // lstGetVideoPosts = lstGetVideoPosts.Where(t => t.FeedDate <= until && t.FeedDate >= since).ToList();
                //lstGetImagePosts= lstGetImagePosts.Where(t => t.FeedDate <= until && t.FeedDate >= since).ToList();
                //lstGetInstagramPostComments= lstGetInstagramPostComments.Where(t => t.Created_Time <= until && t.Created_Time >= since).ToList();
                //lstGetInstagramPostLikes= lstGetInstagramPostLikes.Where(t => t.Created_Date <= until && t.Created_Date >= since).ToList();
                //lstMongoTwitterMessage= lstMongoTwitterMessage.Where(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since).ToList();

                _InstagramDailyReport.id = ObjectId.GenerateNewId();
                _InstagramDailyReport.date = since;
                _InstagramDailyReport.followcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.TwitterMessageType.InstagramFollower));
                _InstagramDailyReport.followingcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.TwitterMessageType.InstagramFollowing));
                _InstagramDailyReport.fullName = _InstagramUserDetails.InsUserName;
                _InstagramDailyReport.imagepost = Convert.ToInt64(lstGetImagePosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                _InstagramDailyReport.instaName = _InstagramUserDetails.InsUserName;
                _InstagramDailyReport.mediaCount = Convert.ToInt64(lstGetVideoPosts.Count(t => t.FeedDate <= until && t.FeedDate >= since) + lstGetImagePosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                _InstagramDailyReport.postcomment = Convert.ToInt64(lstGetInstagramPostComments.Count(t => t.CommentDate <= until && t.CommentDate >= since));
                _InstagramDailyReport.postlike = Convert.ToInt64(lstGetInstagramPostLikes.Count(t => t.Created_Date <= until && t.Created_Date >= since));
                _InstagramDailyReport.profileId = _InstagramUserDetails.InstagramId;
                _InstagramDailyReport.videopost = Convert.ToInt64(lstGetVideoPosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                _InstagramDailyReport.profilePicUrl = _InstagramUserDetails.ProfileUrl;
                MongoRepository mongorepo = new MongoRepository("InstagramDailyReport");
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.InstagramDailyReport>(t => t.date == _InstagramDailyReport.date && t.profileId == InstagramId);
                var task=Task.Run(async()=>{
                    return await ret;
                });
                int count = task.Result.Count;
                if (count<1)
                {
                    mongorepo.Add<Domain.Socioboard.Models.Mongo.InstagramDailyReport>(_InstagramDailyReport); 
                }
            }
        }




        public static List<Domain.Socioboard.Models.Mongo.InstagramFeed> GetVideoPosts(string profileId, int daysCount)
        {
            MongoRepository instagramFeedRepo = new MongoRepository("InstagramFeed");

            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = instagramFeedRepo.Find<Domain.Socioboard.Models.Mongo.InstagramFeed>(t => t.InstagramId == profileId && t.FeedDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.FeedDate >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.Type == "video");
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.InstagramFeed> lstInstagramFeed = task.Result.GroupBy(x => x.FeedId).Select(g => g.First()).ToList();
            return lstInstagramFeed.ToList();
        }
        public static List<Domain.Socioboard.Models.Mongo.InstagramFeed> GetImagePosts(string profileId, int daysCount)
        {
            MongoRepository instagramFeedRepo = new MongoRepository("InstagramFeed");
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = instagramFeedRepo.Find<Domain.Socioboard.Models.Mongo.InstagramFeed>(t => t.InstagramId == profileId && t.FeedDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.FeedDate >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.Type == "image");
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.InstagramFeed> lstInstagramFeed = task.Result.GroupBy(x => x.FeedId).Select(g => g.First()).ToList();
            return lstInstagramFeed.ToList();
        }
        public static Instagramaccounts GetInstagramUserDeatils(string profileId)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            Domain.Socioboard.Models.Instagramaccounts _InstagramUserDetails = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.InstagramId == profileId).FirstOrDefault();
            return _InstagramUserDetails;
        }
        
        public static List<Domain.Socioboard.Models.Mongo.InstagramComment> GetInstagramPostComments(string profileId, int daysCount)
        {
            MongoRepository instagarmCommentRepo = new MongoRepository("InstagramComment");
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = instagarmCommentRepo.Find<Domain.Socioboard.Models.Mongo.InstagramComment>(t => t.InstagramId == profileId && t.CommentDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.CommentDate >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.InstagramComment> lstInstagramPostComments = task.Result.ToList();
            return lstInstagramPostComments.ToList();
        }
        public static List<Domain.Socioboard.Models.Mongo.InstagramPostLikes> GetInstagramPostLikes(string profileId, int daysCount)
        {
            MongoRepository InstagramPostLikesRepo = new MongoRepository("InstagramPostLikes");
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = InstagramPostLikesRepo.Find<Domain.Socioboard.Models.Mongo.InstagramPostLikes>(t => t.Profile_Id == profileId && t.Created_Date <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.Created_Date >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.InstagramPostLikes> lstInstagramPostLikes = task.Result.ToList();
            return lstInstagramPostLikes.ToList();
        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> GetInstagramFollwerFollowing(string profileId, int daysCount)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => t.profileId == profileId && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart) && (t.type==Domain.Socioboard.Enum.TwitterMessageType.InstagramFollower || t.type == Domain.Socioboard.Enum.TwitterMessageType.InstagramFollowing));
            var task = Task.Run(async () => {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstMongoTwitterMessage = task.Result.ToList();
            return lstMongoTwitterMessage.ToList();
        }
    }
}
