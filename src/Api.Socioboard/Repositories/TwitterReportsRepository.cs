using Api.Socioboard.Model;
using System.Collections.Generic;
using Domain.Socioboard.Models.Mongo;
using System;
using Domain.Socioboard.Helpers;
using System.Threading.Tasks;
using System.Linq;
using MongoDB.Bson;
using Domain.Socioboard.ViewModels;

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
    }
}
