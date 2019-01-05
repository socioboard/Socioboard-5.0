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
using SocioboardDataServices.Helper;

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
                    var databaseRepository = new DatabaseRepository();
                    //List<Domain.Socioboard.Models.Instagramaccounts> lstInsAcc = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.AccessToken != null).ToList();
                    var lstInstagramAccounts = databaseRepository.Find<Instagramaccounts>(t => t.AccessToken != null && t.InstagramId == "8328684648").ToList();

                    // lstInsAcc = lstInsAcc.Where(r => r.InstagramId.Contains("1479225281")).ToList();
                    foreach (var instaAccount in lstInstagramAccounts)
                    {
                        if (instaAccount.lastpagereportgenerated.AddHours(24) <= DateTime.UtcNow)
                        {
                            CreateReports(instaAccount.InstagramId, instaAccount.Is90DayDataUpdated);
                            instaAccount.Is90DayDataUpdated = true;
                            instaAccount.lastpagereportgenerated = DateTime.UtcNow;
                            databaseRepository.Update(instaAccount);
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
            
            var day = 1;
            if (!is90daysupdated)
                day = 90;

            var lstGetVideoPosts = GetVideoPosts(InstagramId, day);
            var lstGetImagePosts = GetImagePosts(InstagramId, day);
            var _InstagramUserDetails = GetInstagramUserDeatils(InstagramId);
            var lstGetInstagramPostComments = GetInstagramPostComments(InstagramId, day);
            var lstGetInstagramPostLikes = GetInstagramPostLikes(InstagramId, day);
            var lstMongoTwitterMessage = GetInstagramFollwerFollowing(InstagramId, day);

            for (int dayCount = 1; dayCount < day; dayCount++)
            {
                var instaDailyRepostObj = new InstagramDailyReport();
                var since = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(dayCount)).Year, DateTime.UtcNow.AddDays(-(dayCount)).Month, DateTime.UtcNow.AddDays(-(dayCount)).Day, 0, 0, 0, DateTimeKind.Utc));
                var until = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-dayCount).Year, DateTime.UtcNow.AddDays(-dayCount).Month, DateTime.UtcNow.AddDays(-dayCount ).Day, 23, 59, 59, DateTimeKind.Utc));

                //lstGetVideoPosts = lstGetVideoPosts.Where(t => t.FeedDate <= until && t.FeedDate >= since).ToList();
                //lstGetImagePosts= lstGetImagePosts.Where(t => t.FeedDate <= until && t.FeedDate >= since).ToList();
                //lstGetInstagramPostComments= lstGetInstagramPostComments.Where(t => t.Created_Time <= until && t.Created_Time >= since).ToList();
                //lstGetInstagramPostLikes= lstGetInstagramPostLikes.Where(t => t.Created_Date <= until && t.Created_Date >= since).ToList();
                //lstMongoTwitterMessage= lstMongoTwitterMessage.Where(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since).ToList();

                instaDailyRepostObj.id = ObjectId.GenerateNewId();
                instaDailyRepostObj.date = since;
                instaDailyRepostObj.followcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollower));
                instaDailyRepostObj.followingcount = Convert.ToInt64(lstMongoTwitterMessage.Count(t => t.messageTimeStamp <= until && t.messageTimeStamp >= since && t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing));
                instaDailyRepostObj.fullName = _InstagramUserDetails.InsUserName;
                instaDailyRepostObj.imagepost = Convert.ToInt64(lstGetImagePosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                instaDailyRepostObj.instaName = _InstagramUserDetails.InsUserName;
                instaDailyRepostObj.mediaCount = Convert.ToInt64(lstGetVideoPosts.Count(t => t.FeedDate <= until && t.FeedDate >= since) + lstGetImagePosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                instaDailyRepostObj.postcomment = Convert.ToInt64(lstGetInstagramPostComments.Count(t => t.CommentDate <= until && t.CommentDate >= since));
                instaDailyRepostObj.postlike = Convert.ToInt64(lstGetInstagramPostLikes.Count(t => t.Created_Date <= until && t.Created_Date >= since));
                instaDailyRepostObj.profileId = _InstagramUserDetails.InstagramId;
                instaDailyRepostObj.videopost = Convert.ToInt64(lstGetVideoPosts.Count(t => t.FeedDate <= until && t.FeedDate >= since));
                instaDailyRepostObj.profilePicUrl = _InstagramUserDetails.ProfileUrl;

                var mongoRepo = new MongoRepository("InstagramDailyReport");
                var ret = mongoRepo.Find<InstagramDailyReport>(t => t.date == instaDailyRepostObj.date && t.profileId == InstagramId);
                var task=Task.Run(async()=>{
                    return await ret;
                });

                if (task.Result.Count < 1)
                    mongoRepo.Add(instaDailyRepostObj); 
            }
        }




        public static List<InstagramFeed> GetVideoPosts(string profileId, int daysCount)
        {
            var instagramFeedRepo = new MongoRepository("InstagramFeed");

            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = instagramFeedRepo.Find<InstagramFeed>(t => t.InstagramId == profileId && t.FeedDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.FeedDate >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.Type == "video");
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            var lstInstagramFeed = task.Result.GroupBy(x => x.FeedId).Select(g => g.First()).ToList();
            return lstInstagramFeed.ToList();
        }
        public static List<InstagramFeed> GetImagePosts(string profileId, int daysCount)
        {
            var instagramFeedRepo = new MongoRepository("InstagramFeed");
            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = instagramFeedRepo.Find<InstagramFeed>(t => t.InstagramId == profileId && t.FeedDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.FeedDate >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.Type == "image");
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            var lstInstagramFeed = task.Result.GroupBy(x => x.FeedId).Select(g => g.First()).ToList();
            return lstInstagramFeed;
        }
        private static Instagramaccounts GetInstagramUserDeatils(string profileId)
        {
            var databaseRepository = new DatabaseRepository();
            var instagramUserDetails = databaseRepository.Find<Instagramaccounts>(t => t.InstagramId == profileId).FirstOrDefault();
            return instagramUserDetails;
        }
        
        public static List<InstagramComment> GetInstagramPostComments(string profileId, int daysCount)
        {
            //MongoRepository instagarmCommentRepo = new MongoRepository("InstagramComment");
            //DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            //DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            //var ret = instagarmCommentRepo.Find<Domain.Socioboard.Models.Mongo.InstagramComment>(t => t.InstagramId == profileId && t.CommentDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.CommentDate >= SBHelper.ConvertToUnixTimestamp(dayStart));
            //var task = Task.Run(async () =>
            //{
            //    return await ret;
            //});
            //IList<Domain.Socioboard.Models.Mongo.InstagramComment> lstInstagramPostComments = task.Result.ToList();


            var lstInstagramPostComments = new List<InstagramComment>();
            var instagramFeedRepo = new MongoRepository("InstagramFeed");
            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = instagramFeedRepo.Find<InstagramFeed>(t => t.InstagramId == profileId && t.FeedDate <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.FeedDate >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.Type == "image");
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            var lstInstagramFeed = task.Result.GroupBy(x => x.FeedId).Select(g => g.First()).ToList();

            foreach (var instagramFeedItem in lstInstagramFeed.ToList())
            {
                lstInstagramPostComments.AddRange(instagramFeedItem._InstagramComment);
            }
            return lstInstagramPostComments.ToList();
        }
        public static List<InstagramPostLikes> GetInstagramPostLikes(string profileId, int daysCount)
        {
            var InstagramPostLikesRepo = new MongoRepository("InstagramPostLikes");
            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = InstagramPostLikesRepo.Find<InstagramPostLikes>(t => t.Profile_Id == profileId && t.Created_Date <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.Created_Date >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            var lstInstagramPostLikes = task.Result.ToList();
            return lstInstagramPostLikes;
        }

        public static List<MongoMessageModel> GetInstagramFollwerFollowing(string profileId, int daysCount)
        {
            var mongoRepo = new MongoRepository("MongoMessageModel");
            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = mongoRepo.Find<MongoMessageModel>(t => t.profileId == profileId && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart) && (t.type==Domain.Socioboard.Enum.MessageType.InstagramFollower || t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing));
            var task = Task.Run(async () => {
                return await ret;
            });
            var lstInstagramFollowerFollowing = task.Result.ToList();
            return lstInstagramFollowerFollowing;
        }
    }
}
