using Domain.Socioboard.Helpers;
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
    public class TwitterReports
    {
        public static void CreateTwitterReports()
        {
            Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isAccessTokenActive && t.isActive).ToList();
                    foreach (var item in lstTwtAcc)
                    {
                        CreateReports(item.twitterUserId, DateTime.UtcNow);
                        cache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterMessageReportsByProfileId + item.twitterUserId);
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

        public static void CreateTwitterPrevious90DaysReports()
        {
            try
            {
                Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isAccessTokenActive && t.isActive).ToList();
                foreach (var item in lstTwtAcc)
                {
                    for (int i = 1; i < 90; i++)
                    {
                        CreateReports(item.twitterUserId, DateTime.UtcNow.AddDays(-1 * i));
                    }
                    cache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterMessageReportsByProfileId + item.twitterUserId);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("issue in web api calling" + ex.StackTrace);
                Thread.Sleep(600000);
            }
        }

        public static void CreateReports(string profileId,DateTime date)
        {
            List<MongoTwitterMessage> lstTwitterMessages = TwitterReports.GetTwitterMessages(profileId,date);
            List<MongoTwitterDirectMessages> lstTwitterDirectMessages = TwitterReports.GetTwitterDirectMessages(profileId,date);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports");

            MongoTwitterDailyReports todayReports = new MongoTwitterDailyReports();
            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterMention);
            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower);
            todayReports.timeStamp = SBHelper.ConvertToUnixTimestamp(date);
            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet);
            //todayReports.newFollowing = lstTwitterMessages.Count(t=>t.type == Domain.Socioboard.Enum.TwitterMessageType.)
            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageReceived);
            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageSent);
            todayReports.profileId = profileId;
            todayReports.id = ObjectId.GenerateNewId();
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterDailyReports>(t => t.profileId.Equals(profileId) && (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<MongoTwitterDailyReports> lstDailyReports = task.Result;
            if (lstDailyReports != null && lstDailyReports.Count() > 0)
            {
                lstDailyReports.First().mentions = todayReports.mentions;
                lstDailyReports.First().newFollowers = todayReports.newFollowers;
                lstDailyReports.First().newFollowing = todayReports.newFollowing;
                lstDailyReports.First().profileId = profileId;
                lstDailyReports.First().timeStamp = SBHelper.ConvertToUnixTimestamp(date);
                lstDailyReports.First().directMessagesSent = todayReports.directMessagesSent;
                lstDailyReports.First().directMessagesReceived = todayReports.directMessagesReceived;
                mongorepo.UpdateReplace(lstDailyReports.First(), t => t.id == lstDailyReports.First().id);
            }
            else
            {
                mongorepo.Add<MongoTwitterDailyReports>(todayReports);
            }
        }

        private static List<MongoTwitterMessage> GetTwitterMessages(string profileId, DateTime date)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterMessage>(t => (t.profileId.Equals(profileId) && t.messageTimeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.messageTimeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoTwitterMessage> lstTwtMessages = task.Result;
            return lstTwtMessages.ToList();
        }

        private static List<MongoTwitterDirectMessages> GetTwitterDirectMessages(string profileId, DateTime date)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterDirectMessages>(t => ( t.recipientId.Equals(profileId)|| t.senderId.Equals(profileId)) &&(t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages> lstTwtMessages = task.Result;
            return lstTwtMessages.ToList();
        }

        

    }
}
