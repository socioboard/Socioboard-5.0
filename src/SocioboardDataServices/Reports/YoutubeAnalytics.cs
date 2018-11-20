using Domain.Socioboard.Models;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Google.Youtube.Core;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.Youtube.Core;
using SocioboardDataServices.Helper;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports
{
    public class YoutubeAnalytics
    {

        public void UpdateYAnalyticsReports()
        {
            while (true)
            {

                try
                {

                    var databaseRepository = new DatabaseRepository();

                    var objOauthTokenYoutube = new oAuthTokenYoutube(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    var objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    var ObjYAnalytics = new YAnalytics(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);

                    var lstYtChannels = databaseRepository.Find<YoutubeChannel>(t => t.IsActive).ToList();
                    var count = 0;

                    Console.WriteLine("---------------- Youtube Analytics Dataservices Started ----------------");
                    foreach (var youtubeChannelItem in lstYtChannels)
                    {
                        #region count for mongo data
                        var mongoreposs = new MongoRepository("YoutubeReportsData");
                        var result = mongoreposs.Find<YoutubeReports>(t => t.channelId.Equals(youtubeChannelItem.YtubeChannelId));
                        var task = Task.Run(async () =>
                        {
                            return await result;
                        });
                        var lstYanalytics = task.Result;
                        var count90AnalyticsUpdated = lstYanalytics.Count();
                        #endregion

                        try
                        {
                            if (!youtubeChannelItem.Days90Update || count90AnalyticsUpdated < 90)
                            {
                                if (youtubeChannelItem.IsActive)
                                {
                                    try
                                    {
                                        ////////code of reports here///////////////////////

                                        var to_Date = DateTime.UtcNow;
                                        var to_dd = ("0" + Convert.ToString(to_Date.Day));
                                        to_dd = to_dd.Substring(to_dd.Length - 2);
                                        var to_mm = "0" + Convert.ToString(to_Date.Month);
                                        to_mm = to_mm.Substring(to_mm.Length - 2);
                                        var to_yyyy = Convert.ToString(to_Date.Year);
                                        var from_Date = DateTime.UtcNow.AddDays(-90);
                                        var from_dd = "0" + Convert.ToString(from_Date.Day);
                                        from_dd = from_dd.Substring(from_dd.Length - 2);
                                        var from_mm = "0" + Convert.ToString(from_Date.Month);
                                        from_mm = from_mm.Substring(from_mm.Length - 2);
                                        var from_yyyy = Convert.ToString(from_Date.Year);
                                        var YaFrom_Date = from_yyyy + "-" + from_mm + "-" + from_dd;
                                        var YaTo_Date = to_yyyy + "-" + to_mm + "-" + to_dd;


                                        var mongorepo = new MongoRepository("YoutubeReportsData");


                                        var AnalyticData = ObjYAnalytics.Get_YAnalytics_ChannelId(youtubeChannelItem.YtubeChannelId, youtubeChannelItem.RefreshToken, YaFrom_Date, YaTo_Date);
                                        var JAnalyticData = JObject.Parse(AnalyticData);

                                        var dataArray = (JArray)JAnalyticData["rows"];

                                        var datesJdata = new List<string>();
                                        if (dataArray != null)
                                        {
                                            foreach (var rows in dataArray)
                                            {
                                                datesJdata.Add(rows[0].ToString());
                                            }

                                            foreach (var items in dataArray)
                                            {
                                                var objYtReports = new YoutubeReports();

                                                objYtReports.Id = ObjectId.GenerateNewId();
                                                objYtReports.date = items[0].ToString();
                                                objYtReports.channelId = items[1].ToString();
                                                objYtReports.SubscribersGained = Convert.ToInt32(items[2]);
                                                objYtReports.views = Convert.ToInt32(items[3]);
                                                objYtReports.likes = Convert.ToInt32(items[4]);
                                                objYtReports.comments = Convert.ToInt32(items[5]);
                                                objYtReports.dislikes = Convert.ToInt32(items[7]);
                                                objYtReports.subscribersLost = Convert.ToInt32(items[8]);
                                                objYtReports.averageViewDuration = Convert.ToInt64(items[9]);
                                                objYtReports.estimatedMinutesWatched = Convert.ToInt64(items[10]);
                                                objYtReports.annotationClickThroughRate = Convert.ToInt64(items[11]);
                                                objYtReports.annotationCloseRate = Convert.ToInt64(items[12]);
                                                objYtReports.uniqueIdentifier = youtubeChannelItem.YtubeChannelId + "_" + objYtReports.date;
                                                objYtReports.datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(objYtReports.date)));

                                                mongorepo.Add(objYtReports);
                                            }
                                        }
                                        else
                                        {
                                            datesJdata.Add("Null");
                                        }

                                        for (var i = 1; i <= 90; i++)
                                        {
                                            YoutubeReports objYreports = new YoutubeReports();
                                            DateTime dateTimeTemp = DateTime.UtcNow.AddDays(-i);

                                            var now_dd = "0" + Convert.ToString(dateTimeTemp.Day);
                                            now_dd = now_dd.Substring(now_dd.Length - 2);
                                            var now_mm = "0" + Convert.ToString(dateTimeTemp.Month);
                                            now_mm = now_mm.Substring(now_mm.Length - 2);
                                            var now_yyyy = Convert.ToString(dateTimeTemp.Year);
                                            var Ynow_Date = now_yyyy + "-" + now_mm + "-" + now_dd;

                                            if (!(datesJdata.Contains(Ynow_Date)))
                                            {
                                                objYreports.Id = ObjectId.GenerateNewId();
                                                objYreports.date = Ynow_Date;
                                                objYreports.channelId = youtubeChannelItem.YtubeChannelId;
                                                objYreports.SubscribersGained = 0;
                                                objYreports.views = 0;
                                                objYreports.likes = 0;
                                                objYreports.comments = 0;
                                                objYreports.dislikes = 0;
                                                objYreports.subscribersLost = 0;
                                                objYreports.averageViewDuration = 0;
                                                objYreports.estimatedMinutesWatched = 0;
                                                objYreports.annotationClickThroughRate = 0;
                                                objYreports.annotationCloseRate = 0;
                                                objYreports.uniqueIdentifier = youtubeChannelItem.YtubeChannelId + "_" + Ynow_Date;
                                                objYreports.datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(Ynow_Date)));

                                                mongorepo.Add(objYreports);
                                            }
                                        }

                                        youtubeChannelItem.Days90Update = true;
                                        youtubeChannelItem.LastReport_Update = DateTime.UtcNow;
                                        databaseRepository.Update(youtubeChannelItem);
                                    }
                                    catch (Exception)
                                    {
                                        Thread.Sleep(600000);
                                    }
                                }
                            }
                            else
                            {
                                if (youtubeChannelItem.LastReport_Update.AddHours(24) < DateTime.UtcNow)
                                {
                                    //dailyReport Code here//

                                    if (youtubeChannelItem.IsActive)
                                    {
                                        try
                                        {
                                            //code of reports here//
                                            var to_Date = DateTime.UtcNow;
                                            var to_dd = "0" + Convert.ToString(to_Date.Day);
                                            to_dd = to_dd.Substring(to_dd.Length - 2);
                                            var to_mm = "0" + Convert.ToString(to_Date.Month);
                                            to_mm = to_mm.Substring(to_mm.Length - 2);
                                            var to_yyyy = Convert.ToString(to_Date.Year);
                                            var from_Date = DateTime.UtcNow.AddDays(-4);
                                            var from_dd = "0" + Convert.ToString(from_Date.Day);
                                            from_dd = from_dd.Substring(from_dd.Length - 2);
                                            var from_mm = "0" + Convert.ToString(from_Date.Month);
                                            from_mm = from_mm.Substring(from_mm.Length - 2);
                                            var from_yyyy = Convert.ToString(from_Date.Year);
                                            var YaFrom_Date = from_yyyy + "-" + from_mm + "-" + from_dd;
                                            var YaTo_Date = to_yyyy + "-" + to_mm + "-" + to_dd;



                                            var AnalyticData = ObjYAnalytics.Get_YAnalytics_ChannelId(youtubeChannelItem.YtubeChannelId, youtubeChannelItem.RefreshToken, YaFrom_Date, YaTo_Date);
                                            var JAnalyticData = JObject.Parse(AnalyticData);

                                            var dataArray = (JArray)JAnalyticData["rows"];

                                            var datesJdata = new List<string>();
                                            if (dataArray != null)
                                            {
                                                foreach (var rows in dataArray)
                                                {
                                                    datesJdata.Add(rows[0].ToString());
                                                }

                                                foreach (var items in dataArray)
                                                {
                                                    var objYReports = new YoutubeReports();

                                                    objYReports.Id = ObjectId.GenerateNewId();
                                                    objYReports.date = items[0].ToString();
                                                    objYReports.channelId = items[1].ToString();
                                                    objYReports.SubscribersGained = Convert.ToInt32(items[2]);
                                                    objYReports.views = Convert.ToInt32(items[3]);
                                                    objYReports.likes = Convert.ToInt32(items[4]);
                                                    objYReports.comments = Convert.ToInt32(items[5]);
                                                    objYReports.shares= Convert.ToInt32(items[6]);
                                                    objYReports.dislikes = Convert.ToInt32(items[7]);
                                                    objYReports.subscribersLost = Convert.ToInt32(items[8]);
                                                    objYReports.averageViewDuration = Convert.ToInt64(items[9]);
                                                    objYReports.estimatedMinutesWatched = Convert.ToInt64(items[10]);
                                                    objYReports.annotationClickThroughRate = Convert.ToInt64(items[11]);
                                                    objYReports.annotationCloseRate = Convert.ToInt64(items[12]);
                                                    objYReports.uniqueIdentifier = youtubeChannelItem.YtubeChannelId + "_" + objYReports.date;
                                                    objYReports.datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(objYReports.date)));


                                                    try
                                                    {
                                                        var mongoRepotsRepo = new MongoRepository("YoutubeReportsData");
                                                        var ret = mongoRepotsRepo.Find<YoutubeReports>(t => t.uniqueIdentifier.Equals(objYReports.uniqueIdentifier));
                                                        var task_Reports = Task.Run(async () =>
                                                        {
                                                            return await ret;
                                                        });
                                                        var count_Reports = task_Reports.Result.Count;
                                                        if (count_Reports < 1)
                                                        {
                                                            try
                                                            {
                                                                mongoRepotsRepo.Add(objYReports);
                                                            }
                                                            catch { }
                                                        }
                                                        else
                                                        {
                                                            try
                                                            {
                                                                var filter = new BsonDocument("uniqueIdentifier", objYReports.uniqueIdentifier);
                                                                var update = Builders<BsonDocument>.Update.Set("SubscribersGained", objYReports.SubscribersGained).Set("views", objYReports.views).Set("likes", objYReports.likes).Set("comments", objYReports.comments).Set("dislikes", objYReports.dislikes).Set("subscribersLost", objYReports.subscribersLost).Set("averageViewDuration", objYReports.averageViewDuration).Set("estimatedMinutesWatched", objYReports.estimatedMinutesWatched).Set("annotationClickThroughRate", objYReports.annotationClickThroughRate).Set("annotationCloseRate", objYReports.annotationCloseRate);
                                                                mongoRepotsRepo.Update<YoutubeReports>(update, filter);
                                                            }
                                                            catch { }
                                                        }

                                                    }
                                                    catch { }

                                                }
                                            }
                                            else
                                            {
                                                datesJdata.Add("Null");
                                            }

                                            for (var i = 1; i <= 4; i++)
                                            {
                                                var _YReports = new YoutubeReports();
                                                var dateTimeTemp = DateTime.UtcNow.AddDays(-i);

                                                var now_dd = "0" + Convert.ToString(dateTimeTemp.Day);
                                                now_dd = now_dd.Substring(now_dd.Length - 2);
                                                var now_mm = "0" + Convert.ToString(dateTimeTemp.Month);
                                                now_mm = now_mm.Substring(now_mm.Length - 2);
                                                var now_yyyy = Convert.ToString(dateTimeTemp.Year);
                                                var Ynow_Date = now_yyyy + "-" + now_mm + "-" + now_dd;

                                                if (!(datesJdata.Contains(Ynow_Date)))
                                                {
                                                    _YReports.Id = ObjectId.GenerateNewId();
                                                    _YReports.date = Ynow_Date;
                                                    _YReports.channelId = youtubeChannelItem.YtubeChannelId;
                                                    _YReports.SubscribersGained = 0;
                                                    _YReports.views = 0;
                                                    _YReports.likes = 0;
                                                    _YReports.comments = 0;
                                                    _YReports.dislikes = 0;
                                                    _YReports.subscribersLost = 0;
                                                    _YReports.averageViewDuration = 0;
                                                    _YReports.estimatedMinutesWatched = 0;
                                                    _YReports.annotationClickThroughRate = 0;
                                                    _YReports.annotationCloseRate = 0;
                                                    _YReports.uniqueIdentifier = youtubeChannelItem.YtubeChannelId + "_" + Ynow_Date;
                                                    _YReports.datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(Ynow_Date)));

                                                    var mongoRepotsRepo = new MongoRepository("YoutubeReportsData");
                                                    mongoRepotsRepo.Add(_YReports);
                                                }
                                            }

                                            youtubeChannelItem.LastReport_Update = DateTime.UtcNow;
                                            databaseRepository.Update(youtubeChannelItem);
                                        }
                                        catch (Exception)
                                        {
                                            Thread.Sleep(600000);
                                        }
                                    }
                                }
                            }

                        }
                        catch (Exception ex)
                        {
                            Thread.Sleep(600000);
                        }


                        var oldcount = count;
                        count++;
                        var newcount = count;
                        var totalcount = lstYtChannels.Count();
                        var percentagenew = (newcount * 100) / totalcount;
                        var percentageold = (oldcount * 100) / totalcount;
                        if (percentagenew != percentageold)
                        {
                            Console.WriteLine("---------------- {0}% Completed ----------------", percentagenew);
                        }
                    }
                    Thread.Sleep(600000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }

        public long UnixTimeNows(DateTime x)
        {
            var timeSpan = (x - new DateTime(1970, 1, 1, 0, 0, 0));
            return (long)timeSpan.TotalSeconds;
        }


    }
}
