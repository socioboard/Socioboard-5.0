using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using FluentScheduler;
using MongoDB.Bson;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports
{
    public class InstagramReportsServicesHelper
    {
        #region Get all instagram accounts
        /// <summary>
        /// Get all instagram accounts
        /// </summary>
        /// <returns></returns>
        private static IEnumerable<Instagramaccounts> GetInstagramAccounts()
        {
            var databaseRepository = new DatabaseRepository();
            var lstInstagramAccounts = databaseRepository.Find<Instagramaccounts>(t => t.AccessToken != null && t.InstagramId == "8328684648").ToList();
            return lstInstagramAccounts;
        }
        #endregion

        #region InstagramReportsServicesStart
        public void CreateInstagramReports()
        {
            try
            {
                JobManager.AddJob(() =>
                {
                    Thread.CurrentThread.IsBackground = false;
                    var status = DataServicesBase.ActivityRunningStatus.GetOrAdd(ServiceDetails.InstagramReportUpdateDetails, objStatus => false);

                    if (!status)
                        StartUpdateReportDetails();

                }, x => x.ToRunOnceAt(DateTime.Now).AndEvery(10).Minutes());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        #endregion

        #region Start Update for Reports
        private void StartUpdateReportDetails()
        {
            try
            {
                DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.InstagramReportUpdateDetails, true, (enumType, runningStatus) => true);
                var instagramAccounts = GetInstagramAccounts();
                var databaseRepository = new DatabaseRepository();

                Parallel.ForEach(instagramAccounts, new ParallelOptions { MaxDegreeOfParallelism = 1 }, instagramAccount =>
                {
                    UpdateInstagramReport(instagramAccount, databaseRepository);
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            DataServicesBase.ActivityRunningStatus.AddOrUpdate(ServiceDetails.InstagramReportUpdateDetails, true, (enumType, runningStatus) => false);
        }

        private void UpdateInstagramReport(Instagramaccounts insatgramAccount, DatabaseRepository databaseRepository)
        {
            try
            {
                if (insatgramAccount.lastpagereportgenerated.AddHours(24) <= DateTime.UtcNow)
                {
                    CreateReports(insatgramAccount.InstagramId, insatgramAccount.Is90DayDataUpdated);
                    insatgramAccount.Is90DayDataUpdated = true;
                    insatgramAccount.lastpagereportgenerated = DateTime.UtcNow;
                    databaseRepository.Update(insatgramAccount);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        #endregion

        #region Start creating instagram reports
        private void CreateReports(string instagramId, bool is90DayDataUpdated)
        {
            try
            {
                var day = 1;
                if (!is90DayDataUpdated)
                    day = 90;

                var lstGetVideoPosts = GetVideoPosts(instagramId, day);
                var lstGetImagePosts = GetImagePosts(instagramId, day);
                var _InstagramUserDetails = GetInstagramUserDeatils(instagramId);
                var lstGetInstagramPostComments = GetInstagramPostComments(instagramId, day);
                var lstGetInstagramPostLikes = GetInstagramPostLikes(instagramId, day);
                var lstMongoTwitterMessage = GetInstagramFollwerFollowing(instagramId, day);

                for (int dayCount = 1; dayCount < day; dayCount++)
                {
                    var instaDailyRepostObj = new InstagramDailyReport();
                    var since = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-(dayCount)).Year, DateTime.UtcNow.AddDays(-(dayCount)).Month, DateTime.UtcNow.AddDays(-(dayCount)).Day, 0, 0, 0, DateTimeKind.Utc));
                    var until = SBHelper.ConvertToUnixTimestamp(new DateTime(DateTime.UtcNow.AddDays(-dayCount).Year, DateTime.UtcNow.AddDays(-dayCount).Month, DateTime.UtcNow.AddDays(-dayCount).Day, 23, 59, 59, DateTimeKind.Utc));


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
                    var ret = mongoRepo.Find<InstagramDailyReport>(t => t.date == instaDailyRepostObj.date && t.profileId == instagramId);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });

                    if (task.Result.Count < 1)
                        mongoRepo.Add(instaDailyRepostObj);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        } 
        #endregion

        #region Instagram methods for reports
        private List<InstagramFeed> GetVideoPosts(string profileId, int daysCount)
        {
            try
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
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return new List<InstagramFeed>();
            }
        }
        private List<InstagramFeed> GetImagePosts(string profileId, int daysCount)
        {
            try
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
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return new List<InstagramFeed>();
            }
        }
        private Instagramaccounts GetInstagramUserDeatils(string profileId)
        {
            var databaseRepository = new DatabaseRepository();
            var instagramUserDetails = databaseRepository.Find<Instagramaccounts>(t => t.InstagramId == profileId).FirstOrDefault();
            return instagramUserDetails;
        }

        private List<InstagramComment> GetInstagramPostComments(string profileId, int daysCount)
        {
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
        private List<InstagramPostLikes> GetInstagramPostLikes(string profileId, int daysCount)
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

        private List<MongoMessageModel> GetInstagramFollwerFollowing(string profileId, int daysCount)
        {
            var mongoRepo = new MongoRepository("MongoMessageModel");
            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-(daysCount)).Year, DateTime.UtcNow.AddDays(-(daysCount)).Month, DateTime.UtcNow.AddDays(-(daysCount)).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var ret = mongoRepo.Find<MongoMessageModel>(t => t.profileId == profileId && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart) && (t.type == Domain.Socioboard.Enum.MessageType.InstagramFollower || t.type == Domain.Socioboard.Enum.MessageType.InstagramFollowing));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            var lstInstagramFollowerFollowing = task.Result.ToList();
            return lstInstagramFollowerFollowing;
        } 
        #endregion
    }
}
