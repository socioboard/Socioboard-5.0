using Domain.Socioboard.Helpers;
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
                    //lstTwtAcc = lstTwtAcc.Where<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == "758233674978426880").ToList();
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
                //lstTwtAcc = lstTwtAcc.Where<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == "758233674978426880").ToList();
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
            List<MongoMessageModel> lstTwitterMessages = TwitterReports.GetTwitterMessages(profileId,date);
            List<MongoMessageModel> lstreceived= lstTwitterMessages.Where(x=>x.fromId.Contains(profileId)).ToList();
            List<MongoDirectMessages> lstTwitterDirectMessages = TwitterReports.GetTwitterDirectMessages(profileId,date);
            List<Domain.Socioboard.Models.ScheduledMessage> lstschedule = GetScheduledMessage(profileId,date);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports");

            MongoTwitterDailyReports todayReports = new MongoTwitterDailyReports();
            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
            todayReports.timeStamp = SBHelper.ConvertToUnixTimestamp(date);
            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
            //todayReports.newFollowing = lstTwitterMessages.Count(t=>t.type == Domain.Socioboard.Enum.MessageType.tw)
            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
            todayReports.profileId = profileId;
            todayReports.id = ObjectId.GenerateNewId();
            todayReports.messagesReceived = lstreceived.Count()+ lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
            todayReports.messagesSent = lstschedule.Count();
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
                lstDailyReports.First().messagesReceived = todayReports.messagesReceived;
                lstDailyReports.First().messagesSent = todayReports.messagesSent;
                mongorepo.UpdateReplace(lstDailyReports.First(), t => t.id == lstDailyReports.First().id);
            }
            else
            {
                mongorepo.Add<MongoTwitterDailyReports>(todayReports);
            }
        }


        public static List<Domain.Socioboard.Models.ScheduledMessage> GetScheduledMessage(string profileId, DateTime date)
        {
            try
            {
                DatabaseRepository dbr = new DatabaseRepository();
                DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);

                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessages = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => (t.profileId.Equals(profileId) && t.scheduleTime > dayStart && t.scheduleTime < dayEnd)).ToList();
                return lstScheduledMessages;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }
        public static List<MongoMessageModel> GetTwitterMessages(string profileId, DateTime date)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoMessageModel");
                DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
                var result = mongorepo.Find<MongoMessageModel>(t => (t.profileId.Equals(profileId) && t.messageTimeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.messageTimeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwtMessages = task.Result;
                return lstTwtMessages.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        public static List<MongoDirectMessages> GetTwitterDirectMessages(string profileId, DateTime date)
        {
            try
            {
                MongoRepository mongorepo = new MongoRepository("MongoDirectMessages");
                DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
                DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
                var result = mongorepo.Find<MongoDirectMessages>(t => (t.recipientId.Equals(profileId) || t.senderId.Equals(profileId)) && (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayStart)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayEnd)));
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwtMessages = task.Result;
                return lstTwtMessages.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return null;
            }
        }

        

    }
}
