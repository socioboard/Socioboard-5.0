using Api.Socioboard.Model;
using System.Collections.Generic;
using Domain.Socioboard.Models.Mongo;
using System;
using Domain.Socioboard.Helpers;
using System.Threading.Tasks;
using System.Linq;
using MongoDB.Bson;
using Domain.Socioboard.ViewModels;
using Api.Socioboard.Helper;
using Newtonsoft.Json.Linq;

namespace Api.Socioboard.Repositories
{
    

    public class TwitterReportsRepository
    {
        public static void CreateTodayReports(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<MongoTwitterMessage> lstTwitterMessages = TwitterReportsRepository.GetTodayMessages(profileId, userId, _redisCache, settings);
            List<MongoTwitterDirectMessages> lstTwitterDirectMessages = TwitterReportsRepository.GetTodayDirectMessages(profileId, userId, _redisCache, settings);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports", settings);

            MongoTwitterDailyReports todayReports = new MongoTwitterDailyReports();
            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterMention);
            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower);
            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet);
            todayReports.timeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
            //todayReports.newFollowing = lstTwitterMessages.Count(t=>t.type == Domain.Socioboard.Enum.TwitterMessageType.)
            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageReceived);
            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageSent);
            todayReports.profileId = profileId;
            todayReports.id = ObjectId.GenerateNewId();
            DateTime dayStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterDailyReports>(t => (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<MongoTwitterDailyReports> lstDailyReports = task.Result;
            if(lstDailyReports != null && lstDailyReports.Count()> 0)
            {
                lstDailyReports.First().mentions = todayReports.mentions;
                lstDailyReports.First().newFollowers = todayReports.newFollowers;
                lstDailyReports.First().newFollowing = todayReports.newFollowing;
                lstDailyReports.First().profileId = profileId;
                lstDailyReports.First().timeStamp = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                lstDailyReports.First().directMessagesSent = todayReports.directMessagesSent;
                lstDailyReports.First().directMessagesReceived = todayReports.directMessagesReceived;
                mongorepo.UpdateReplace(lstDailyReports.First(), t => t.id == lstDailyReports.First().id);
            }
            else
            {
                mongorepo.Add<MongoTwitterDailyReports>(todayReports);
            }
        }

        private static List<MongoTwitterMessage> GetTodayMessages(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", settings);
            DateTime dayStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterMessage>(t => (t.messageTimeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.messageTimeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstTwtMessages = task.Result;
            return lstTwtMessages.ToList();
        }

        private static List<MongoTwitterDirectMessages> GetTodayDirectMessages(string profileId, long userId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages", settings);
            DateTime dayStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterDirectMessages>(t => (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> lstTwtMessages = task.Result;
            return lstTwtMessages.ToList();
        }


        public static List<MongoTwitterDailyReports> GetTwitterMessageReports(string profileId, int dayCount, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            List<MongoTwitterDailyReports> inMemReports = _redisCache.Get<List<MongoTwitterDailyReports>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterMessageReportsByProfileId + profileId);
            if (inMemReports != null && inMemReports.Count > 0)
            {
                return inMemReports;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports", settings);
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-90).Year, DateTime.UtcNow.AddDays(-90).Month, DateTime.UtcNow.AddDays(-90).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var result = mongorepo.Find<MongoTwitterDailyReports>(t => t.profileId.Equals(profileId) && (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoTwitterDailyReports> lstDailyReports = task.Result;
                _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterMessageReportsByProfileId + profileId, lstDailyReports.ToList());
                return lstDailyReports.ToList();
            }
        }


        public static List<TwitterFan> GetTopFiveFans(string profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage", settings);
            DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-1 * daysCount).Year, DateTime.UtcNow.AddDays(-1 * daysCount).Month, DateTime.UtcNow.AddDays(-1 * daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterMessage>(t => (t.messageTimeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.messageTimeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)) && t.profileId==profileId && (t.type==Domain.Socioboard.Enum.TwitterMessageType.TwitterMention|| t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstTwtMessages = task.Result;
            List<TwitterFan> lstTwtTopFans = lstTwtMessages.GroupBy(t => t.fromId).Select(g => new TwitterFan(g.ToList())).OrderBy(x=>x.totalCount).Take(5).ToList();
            return lstTwtTopFans;

        }

       public static Domain.Socioboard.Models.Mongo.TwitterRecentDetails GetTwitterRecentDetails(string profileId, Helper.Cache _redisCache, Helper.AppSettings settings)
        {
            MongoRepository mongorepo = new MongoRepository("TwitterRecentDetails",settings);
            var result = mongorepo.Find<TwitterRecentDetails>(t =>t.TwitterId.Contains(profileId));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<TwitterRecentDetails> lstTwitterRecentDetails = task.Result.ToList();
            if(lstTwitterRecentDetails.Count>0)
            {
                return lstTwitterRecentDetails[0];
            }
            else
            {
                return new TwitterRecentDetails();
            }
        }


        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports> gettwitterReport(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports", _appSettings);
            List<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports> inMemFacaebookPageDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMemFacaebookPageDailyReports != null)
            {
                return inMemFacaebookPageDailyReports;
            }
            else
            {
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports>(t => profileId.Contains(t.profileId) && t.timeStamp <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports> lstfbpagereportdata = task.Result.ToList();
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbpagereportdata.ToList());
                    }
                    return lstfbpagereportdata.OrderBy(t => t.timeStamp).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> gettwitterfeedsreport(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", _appSettings);
            List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> inMeminstagramfeedsReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMeminstagramfeedsReports != null)
            {
                return inMeminstagramfeedsReports;
            }
            else
            {
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>(t => profileId.Contains(t.profileId) && t.feedTimeStamp <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.feedTimeStamp >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.MongoTwitterFeed> lstfbpagereportdata = task.Result.ToList();
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbpagereportdata.ToList());
                    }
                    return lstfbpagereportdata.OrderBy(t => t.feedTimeStamp).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.MongoTwitterFeed>();
            }
        }

        public static List<Domain.Socioboard.Models.Mongo.twtfollowfollowing> gettwtfollofollowingReport(string[] profileId, int daysCount, Helper.Cache _redisCache, Helper.AppSettings _appSettings, DatabaseRepository dbr)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports", _appSettings);
            List<Domain.Socioboard.Models.Mongo.twtfollowfollowing> inMemtwtDailyReports = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.twtfollowfollowing>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId);
            if (inMemtwtDailyReports != null)
            {
                return inMemtwtDailyReports;
            }
            else
            {
                List<Domain.Socioboard.Models.Mongo.twtfollowfollowing> reportdata = new List<twtfollowfollowing>();
                DateTime dayStart = new DateTime(DateTime.UtcNow.AddDays(-daysCount).Year, DateTime.UtcNow.AddDays(-daysCount).Month, DateTime.UtcNow.AddDays(-daysCount).Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);
                var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports>(t => profileId.Contains(t.profileId) && t.timeStamp <= Helper.DateExtension.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= Helper.DateExtension.ConvertToUnixTimestamp(dayStart));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });

                if (task.Result != null)
                {
                    IList<Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports> lstfbpagereportdata = task.Result.ToList();
                    var Instapid = lstfbpagereportdata.GroupBy(x => x.profileId).Select(x => x.First()).ToList();
                    var random = new Random();
                    foreach (Domain.Socioboard.Models.Mongo.MongoTwitterDailyReports twtprofiledata in Instapid)
                    {
                       // DatabaseRepository dbr = new DatabaseRepository(_logger, _appEnv);
                        List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = new List<Domain.Socioboard.Models.TwitterAccount>();
                        Domain.Socioboard.Models.TwitterAccount twtAcc = Repositories.TwitterRepository.getTwitterAccount(twtprofiledata.profileId, _redisCache, dbr);
                        //Domain.Socioboard.Models.TwitterAccount twtAccname = dbr.Find().twtAccname();
                        var randomColor = String.Format("#{0:X6}", random.Next(0x1000000));
                        Domain.Socioboard.Models.Mongo.twtfollowfollowing repo = new twtfollowfollowing();
                        long twtFollowerCount = lstfbpagereportdata.ToList().Where(t => t.profileId == twtprofiledata.profileId).Sum(t => t.newFollowers);
                        long twtFollowingCount = lstfbpagereportdata.ToList().Where(t => t.profileId == twtprofiledata.profileId).Sum(t => t.newFollowing);
                        repo.startdate = dayStart;
                        repo.endtdate = dayEnd;
                        repo.twtFollowerCounts = twtFollowerCount;
                        repo.twtFollowingCounts = twtFollowingCount;
                        repo.profileId = twtprofiledata.profileId;

                        repo.twtName = twtAcc.twitterScreenName;
                        repo.profilepic = twtAcc.profileImageUrl;
                        repo.colors = Convert.ToString(randomColor);
                        reportdata.Add(repo);
                    }
                    // long TwitterFollowerCount = lstfbpagereportdata.ToList().Where(t => profileId.Contains(t.profileId)).Sum(t => t.followcount);
                    if (lstfbpagereportdata.Count > 0)
                    {
                        _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheInstagramDailyReport + profileId, lstfbpagereportdata.ToList());
                    }
                    return reportdata.OrderBy(t => t.startdate).ToList();
                    // return lstfbpagereportdata.OrderBy(t => t.date).ToList();
                }
                return new List<Domain.Socioboard.Models.Mongo.twtfollowfollowing>();
            }

        }
    }
}
