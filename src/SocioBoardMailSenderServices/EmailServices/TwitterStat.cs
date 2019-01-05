using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using SocioBoardMailSenderServices.Helper;
using SocioBoardMailSenderServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
namespace SocioBoardMailSenderServices.EmailServices
{
    public class TwitterStat
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
                        CreateReports(item.twitterUserId, DateTime.UtcNow, DateTime.UtcNow.AddDays(-90));
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

        //public static void CreateTwitterPrevious90DaysReports()
        //{
        //    try
        //    {
        //        Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
        //        DatabaseRepository dbr = new DatabaseRepository();
        //        List<Domain.Socioboard.Models.TwitterAccount> lstTwtAcc = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.isAccessTokenActive && t.isActive).ToList();
        //        foreach (var item in lstTwtAcc)
        //        {
        //            for (int i = 1; i < 90; i++)
        //            {
        //                CreateReports(item.twitterUserId, DateTime.UtcNow.AddDays(-1 * i));
        //            }
        //            cache.Delete(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterMessageReportsByProfileId + item.twitterUserId);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("issue in web api calling" + ex.StackTrace);
        //        Thread.Sleep(600000);
        //    }
        //}

        public static void CreateReports(string profileId, DateTime start ,DateTime end)
        {
            List<MongoMessageModel> lstTwitterMessages = TwitterStat.GetTwitterMessages(profileId, start,end);
            List<MongoDirectMessages> lstTwitterDirectMessages = TwitterStat.GetTwitterDirectMessages(profileId, start,end);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDailyReports");

            MongoTwitterDailyReports todayReports = new MongoTwitterDailyReports();
            todayReports.mentions = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
            todayReports.newFollowers = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower);
            todayReports.timeStamp = SBHelper.ConvertToUnixTimestamp(start);
            todayReports.retweets = lstTwitterMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
            //todayReports.newFollowing = lstTwitterMessages.Count(t=>t.type == Domain.Socioboard.Enum.TwitterMessageType.)
            todayReports.directMessagesReceived = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageReceived);
            todayReports.directMessagesSent = lstTwitterDirectMessages.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterDirectMessageSent);
            todayReports.profileId = profileId;
            todayReports.id = ObjectId.GenerateNewId();
            DateTime dayStart = new DateTime(start.Year, start.Month, start.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(end.Year, end.Month, end.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoTwitterDailyReports>(t => t.profileId.Equals(profileId) && (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayEnd)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayStart)));
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
                lstDailyReports.First().timeStamp = SBHelper.ConvertToUnixTimestamp(start);
                lstDailyReports.First().directMessagesSent = todayReports.directMessagesSent;
                lstDailyReports.First().directMessagesReceived = todayReports.directMessagesReceived;
                mongorepo.UpdateReplace(lstDailyReports.First(), t => t.id == lstDailyReports.First().id);
            }
            else
            {
                mongorepo.Add<MongoTwitterDailyReports>(todayReports);
            }
        }

        public static string gettwittersexdivision(long groupId, DateTime start, DateTime end)
        {
            string gettwittersexdivision = string.Empty;
            long malecount = 0;
            long femalecount = 0;
            string firstname = string.Empty;
            DateTime dayStart = new DateTime(start.Year, start.Month, start.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(end.Year, end.Month, end.Day, 23, 59, 59, DateTimeKind.Utc);
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DatabaseRepository dbr = new DatabaseRepository();
            List<Domain.Socioboard.Models.Groupprofiles> lstgrpProfiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            string[] lstStr = lstgrpProfiles.Select(t => t.profileId).ToArray();
            var ret = mongorepo.Find<Domain.Socioboard.Models.Mongo.MongoMessageModel>(t => lstStr.Contains(t.profileId) && t.type == Domain.Socioboard.Enum.MessageType.TwitterFollower && t.messageTimeStamp <= SBHelper.ConvertToUnixTimestamp(dayEnd) && t.messageTimeStamp >= SBHelper.ConvertToUnixTimestamp(dayStart) && t.readStatus == 0);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            long totalcount = task.Result.Count;
            if (totalcount > 0)
            {
                foreach (Domain.Socioboard.Models.Mongo.MongoMessageModel twtfollowername in task.Result.ToList())
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

        public static List<MongoMessageModel> GetTwitterMessages(string profileId, DateTime start,DateTime end)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterMessage");
            DateTime dayStart = new DateTime(start.Year, start.Month, start.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(end.Year, end.Month, end.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoMessageModel>(t => (t.profileId.Equals(profileId) && t.messageTimeStamp > SBHelper.ConvertToUnixTimestamp(dayEnd)) && (t.messageTimeStamp < SBHelper.ConvertToUnixTimestamp(dayStart)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoMessageModel> lstTwtMessages = task.Result;
            return lstTwtMessages.ToList();
        }

        public static List<MongoDirectMessages> GetTwitterDirectMessages(string profileId, DateTime start,DateTime end)
        {
            MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages");
            DateTime dayStart = new DateTime(start.Year, start.Month, start.Day, 0, 0, 0, DateTimeKind.Utc);
            DateTime dayEnd = new DateTime(end.Year, end.Month, end.Day, 23, 59, 59, DateTimeKind.Utc);
            var result = mongorepo.Find<MongoDirectMessages>(t => (t.recipientId.Equals(profileId) || t.senderId.Equals(profileId)) && (t.timeStamp > SBHelper.ConvertToUnixTimestamp(dayEnd)) && (t.timeStamp < SBHelper.ConvertToUnixTimestamp(dayStart)));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<Domain.Socioboard.Models.Mongo.MongoDirectMessages> lstTwtMessages = task.Result;
            return lstTwtMessages.ToList();
        }



    }
}

