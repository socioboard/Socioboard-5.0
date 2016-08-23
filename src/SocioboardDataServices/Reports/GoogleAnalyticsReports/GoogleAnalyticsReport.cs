using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Reports.GoogleAnalyticsReports
{
    public class GoogleAnalyticsReport
    {
        public static void CreateGoogleAnalyticsReport()
        {
            Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
            while (true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.GoogleAnalyticsAccount> lstFbAcc = dbr.FindAll<Domain.Socioboard.Models.GoogleAnalyticsAccount>().ToList();
                foreach (var item in lstFbAcc)
                {
                    if (item.LastUpdate.AddHours(24)<=DateTime.UtcNow)
                    {
                        if (item.IsActive)
                        {
                            GetTwitterWebMentions(item.WebsiteUrl);
                            DailyMotionPost(item.WebsiteUrl);
                            GetYoutubeSearchData(item.WebsiteUrl);
                            GoogleAnalyticsreportData(item.GaProfileId, item.AccessToken, item.WebsiteUrl, item.Is90DayDataUpdated);
                            item.LastUpdate = DateTime.UtcNow;
                            item.Is90DayDataUpdated = true;
                            dbr.Update<Domain.Socioboard.Models.GoogleAnalyticsAccount>(item);  
                        }
                    }
                }
                Thread.Sleep(120000);
            }
        }
        public static void GoogleAnalyticsreportData(string ProfileId, string AccessToken, string HostName, bool is90daysupdated)
        {
            Helper.Cache cache = new Helper.Cache(Helper.AppSettings.RedisConfiguration);
            MongoRepository TwtsearchRepo = new MongoRepository("TwitterUrlMentions");
            MongoRepository ArticlesAndBlogsRepo = new MongoRepository("ArticlesAndBlogs");
            MongoRepository GoogleAnalyticsReportRepo = new Model.MongoRepository("GoogleAnalyticsReport");
            string finalToken = string.Empty;
            int day = 1;
            if (!is90daysupdated)
            {
                day = 90;
            }
            oAuthTokenGa objToken = new oAuthTokenGa("AIzaSyDRwxJd7da5BtZmN0M98bSv-D8q9mYMMCI", "e-Y3z41JyVBIJgBOB_jZDA83", "http://localhost:9821/GoogleManager/Google");
            string finaltoken = objToken.GetAccessToken(AccessToken);
            try
            {
                JObject objArray = JObject.Parse(finaltoken);
                finalToken = objArray["access_token"].ToString();
            }
            catch (Exception ex)
            {
                finalToken = AccessToken;
                Console.WriteLine(ex.StackTrace);
            }
            Analytics _Analytics = new Analytics("AIzaSyDRwxJd7da5BtZmN0M98bSv-D8q9mYMMCI", "e-Y3z41JyVBIJgBOB_jZDA83", "http://localhost:9821/GoogleManager/Google");
            DateTime startDate = DateTime.UtcNow.Date.AddDays(-day);
            while (startDate.Date < DateTime.UtcNow.Date)
            {
                string visits = string.Empty;
                string pageviews = string.Empty;
                try
                {
                    string analytics = _Analytics.getAnalyticsData(ProfileId, "ga:visits,ga:pageviews", startDate.ToString("yyyy-MM-dd"), startDate.ToString("yyyy-MM-dd"), finalToken);
                    JObject JData = JObject.Parse(analytics);
                    visits = JData["totalsForAllResults"]["ga:visits"].ToString();
                    pageviews = JData["totalsForAllResults"]["ga:pageviews"].ToString();

                }
                catch (Exception ex)
                {
                    visits = "0";
                    pageviews = "0";
                }
                double startUnixTime = SBHelper.ConvertToUnixTimestamp(startDate.Date);
                double endUnixTime = SBHelper.ConvertToUnixTimestamp(startDate.AddDays(1).Date);
                var ret = TwtsearchRepo.Find<Domain.Socioboard.Models.Mongo.TwitterUrlMentions>(t => t.HostName.Equals(HostName));
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                IList<Domain.Socioboard.Models.Mongo.TwitterUrlMentions> lstTwitterUrlMentions = task.Result.ToList();
                int twtCount = lstTwitterUrlMentions.Count(t => t.Feeddate > startUnixTime && t.Feeddate <= endUnixTime);
                var ret1 = ArticlesAndBlogsRepo.Find<Domain.Socioboard.Models.Mongo.ArticlesAndBlogs>(t => t.HostName.Equals(HostName));
                var task1 = Task.Run(async () =>
                {
                    return await ret1;
                });
                IList<Domain.Socioboard.Models.Mongo.ArticlesAndBlogs> lstArticlesAndBlogs = task1.Result.ToList();
                int artucleCount = lstArticlesAndBlogs.Count(t => t.Created_Time > startUnixTime && t.Created_Time <= endUnixTime);

                Domain.Socioboard.Models.Mongo.GoogleAnalyticsReport _GoogleAnalyticsReport = new Domain.Socioboard.Models.Mongo.GoogleAnalyticsReport();
                _GoogleAnalyticsReport.Id = ObjectId.GenerateNewId();
                _GoogleAnalyticsReport.strId = ObjectId.GenerateNewId().ToString();
                _GoogleAnalyticsReport.GaProfileId = ProfileId;
                _GoogleAnalyticsReport.Article_Blogs = artucleCount.ToString();
                _GoogleAnalyticsReport.TwitterMention = twtCount.ToString();
                _GoogleAnalyticsReport.Views = pageviews;
                _GoogleAnalyticsReport.Visits = visits;
                _GoogleAnalyticsReport.date = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                GoogleAnalyticsReportRepo.Add<Domain.Socioboard.Models.Mongo.GoogleAnalyticsReport>(_GoogleAnalyticsReport);
                startDate = startDate.AddDays(1);
            }
        }

        public static void GetTwitterWebMentions(string HostName)
        {
            MongoRepository TwtsearchRepo = new MongoRepository("TwitterUrlMentions");
            try
            {
                HostName = HostName.Replace("www.", "");
                JArray output = new JArray();
                SortedDictionary<string, string> requestParameters = new SortedDictionary<string, string>();
                try
                {
                    var oauth_url = " https://api.twitter.com/1.1/search/tweets.json?q=" + HostName.Trim() + "&result_type=recent&count=30";
                    var headerFormat = "Bearer {0}";
                    var authHeader = string.Format(headerFormat, "AAAAAAAAAAAAAAAAAAAAAOZyVwAAAAAAgI0VcykgJ600le2YdR4uhKgjaMs%3D0MYOt4LpwCTAIi46HYWa85ZcJ81qi0D9sh8avr1Zwf7BDzgdHT");

                    var postBody = requestParameters.ToWebString();
                    ServicePointManager.Expect100Continue = false;

                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(oauth_url + "?"
                           + requestParameters.ToWebString());

                    request.Headers.Add("Authorization", authHeader);
                    request.Method = "GET";
                    request.Headers.Add("Accept-Encoding", "gzip");
                    HttpWebResponse response = request.GetResponse() as HttpWebResponse;
                    Stream responseStream = new GZipStream(response.GetResponseStream(), CompressionMode.Decompress);
                    using (var reader = new StreamReader(responseStream))
                    {
                        var objText = reader.ReadToEnd();
                        output = JArray.Parse(JObject.Parse(objText)["statuses"].ToString());
                    }
                }
                catch (Exception ex)
                {
                }
                Domain.Socioboard.Models.Mongo.TwitterUrlMentions _TwitterUrlMentions;
                try
                {
                    foreach (var chile in output)
                    {
                        try
                        {
                            _TwitterUrlMentions = new Domain.Socioboard.Models.Mongo.TwitterUrlMentions();
                            _TwitterUrlMentions.Id = ObjectId.GenerateNewId();
                            _TwitterUrlMentions.Feed = chile["text"].ToString();
                            _TwitterUrlMentions.Feeddate = SBHelper.ConvertToUnixTimestamp(ParseTwitterTime(chile["created_at"].ToString()));
                            _TwitterUrlMentions.FeedId = chile["id_str"].ToString();
                            _TwitterUrlMentions.FromId = chile["user"]["id_str"].ToString();
                            _TwitterUrlMentions.FromImageUrl = chile["user"]["profile_image_url"].ToString();
                            _TwitterUrlMentions.FromName = chile["user"]["screen_name"].ToString();
                            _TwitterUrlMentions.HostName = HostName;

                            var ret = TwtsearchRepo.Find<Domain.Socioboard.Models.Mongo.TwitterUrlMentions>(t => t.FeedId.Equals(_TwitterUrlMentions.FeedId) && t.HostName.Equals(_TwitterUrlMentions.HostName));
                            var task = Task.Run(async () =>
                            {
                                return await ret;
                            });
                            int count = task.Result.Count;

                            if (count < 1)
                            {
                                TwtsearchRepo.Add(_TwitterUrlMentions);
                            }
                        }
                        catch { }
                    }
                }
                catch { }
            }
            catch { }
        }

        public static void DailyMotionPost(string Url)
        {
            MongoRepository ArticlesAndBlogsRepo = new MongoRepository("ArticlesAndBlogs");
            try
            {
                string _dailymotionpostRestUrl = "https://api.dailymotion.com/videos/?search=" + Url + "&fields=id,title,created_time,url,description";

                string response = WebRequst(_dailymotionpostRestUrl);

                var jdata = Newtonsoft.Json.Linq.JObject.Parse(response);

                foreach (var item in jdata["list"])
                {
                    Domain.Socioboard.Models.Mongo.ArticlesAndBlogs _ArticlesAndBlogs = new Domain.Socioboard.Models.Mongo.ArticlesAndBlogs();
                    _ArticlesAndBlogs.Id = ObjectId.GenerateNewId();
                    _ArticlesAndBlogs.Type = Domain.Socioboard.Enum.ArticlesAndBlogsTypes.dailymotion;
                    _ArticlesAndBlogs.HostName = Url;

                    try
                    {
                        _ArticlesAndBlogs.VideoId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _ArticlesAndBlogs.VideoId = "";
                    }
                    try
                    {
                        _ArticlesAndBlogs.Title = item["title"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _ArticlesAndBlogs.Title = "";
                    }
                    try
                    {
                        _ArticlesAndBlogs.VideoUrl = item["url"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _ArticlesAndBlogs.VideoUrl = "";
                    }
                    try
                    {
                        _ArticlesAndBlogs.Description = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _ArticlesAndBlogs.Description = "";
                    }
                    try
                    {
                        _ArticlesAndBlogs.Created_Time = double.Parse(item["created_time"].ToString());
                    }
                    catch (Exception ex)
                    {

                        _ArticlesAndBlogs.Created_Time = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                    }
                    _ArticlesAndBlogs.Url = Url;
                    var ret = ArticlesAndBlogsRepo.Find<Domain.Socioboard.Models.Mongo.ArticlesAndBlogs>(t => t.VideoId.Equals(_ArticlesAndBlogs.VideoId) && t.Type.Equals(_ArticlesAndBlogs.Type));
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        ArticlesAndBlogsRepo.Add(_ArticlesAndBlogs);
                    }
                }
            }
            catch (Exception ex)
            {

            }

        }

        public static void GetYoutubeSearchData(string Url)
        {
            MongoRepository ArticlesAndBlogsRepo = new MongoRepository("ArticlesAndBlogs");
            try
            {
                string youtubesearchurl = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&order=relevance&q=" + Url + "&key=AIzaSyDRwxJd7da5BtZmN0M98bSv-D8q9mYMMCI";
                string response = WebRequst(youtubesearchurl);
                var Jdata = Newtonsoft.Json.Linq.JObject.Parse(response);

                foreach (var item in Jdata["items"])
                {

                    Domain.Socioboard.Models.Mongo.ArticlesAndBlogs _ArticlesAndBlogs = new Domain.Socioboard.Models.Mongo.ArticlesAndBlogs();
                    _ArticlesAndBlogs.Id = ObjectId.GenerateNewId();
                    _ArticlesAndBlogs.Type = Domain.Socioboard.Enum.ArticlesAndBlogsTypes.youtube;
                    _ArticlesAndBlogs.HostName = Url;

                    try
                    {
                        _ArticlesAndBlogs.VideoId = item["id"]["videoId"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _ArticlesAndBlogs.VideoId = "";
                    }

                    if (!string.IsNullOrEmpty(_ArticlesAndBlogs.VideoId))
                    {
                        try
                        {
                            _ArticlesAndBlogs.VideoUrl = "https://www.youtube.com/watch?v=" + _ArticlesAndBlogs.VideoId;
                        }
                        catch (Exception ex)
                        {

                            _ArticlesAndBlogs.VideoUrl = "";
                        }
                        _ArticlesAndBlogs.Url = Url;
                        try
                        {
                            _ArticlesAndBlogs.Title = item["snippet"]["title"].ToString();
                        }
                        catch (Exception ex)
                        {

                            _ArticlesAndBlogs.Title = "";
                        }
                        try
                        {
                            _ArticlesAndBlogs.Description = item["snippet"]["description"].ToString();
                        }
                        catch (Exception ex)
                        {

                            _ArticlesAndBlogs.Description = "";
                        }
                        try
                        {
                            _ArticlesAndBlogs.Created_Time = SBHelper.ConvertToUnixTimestamp((DateTime.Parse(item["snippet"]["publishedAt"].ToString())));
                        }
                        catch (Exception ex)
                        {

                            _ArticlesAndBlogs.Created_Time = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        }

                        var ret = ArticlesAndBlogsRepo.Find<Domain.Socioboard.Models.Mongo.ArticlesAndBlogs>(t => t.VideoId.Equals(_ArticlesAndBlogs.VideoId) && t.Type.Equals(_ArticlesAndBlogs.Type));
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            ArticlesAndBlogsRepo.Add(_ArticlesAndBlogs);
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        public static DateTime ParseTwitterTime(string date)
        {
            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
            return DateTime.ParseExact(date, format, CultureInfo.InvariantCulture);
        }

        public static string WebRequst(string Url)
        {

            try
            {
                HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(Url);
                httpRequest.Method = "GET";
                httpRequest.ContentType = "application/json; charset=utf-8";
                HttpWebResponse httResponse = (HttpWebResponse)httpRequest.GetResponse();
                Stream responseStream = httResponse.GetResponseStream();
                StreamReader responseStreamReader = new StreamReader(responseStream, System.Text.Encoding.Default);
                string pageContent = responseStreamReader.ReadToEnd();
                responseStreamReader.Close();
                responseStream.Close();
                httResponse.Close();
                return pageContent;
            }
            catch (Exception ex)
            {
                return "";
            }
        }


    }
}
