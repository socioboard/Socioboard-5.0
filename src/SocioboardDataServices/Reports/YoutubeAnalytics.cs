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

                    Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();

                    string apiKey = AppSettings.googleApiKey;
                    oAuthTokenYoutube ObjoAuthTokenYtubes = new oAuthTokenYoutube(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    oAuthToken objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    YAnalytics ObjYAnalytics = new YAnalytics(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);

                    List<Domain.Socioboard.Models.YoutubeChannel> lstYtChannels = dbr.Find<Domain.Socioboard.Models.YoutubeChannel>(t => t.IsActive).ToList();
                    long count = 0;
                    Console.WriteLine("---------------- Youtube Analytics Dataservices Started ----------------");
                    foreach (var item in lstYtChannels)
                    {
                        #region count for mongo data
                        MongoRepository mongoreposs = new MongoRepository("YoutubeReportsData");
                        var result = mongoreposs.Find<Domain.Socioboard.Models.Mongo.YoutubeReports>(t => t.channelId.Equals(item.YtubeChannelId));
                        var task = Task.Run(async () =>
                        {
                            return await result;
                        });
                        IList<Domain.Socioboard.Models.Mongo.YoutubeReports> lstYanalytics = task.Result;
                        int count90AnalyticsUpdated = lstYanalytics.Count();
                        #endregion

                        try
                        {
                            if (!item.Days90Update || count90AnalyticsUpdated < 90)
                            {
                                if (item.IsActive)
                                {
                                    try
                                    {
                                        ////////code of reports here///////////////////////

                                        DateTime to_Date = DateTime.UtcNow;
                                        string to_dd = "0" + Convert.ToString(to_Date.Day);
                                        to_dd = to_dd.Substring(to_dd.Length - 2);
                                        string to_mm = "0" + Convert.ToString(to_Date.Month);
                                        to_mm = to_mm.Substring(to_mm.Length - 2);
                                        string to_yyyy = Convert.ToString(to_Date.Year);
                                        DateTime from_Date = DateTime.UtcNow.AddDays(-90);
                                        string from_dd = "0" + Convert.ToString(from_Date.Day);
                                        from_dd = from_dd.Substring(from_dd.Length - 2);
                                        string from_mm = "0" + Convert.ToString(from_Date.Month);
                                        from_mm = from_mm.Substring(from_mm.Length - 2);
                                        string from_yyyy = Convert.ToString(from_Date.Year);

                                        string YaFrom_Date = from_yyyy + "-" + from_mm + "-" + from_dd;
                                        string YaTo_Date = to_yyyy + "-" + to_mm + "-" + to_dd;


                                        MongoRepository mongorepo = new MongoRepository("YoutubeReportsData");


                                        string AnalyticData = ObjYAnalytics.Get_YAnalytics_ChannelId(item.YtubeChannelId, item.RefreshToken, YaFrom_Date, YaTo_Date);
                                        JObject JAnalyticData = JObject.Parse(AnalyticData);

                                        JArray dataArray = (JArray)JAnalyticData["rows"];

                                        List<string> datesJdata = new List<string>();
                                        if (dataArray != null)
                                        {
                                            foreach (var rows in dataArray)
                                            {
                                                datesJdata.Add(rows[0].ToString());
                                            }

                                            foreach (var items in dataArray)
                                            {
                                                YoutubeReports _YReports = new YoutubeReports();

                                                string date = items[0].ToString();
                                                string channelIdd = items[1].ToString();
                                                int SubscribersGained = Convert.ToInt32(items[2]);
                                                int views = Convert.ToInt32(items[3]);
                                                int likes = Convert.ToInt32(items[4]);
                                                int comments = Convert.ToInt32(items[5]);
                                                int shares = Convert.ToInt32(items[6]);
                                                int dislikes = Convert.ToInt32(items[7]);
                                                int subscribersLost = Convert.ToInt32(items[8]);
                                                double averageViewDuration = Convert.ToInt64(items[9]);
                                                double estimatedMinutesWatched = Convert.ToInt64(items[10]);
                                                double annotationClickThroughRate = Convert.ToInt64(items[11]);
                                                double annotationCloseRate = Convert.ToInt64(items[12]);
                                                string uniqueIdentifier = item.YtubeChannelId + "_" + date;
                                                double datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(date)));

                                                _YReports.Id = ObjectId.GenerateNewId();
                                                _YReports.date = date;
                                                _YReports.channelId = channelIdd;
                                                _YReports.SubscribersGained = SubscribersGained;
                                                _YReports.views = views;
                                                _YReports.likes = likes;
                                                _YReports.comments = comments;
                                                _YReports.dislikes = dislikes;
                                                _YReports.subscribersLost = subscribersLost;
                                                _YReports.averageViewDuration = averageViewDuration;
                                                _YReports.estimatedMinutesWatched = estimatedMinutesWatched;
                                                _YReports.annotationClickThroughRate = annotationClickThroughRate;
                                                _YReports.annotationCloseRate = annotationCloseRate;
                                                _YReports.uniqueIdentifier = uniqueIdentifier;
                                                _YReports.datetime_unix = datetime_unix;

                                                mongorepo.Add(_YReports);
                                            }
                                        }
                                        else
                                        {
                                            datesJdata.Add("Null");
                                        }

                                        for (int i = 1; i <= 90; i++)
                                        {
                                            YoutubeReports _YReports = new YoutubeReports();
                                            DateTime dateTimeTemp = DateTime.UtcNow.AddDays(-i);

                                            string now_dd = "0" + Convert.ToString(dateTimeTemp.Day);
                                            now_dd = now_dd.Substring(now_dd.Length - 2);
                                            string now_mm = "0" + Convert.ToString(dateTimeTemp.Month);
                                            now_mm = now_mm.Substring(now_mm.Length - 2);
                                            string now_yyyy = Convert.ToString(dateTimeTemp.Year);
                                            string Ynow_Date = now_yyyy + "-" + now_mm + "-" + now_dd;

                                            if (!(datesJdata.Contains(Ynow_Date)))
                                            {
                                                _YReports.Id = ObjectId.GenerateNewId();
                                                _YReports.date = Ynow_Date;
                                                _YReports.channelId = item.YtubeChannelId;
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
                                                _YReports.uniqueIdentifier = item.YtubeChannelId + "_" + Ynow_Date;
                                                _YReports.datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(Ynow_Date)));

                                                mongorepo.Add(_YReports);
                                            }
                                        }

                                        item.Days90Update = true;
                                        item.LastReport_Update = DateTime.UtcNow;
                                        dbr.Update<Domain.Socioboard.Models.YoutubeChannel>(item);
                                    }
                                    catch (Exception)
                                    {
                                        Thread.Sleep(600000);
                                    }
                                }
                            }
                            else
                            {
                                if (item.LastReport_Update.AddHours(24) < DateTime.UtcNow)
                                {
                                    //dailyReport Code here//

                                    if (item.IsActive)
                                    {
                                        try
                                        {
                                            //code of reports here//
                                            DateTime to_Date = DateTime.UtcNow;
                                            string to_dd = "0" + Convert.ToString(to_Date.Day);
                                            to_dd = to_dd.Substring(to_dd.Length - 2);
                                            string to_mm = "0" + Convert.ToString(to_Date.Month);
                                            to_mm = to_mm.Substring(to_mm.Length - 2);
                                            string to_yyyy = Convert.ToString(to_Date.Year);
                                            DateTime from_Date = DateTime.UtcNow.AddDays(-4);
                                            string from_dd = "0" + Convert.ToString(from_Date.Day);
                                            from_dd = from_dd.Substring(from_dd.Length - 2);
                                            string from_mm = "0" + Convert.ToString(from_Date.Month);
                                            from_mm = from_mm.Substring(from_mm.Length - 2);
                                            string from_yyyy = Convert.ToString(from_Date.Year);

                                            string YaFrom_Date = from_yyyy + "-" + from_mm + "-" + from_dd;
                                            string YaTo_Date = to_yyyy + "-" + to_mm + "-" + to_dd;



                                            string AnalyticData = ObjYAnalytics.Get_YAnalytics_ChannelId(item.YtubeChannelId, item.RefreshToken, YaFrom_Date, YaTo_Date);
                                            JObject JAnalyticData = JObject.Parse(AnalyticData);

                                            JArray dataArray = (JArray)JAnalyticData["rows"];

                                            List<string> datesJdata = new List<string>();
                                            if (dataArray != null)
                                            {
                                                foreach (var rows in dataArray)
                                                {
                                                    datesJdata.Add(rows[0].ToString());
                                                }

                                                foreach (var items in dataArray)
                                                {
                                                    YoutubeReports _YReports = new YoutubeReports();

                                                    string date = items[0].ToString();
                                                    string channelIdd = items[1].ToString();
                                                    int SubscribersGained = Convert.ToInt32(items[2]);
                                                    int views = Convert.ToInt32(items[3]);
                                                    int likes = Convert.ToInt32(items[4]);
                                                    int comments = Convert.ToInt32(items[5]);
                                                    int shares = Convert.ToInt32(items[6]);
                                                    int dislikes = Convert.ToInt32(items[7]);
                                                    int subscribersLost = Convert.ToInt32(items[8]);
                                                    double averageViewDuration = Convert.ToInt64(items[9]);
                                                    double estimatedMinutesWatched = Convert.ToInt64(items[10]);
                                                    double annotationClickThroughRate = Convert.ToInt64(items[11]);
                                                    double annotationCloseRate = Convert.ToInt64(items[12]);
                                                    string uniqueIdentifier = item.YtubeChannelId + "_" + date;
                                                    double datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(date)));

                                                    _YReports.Id = ObjectId.GenerateNewId();
                                                    _YReports.date = date;
                                                    _YReports.channelId = channelIdd;
                                                    _YReports.SubscribersGained = SubscribersGained;
                                                    _YReports.views = views;
                                                    _YReports.likes = likes;
                                                    _YReports.comments = comments;
                                                    _YReports.dislikes = dislikes;
                                                    _YReports.subscribersLost = subscribersLost;
                                                    _YReports.averageViewDuration = averageViewDuration;
                                                    _YReports.estimatedMinutesWatched = estimatedMinutesWatched;
                                                    _YReports.annotationClickThroughRate = annotationClickThroughRate;
                                                    _YReports.annotationCloseRate = annotationCloseRate;
                                                    _YReports.uniqueIdentifier = uniqueIdentifier;
                                                    _YReports.datetime_unix = datetime_unix;


                                                    try
                                                    {
                                                        MongoRepository mongoRepotsRepo = new MongoRepository("YoutubeReportsData");
                                                        var ret = mongoRepotsRepo.Find<YoutubeReports>(t => t.uniqueIdentifier.Equals(_YReports.uniqueIdentifier));
                                                        var task_Reports = Task.Run(async () =>
                                                        {
                                                            return await ret;
                                                        });
                                                        int count_Reports = task_Reports.Result.Count;
                                                        if (count_Reports < 1)
                                                        {
                                                            try
                                                            {
                                                                mongoRepotsRepo.Add(_YReports);
                                                            }
                                                            catch { }
                                                        }
                                                        else
                                                        {
                                                            try
                                                            {
                                                                FilterDefinition<BsonDocument> filter = new BsonDocument("uniqueIdentifier", _YReports.uniqueIdentifier);
                                                                var update = Builders<BsonDocument>.Update.Set("SubscribersGained", _YReports.SubscribersGained).Set("views", _YReports.views).Set("likes", _YReports.likes).Set("comments", _YReports.comments).Set("dislikes", _YReports.dislikes).Set("subscribersLost", _YReports.subscribersLost).Set("averageViewDuration", _YReports.averageViewDuration).Set("estimatedMinutesWatched", _YReports.estimatedMinutesWatched).Set("annotationClickThroughRate", _YReports.annotationClickThroughRate).Set("annotationCloseRate", _YReports.annotationCloseRate);
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

                                            for (int i = 1; i <= 4; i++)
                                            {
                                                YoutubeReports _YReports = new YoutubeReports();
                                                DateTime dateTimeTemp = DateTime.UtcNow.AddDays(-i);

                                                string now_dd = "0" + Convert.ToString(dateTimeTemp.Day);
                                                now_dd = now_dd.Substring(now_dd.Length - 2);
                                                string now_mm = "0" + Convert.ToString(dateTimeTemp.Month);
                                                now_mm = now_mm.Substring(now_mm.Length - 2);
                                                string now_yyyy = Convert.ToString(dateTimeTemp.Year);
                                                string Ynow_Date = now_yyyy + "-" + now_mm + "-" + now_dd;

                                                if (!(datesJdata.Contains(Ynow_Date)))
                                                {
                                                    _YReports.Id = ObjectId.GenerateNewId();
                                                    _YReports.date = Ynow_Date;
                                                    _YReports.channelId = item.YtubeChannelId;
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
                                                    _YReports.uniqueIdentifier = item.YtubeChannelId + "_" + Ynow_Date;
                                                    _YReports.datetime_unix = Convert.ToDouble(UnixTimeNows(Convert.ToDateTime(Ynow_Date)));

                                                    MongoRepository mongoRepotsRepo = new MongoRepository("YoutubeReportsData");
                                                    mongoRepotsRepo.Add(_YReports);
                                                }
                                            }

                                            item.LastReport_Update = DateTime.UtcNow;
                                            dbr.Update<Domain.Socioboard.Models.YoutubeChannel>(item);
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


                        long oldcount = count;
                        count++;
                        long newcount = count;
                        long totalcount = lstYtChannels.Count();
                        long percentagenew = (newcount * 100) / totalcount;
                        long percentageold = (oldcount * 100) / totalcount;
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
