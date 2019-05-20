using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod
{
    public class Analytics
    {
        public Analytics(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;

        public string getAnalyticsData(string strProfileId, string metricDimension, string strdtFrom, string strdtTo, string strToken)
        {
            string strData = string.Empty;
            oAuthToken objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);
            try
            {
                string strDataUrl = Globals.strGetGaAnalytics + strProfileId + "&metrics=" + metricDimension + "&start-date=" + strdtFrom + "&end-date=" + strdtTo + "&access_token=" + strToken;
                strData = objToken.WebRequest(oAuthToken.Method.GET, strDataUrl, "");
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return strData;

        }

        public class GoogleAnalyticsRealtimeModel
        {
            public string DeviceName { get; set; }

            public string Path { get; set; }

            public string Country { get; set; }

            public string TrafficType { get; set; }

            public string Count { get; set; }
        }


        public class GoogleAnalyticsActiveModel
        {
            public string ActiveUserCount { get; set; }

            public List<GoogleAnalyticsRealtimeModel> GoogleAnalyticsRealtimeModels { get; set; } = new List<GoogleAnalyticsRealtimeModel>();
        }

        public GoogleAnalyticsActiveModel GetRealTimeUsers(string strProfileId, string strToken)
        {
            var objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);

            try
            {
                var strDataUrl = Globals.strGetGaRealAnalytics + strProfileId + "&metrics=rt:activeUsers&dimensions=rt:deviceCategory,rt:pagePath,rt:country,rt:trafficType&access_token=" + strToken;
                var strData = objToken.WebRequest(oAuthToken.Method.GET, strDataUrl, "");
                var jData = JObject.Parse(strData);
                var activeUser = jData["totalsForAllResults"]["rt:activeUsers"].ToString();

                var intActiveUser = int.Parse(activeUser);

                var googleAnalyticsActiveModel = new GoogleAnalyticsActiveModel()
                {
                    ActiveUserCount = activeUser
                };


                if (intActiveUser > 0)
                {
                    var rows = (JArray)jData["rows"];


                    foreach (var row in rows)
                    {
                        var googleAnalyticsRealtimeModel = new GoogleAnalyticsRealtimeModel()
                        {
                            DeviceName = row[0].Value<string>(),
                            Path = row[1].ToString(),
                            Country = row[2].ToString(),
                            TrafficType = row[3].ToString(),
                            Count = row[4].ToString(),
                        };
                        googleAnalyticsActiveModel.GoogleAnalyticsRealtimeModels.Add(googleAnalyticsRealtimeModel);
                    }
                }

                return googleAnalyticsActiveModel;
            }
            catch (Exception ex)
            {
                var googleAnalyticsActiveModel = new GoogleAnalyticsActiveModel()
                {
                    ActiveUserCount = "0",
                    GoogleAnalyticsRealtimeModels = new List<GoogleAnalyticsRealtimeModel>()
                };
                return googleAnalyticsActiveModel;
            }

        }

        public string GetRealTimeUser(string strProfileId, string strToken)
        {
            var objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);

            try
            {
                var strDataUrl = Globals.strGetGaRealAnalytics + strProfileId + "&metrics=rt:activeUsers&dimensions=rt:deviceCategory,rt:pagePath,rt:country,rt:trafficType&access_token=" + strToken;
                var strData = objToken.WebRequest(oAuthToken.Method.GET, strDataUrl, "");
                var jData = JObject.Parse(strData);
                var activeUser = jData["totalsForAllResults"]["rt:activeUsers"].ToString();

                var intActiveUser = int.Parse(activeUser);

                var googleAnalyticsActiveModel = new GoogleAnalyticsActiveModel()
                {
                    ActiveUserCount = activeUser
                };


                if (intActiveUser > 0)
                {
                    var rows = (JArray)jData["rows"];


                    foreach (var row in rows)
                    {
                        var device = row[0].Value<string>();
                        var path = row[1].ToString();
                        var country = row[2].ToString();
                        var trafficType = row[3].ToString();
                        var count = row[4].ToString();

                        var googleAnalyticsRealtimeModel = new GoogleAnalyticsRealtimeModel()
                        {
                            DeviceName = row[0].Value<string>(),
                            Path = row[1].ToString(),
                            Country = row[2].ToString(),
                            TrafficType = row[3].ToString(),
                            Count = row[4].ToString(),
                        };

                        googleAnalyticsActiveModel.GoogleAnalyticsRealtimeModels.Add(googleAnalyticsRealtimeModel);


                    }
                }

                return activeUser;
            }
            catch (Exception ex)
            {
                return "0";
            }

        }

        public class GoogleAnalyticsDetails
        {
            public string PageView { get; set; }

            public string Sessions { get; set; }
        }

        public GoogleAnalyticsDetails GetSessionViewOfUser(string strProfileId, string strToken, int days)
        {
            var objToken = new oAuthToken(_clientId, _clientSecret, _redirectUrl);

            var dayStart = new DateTime(DateTime.UtcNow.AddDays(-1 * days).Year, DateTime.UtcNow.AddDays(-1 * days).Month, DateTime.UtcNow.AddDays(-1 * days).Day, 0, 0, 0, DateTimeKind.Utc);
            var dayEnd = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 23, 59, 59, DateTimeKind.Utc);

            var strStart = dayStart.ToString("yyyy-MM-dd");
            var strEnd = dayEnd.ToString("yyyy-MM-dd");

            try
            {
                var strDataUrl = Globals.gaSessionViews + strProfileId + "&metrics=ga:sessions,ga:pageviews&start-date=" + strStart + "&end-date=" + strEnd + "&access_token=" + strToken;
                var strData = objToken.WebRequest(oAuthToken.Method.GET, strDataUrl, "");
                var jData = JObject.Parse(strData);
                var sessions = jData["totalsForAllResults"]["ga:sessions"].ToString();

                var pageviews = jData["totalsForAllResults"]["ga:pageviews"].ToString();

                var googleAnalyticsDetails = new GoogleAnalyticsDetails
                {
                    PageView = pageviews,
                    Sessions = sessions
                };

                return googleAnalyticsDetails;
            }
            catch (Exception ex)
            {
                var googleAnalyticsDetails = new GoogleAnalyticsDetails
                {
                    PageView = "0",
                    Sessions = "0"
                };

                return googleAnalyticsDetails;
            }

        }
    }
}
