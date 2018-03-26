using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports
{
    public class GroupReports
    {

        public static void CreateGroupReports()
        {
            Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.Groups> grpid = dbr.FindAll<Domain.Socioboard.Models.Groups>().ToList();
                    //var grpids = grpid.GroupBy(t => t.id).ToList();
                     // grpid = grpid.Where(t => t.id== 1152529).ToList();  
                    foreach (var item in grpid)
                    {
                        CreateReports(item.id, DateTime.UtcNow);
                        Console.WriteLine("item name" + item.groupName);
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
        public static void CreateGroupPrevious90DaysReports()
        {
            try
            {
                Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.Groups> lstTwtAcc = dbr.FindAll<Domain.Socioboard.Models.Groups>().ToList();
                foreach (var item in lstTwtAcc)
                {
                    for (int i = 0; i < 90; i++)
                    {
                        CreateReports(item.id, DateTime.UtcNow.AddDays(-1 * i));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("issue in web api calling" + ex.StackTrace);
                Thread.Sleep(600000);
            }
        }

        public static void CreateReports(long groupId, DateTime date)
        {
            MongoRepository mongoreppo = new MongoRepository("GroupdailyReports");
            Domain.Socioboard.Models.Mongo.GroupdailyReports _GroupdailyReports = new Domain.Socioboard.Models.Mongo.GroupdailyReports();
            string getsexratiodata = gettwittersexdivision(groupId, date);
            string[] ratiodata = getsexratiodata.Split(',');
            _GroupdailyReports.date = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
            try
            {
                _GroupdailyReports.fbfan = getfbfans(groupId, date);
            }
            catch (Exception)
            {
            }
            _GroupdailyReports.femalecount = Convert.ToInt64(ratiodata[1]);
            _GroupdailyReports.GroupId = groupId;
            _GroupdailyReports.id = ObjectId.GenerateNewId();
            try
            {
                _GroupdailyReports.inbox = getinboxcount(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.inbox = 0;
            }
            try
            {
                _GroupdailyReports.interaction = getinteractions(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.interaction = 0;
            }
            _GroupdailyReports.malecount = Convert.ToInt64(ratiodata[0]);
            try
            {
                _GroupdailyReports.sent = getsentmessage(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.sent = 0;
            }
            try
            {
                _GroupdailyReports.twitterfollower = gettwitterfollowers(groupId, date);
            }
            catch {
                _GroupdailyReports.twitterfollower = 0;
            }
            try
            {
                _GroupdailyReports.twitter_account_count = total_twitter_accounts(groupId);
            }
            catch (Exception)
            {
                _GroupdailyReports.twitter_account_count = 0;
            }
            try
            {
                _GroupdailyReports.twtmentions = gettwtmentions(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.twtmentions = 0;
            }
            try
            {
                _GroupdailyReports.twtretweets = gettwtretweets(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.twtretweets = 0;
            }
            try
            {
                _GroupdailyReports.uniqueusers = uniquetwitteruser(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.uniqueusers = 0;
            }
            try
            {
                _GroupdailyReports.plainText = getsentmessagePlainText(groupId, date);
            }
            catch (Exception ex)
            {
                _GroupdailyReports.plainText = 0;
            }
            try
            {
                _GroupdailyReports.photoLinks = getsentmessagephotoLinks(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.photoLinks = 0;
            }
            try
            {
                _GroupdailyReports.linkstoPages = getsentmessagelinkstoPages(groupId, date);
            }
            catch (Exception)
            {
                _GroupdailyReports.linkstoPages = 0;
            }
            try
            {
                _GroupdailyReports.facebookPageCount = facebookPageCount(groupId);
            }
            catch (Exception)
            {
                _GroupdailyReports.facebookPageCount = 0;
            }
            var ret = mongoreppo.Find<Domain.Socioboard.Models.Mongo.GroupdailyReports>(t => t.date == SBHelper.ConvertToUnixTimestamp(date) && t.GroupId == groupId);
            var task=Task.Run(async()=>
            {
                return await ret;
            });
            IList<Domain.Socioboard.Models.Mongo.GroupdailyReports> lstDailyReports = task.Result.ToList();
            if (lstDailyReports.Count() > 0)
            {
                lstDailyReports.First().uniqueusers = _GroupdailyReports.uniqueusers;
                lstDailyReports.First().twtretweets = _GroupdailyReports.twtretweets;
                lstDailyReports.First().twtmentions = _GroupdailyReports.twtmentions;
                lstDailyReports.First().twitter_account_count = _GroupdailyReports.twitter_account_count;
                lstDailyReports.First().date = SBHelper.ConvertToUnixTimestamp(date);
                lstDailyReports.First().twitterfollower = _GroupdailyReports.twitterfollower;
                lstDailyReports.First().sent = _GroupdailyReports.sent;
                lstDailyReports.First().malecount = _GroupdailyReports.malecount;
                lstDailyReports.First().femalecount = _GroupdailyReports.femalecount;
                lstDailyReports.First().interaction = _GroupdailyReports.interaction;
                lstDailyReports.First().inbox = _GroupdailyReports.inbox;
                lstDailyReports.First().GroupId = _GroupdailyReports.GroupId;
                lstDailyReports.First().fbfan = _GroupdailyReports.fbfan;
                lstDailyReports.First().linkstoPages = _GroupdailyReports.linkstoPages;
                lstDailyReports.First().photoLinks = _GroupdailyReports.photoLinks;
                lstDailyReports.First().plainText = _GroupdailyReports.plainText;
                lstDailyReports.First().facebookPageCount = _GroupdailyReports.facebookPageCount;
                mongoreppo.UpdateReplace(lstDailyReports.First(), t => t.id == lstDailyReports.First().id);
            }
            else
            {
                mongoreppo.Add<Domain.Socioboard.Models.Mongo.GroupdailyReports>(_GroupdailyReports);
            }
        }
        public static long getinboxcount(long groupId, DateTime date)
        {
         
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => lstStr.Contains(t.recipientId) && t.timeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long TwitterIncommingMessages = task.Result.Count;
           
            return TwitterIncommingMessages;
        }


        public static long getsentmessagelinkstoPages(long groupId, DateTime date)
        {
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => lstStr.Contains(t.senderId) && t.timeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long TwitterSentMessages = task.Result.Count;
            //List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart && !string.IsNullOrEmpty(t.url)).ToList();
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart && (t.shareMessage.Contains("http://") || t.shareMessage.Contains("https://") || t.shareMessage.Contains("www."))).ToList();

            TwitterSentMessages = TwitterSentMessages + lstScheduledMessage.Count;

            return TwitterSentMessages;
        }
        public static long getsentmessagephotoLinks(long groupId, DateTime date)
        {
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => lstStr.Contains(t.senderId) && t.timeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long TwitterSentMessages = task.Result.Count;
            //List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart && !string.IsNullOrEmpty(t.picUrl)).ToList();
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart && (t.url != null && (t.url.Contains("https://") ||t.url.Contains("http://")))).ToList();

            TwitterSentMessages = TwitterSentMessages + lstScheduledMessage.Count;

            return TwitterSentMessages;
        }

        public static long getsentmessagePlainText(long groupId, DateTime date)
        {
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => lstStr.Contains(t.senderId) && t.timeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long TwitterSentMessages = task.Result.Count;
            //  List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart && string.IsNullOrEmpty(t.picUrl) && string.IsNullOrEmpty(t.url)).ToList();
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart && !t.url.Contains("http") && !t.url.Contains("https") && !t.url.Contains("www.") && !t.shareMessage.Contains("http://") && !t.shareMessage.Contains("https://") && !t.shareMessage.Contains("www.")).ToList();
            TwitterSentMessages = TwitterSentMessages + lstScheduledMessage.Count;

            return TwitterSentMessages;
        }
        public static long getsentmessage(long groupId, DateTime date)
        {
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => lstStr.Contains(t.senderId) && t.timeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long TwitterSentMessages = task.Result.Count;
            List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => lstStr.Contains(t.profileId) && t.status == Domain.Socioboard.Enum.ScheduleStatus.Compleated && t.scheduleTime <= dayEnd && t.scheduleTime >= dayStart).ToList();
            TwitterSentMessages = TwitterSentMessages + lstScheduledMessage.Count;
           
            return TwitterSentMessages;
        }
        public static long gettwitterfollowers(long groupId, DateTime date)
        {
           
            DatabaseRepository dbr = new DatabaseRepository();
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            long TwitterFollowerCount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => lstStr.Contains(t.twitterUserId)).Sum(t => t.followersCount);
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => lstStr.Contains(t.profileId) && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long followercount = task.Result.Count;
            TwitterFollowerCount = TwitterFollowerCount + followercount;
          
            return TwitterFollowerCount;
        }
        public static long getfbfans(long groupId, DateTime date)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            long fbfansCount = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => lstStr.Contains(t.FbUserId) && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage).Sum(t => t.Friends);
            return fbfansCount;
        }
        public static long getinteractions(long groupId, DateTime date)
        {
            long getinteractions = 0;
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepoDm = new MongoRepository("MongoTwitterDirectMessages");
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => lstStr.Contains(t.RecipientId) && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
              {
                  return await ret;
              });
            long twtmessagecount = task.Result.Count;

            var retDm = mongorepoDm.Find<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(t => lstStr.Contains(t.senderId) && t.timeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.timeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var taskDm = Task.Run(async () =>
            {
                return await retDm;
            });
            long twtdmmessagecount = taskDm.Result.Count;
            getinteractions = twtdmmessagecount + twtmessagecount;
            return getinteractions;
        }
        public static long gettwtmentions(long groupId, DateTime date)
        {
            long gettwtmentions = 0;
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => lstStr.Contains(t.RecipientId) && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterMention && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            gettwtmentions = task.Result.Count;
            return gettwtmentions;
        }
        public static long gettwtretweets(long groupId, DateTime date)
        {
            long gettwtretweets = 0;
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => lstStr.Contains(t.RecipientId) && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterRetweet && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            gettwtretweets = task.Result.Count;
            return gettwtretweets;
        }
        public static long uniquetwitteruser(long groupId, DateTime date)
        {
            long uniquetwitteruser = 0;
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => lstStr.Contains(t.RecipientId) && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.readStatus == 0);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            uniquetwitteruser = task.Result.Count;
            return uniquetwitteruser;
        }
        public static long total_twitter_accounts(long groupId)
        {
            long totaltwtaccount = 0;
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            totaltwtaccount = lstgrpProfiles.Count;
            return totaltwtaccount;
        }

        public static long facebookPageCount(long groupId)
        {
            long totalfacebookPageCount = 0;
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
            totalfacebookPageCount = lstgrpProfiles.Count;
            return totalfacebookPageCount;
        }
        public static string gettwittersexdivision(long groupId, DateTime date)
        {
            string gettwittersexdivision = string.Empty;
            long malecount = 0;
            long femalecount = 0;
            string firstname = string.Empty;
            DateTime dayStart = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(date.Year, date.Month, date.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoTwitterMessage>(t => lstStr.Contains(t.profileId) && t.type == Domain.Socioboard.Enum.TwitterMessageType.TwitterFollower && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.readStatus == 0);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long totalcount = task.Result.Count;
            if (totalcount > 0)
            {
                foreach (Domain.Socioboard.Models.Mongo.MongoTwitterMessage twtfollowername in task.Result.ToList())
                {
                    if (twtfollowername.fromName.Contains(" "))
                    {
                        firstname = twtfollowername.fromName.Split(' ')[0];
                    }
                    else
                    {
                        firstname = twtfollowername.fromName;
                    }

                    Domain.Socioboard.Models.TwitterNameTable _TwitterNameTable = dbr.Single<Domain.Socioboard.Models.TwitterNameTable>(t => t.Name == firstname);
                    if (_TwitterNameTable != null)
                    {
                        if (_TwitterNameTable.Gender == 1)
                        {
                            malecount++;
                        }

                    }
                    else
                    {

                        int length = (firstname.Length) / 2;
                        string sub_name = firstname.Substring(0, length);
                        List<Domain.Socioboard.Models.TwitterNameTable> root_names = dbr.Find<Domain.Socioboard.Models.TwitterNameTable>(x => x.Name.Contains(sub_name)).ToList();
                        int returndata = cosine_similarity(root_names, firstname);
                        if (returndata == 1)
                        {
                            malecount++;
                        }

                    }
                }
            }
            femalecount = 100 - malecount;
            return malecount.ToString() + "," + femalecount.ToString(); ;
        }
        public static int cosine_similarity(List<Domain.Socioboard.Models.TwitterNameTable> names, string nametomatch)
        {

            nametomatch = nametomatch.ToLower();
            Dictionary<char, int> alphabets = new Dictionary<char, int>();
            alphabets.Add('a', 0);
            alphabets.Add('b', 1);
            alphabets.Add('c', 2);
            alphabets.Add('d', 3);
            alphabets.Add('e', 4);
            alphabets.Add('f', 5);
            alphabets.Add('g', 6);
            alphabets.Add('h', 7);
            alphabets.Add('i', 8);
            alphabets.Add('j', 9);
            alphabets.Add('k', 10);
            alphabets.Add('l', 11);
            alphabets.Add('m', 12);
            alphabets.Add('n', 13);
            alphabets.Add('o', 14);
            alphabets.Add('p', 15);
            alphabets.Add('q', 16);
            alphabets.Add('r', 17);
            alphabets.Add('s', 18);
            alphabets.Add('t', 19);
            alphabets.Add('u', 20);
            alphabets.Add('v', 21);
            alphabets.Add('w', 22);
            alphabets.Add('x', 23);
            alphabets.Add('y', 24);
            alphabets.Add('z', 25);
            int ret_gender = 1;
            double similarity = 0.0;
            double max_similarity = 0.0;
            int prod = 0;
            int sq_a = 0;
            int sq_b = 0;
            double srt_a;
            double srt_b;
            int pos;
            int[] a_array = new int[26];
            int[] b_array = new int[26];
            List<double> ar = new List<double>();

            foreach (Domain.Socioboard.Models.TwitterNameTable name in names)
            {
                try
                {
                    name.Name = name.Name.ToLower();
                    name.Name = name.Name.Split(' ')[0];
                    for (int i = 0; i < 26; i++)
                    {
                        a_array[i] = 0;
                        b_array[i] = 0;
                    }

                    foreach (char c in nametomatch)
                    {
                        pos = alphabets[c];
                        a_array[pos]++;
                    }

                    foreach (char c in name.Name)
                    {
                        pos = alphabets[c];
                        b_array[pos]++;
                    }

                    for (int i = 0; i < 26; i++)
                    {

                        prod += a_array[i] * b_array[i];

                    }


                    for (int i = 0; i < 26; i++)
                    {
                        sq_a += a_array[i] * a_array[i];
                        sq_b += b_array[i] * b_array[i];
                    }

                    srt_a = Math.Sqrt(sq_a);
                    srt_b = Math.Sqrt(sq_b);

                    similarity = (prod * 100) / (srt_a * srt_b);

                    ar.Add(similarity);
                }
                catch (Exception ex)
                {
                }

            }

            int lstcount = ar.Count;

            for (int i = 0; i < lstcount; i++)
            {

                if (ar[i] > max_similarity)
                {
                    max_similarity = ar[i];
                }


            }

            for (int i = 0; i < lstcount; i++)
            {

                if (ar[i] == max_similarity)
                {

                    ret_gender = names[i].Gender;
                }

            }

            return ret_gender;
        }
    }
}
