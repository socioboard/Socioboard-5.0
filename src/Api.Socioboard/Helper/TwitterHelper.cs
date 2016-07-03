using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Socioboard.Models;
using Api.Socioboard.Model;
using Microsoft.Extensions.Logging;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using Socioboard.Twitter.App.Core;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.SearchMethods;
using System.IO;
using System.Net;
using System.IO.Compression;

namespace Api.Socioboard.Helper
{
    public static class TwitterHelper
    {

        public static string PostTwitterMessage(AppSettings _AppSettings, Cache _redisCache, string message, string profileid, long userid, string picurl, bool isScheduled, DatabaseRepository dbr, ILogger _logger, string sscheduledmsgguid = "")
        {
            bool rt = false;
            string ret = "";
            string str = "";
            int Twtsc = 0;
            Domain.Socioboard.Models.TwitterAccount objTwitterAccount = Api.Socioboard.Repositories.TwitterRepository.getTwitterAccount(profileid, _redisCache, dbr);
            oAuthTwitter OAuthTwt = new oAuthTwitter(_AppSettings.twitterConsumerKey, _AppSettings.twitterConsumerScreatKey, _AppSettings.twitterRedirectionUrl);
            OAuthTwt.AccessToken = objTwitterAccount.oAuthToken;
            OAuthTwt.AccessTokenSecret = objTwitterAccount.oAuthSecret;
            OAuthTwt.TwitterScreenName = objTwitterAccount.twitterScreenName;
            OAuthTwt.TwitterUserId = objTwitterAccount.twitterUserId;

            Tweet twt = new Tweet();
            if (!string.IsNullOrEmpty(picurl))
            {
                try
                {
                    PhotoUpload ph = new PhotoUpload();
                    string res = string.Empty;
                    rt = ph.NewTweet(picurl, message, OAuthTwt, ref res);
                }
                catch (Exception ex)
                {
                    _logger.LogError("PostTwitterMessageWithImage" + ex.StackTrace);
                    _logger.LogError("PostTwitterMessageWithImage" + ex.Message);
                }
            }
            else
            {
                try
                {
                    JArray post = twt.Post_Statuses_Update(OAuthTwt, message);
                    ret = post[0]["id_str"].ToString();
                }
                catch (Exception ex)
                {
                    _logger.LogError("PostTwitterMessage" + ex.StackTrace);
                    _logger.LogError("PostTwitterMessage" + ex.Message);
                }
            }

            if (!string.IsNullOrEmpty(ret) || rt == true)
            {

                ScheduledMessage scheduledMessage = new ScheduledMessage();
                scheduledMessage.createTime = DateTime.UtcNow;
                scheduledMessage.picUrl = picurl;
                scheduledMessage.profileId = profileid;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.Twitter;
                scheduledMessage.scheduleTime = DateTime.UtcNow;
                scheduledMessage.shareMessage = message;
                scheduledMessage.userId = userid;
                scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                scheduledMessage.url = ret;
                dbr.Add<ScheduledMessage>(scheduledMessage);


            }
            else
            {
                str = "Message not posted";
            }

            return str;
        }

        public static List<Domain.Socioboard.ViewModels.DiscoveryViewModal> DiscoverySearchTwitter(oAuthTwitter oauth, string keyword, long userId, long groupId)
        {

            List<Domain.Socioboard.ViewModels.DiscoveryViewModal> lstDiscoverySearch = new List<Domain.Socioboard.ViewModels.DiscoveryViewModal>();
            Search search = new Search();
            JArray twitterSearchResult = search.Get_Search_Tweets(oauth, keyword);
            foreach (var item in twitterSearchResult)
            {
                var results = item["statuses"];
                foreach (var chile in results)
                {


                    try
                    {
                        Domain.Socioboard.ViewModels.DiscoveryViewModal objDiscoverySearch = new Domain.Socioboard.ViewModels.DiscoveryViewModal();
                        objDiscoverySearch.CreatedTime = Utility.ParseTwitterTime(chile["created_at"].ToString().TrimStart('"').TrimEnd('"')); ;
                        objDiscoverySearch.EntryDate = DateTime.Now;
                        objDiscoverySearch.FromId = chile["user"]["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        objDiscoverySearch.FromName = chile["user"]["screen_name"].ToString().TrimStart('"').TrimEnd('"');
                        objDiscoverySearch.ProfileImageUrl = chile["user"]["profile_image_url"].ToString().TrimStart('"').TrimEnd('"');
                        objDiscoverySearch.SearchKeyword = keyword;
                        objDiscoverySearch.Network = "twitter";
                        objDiscoverySearch.Message = chile["text"].ToString().TrimStart('"').TrimEnd('"');
                        objDiscoverySearch.MessageId = chile["id_str"].ToString().TrimStart('"').TrimEnd('"');
                        objDiscoverySearch.UserId = userId;
                        lstDiscoverySearch.Add(objDiscoverySearch);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.StackTrace);
                    }
                }
            }
            return lstDiscoverySearch;
        }

        public static List<DiscoverySmart> TwitterTweetSearchWithGeoLocation(string q, string geoCode)
        {
            if (q.Contains("#"))
            {
                q = Uri.EscapeUriString(q);
            }
            try
            {
                string url = string.Empty;
                if (!string.IsNullOrEmpty(geoCode))
                {
                    url = q.Trim() + "&geocode=" + geoCode + "&count=20&result_type=recent";
                }
                else
                {
                    url = q.Trim() + "&count=20&result_type=recent";
                }
                string ret = string.Empty;
                JArray output = new JArray();
                SortedDictionary<string, string> requestParameters = new SortedDictionary<string, string>();

                var oauth_url = "https://api.twitter.com/1.1/search/tweets.json?q=" + url;
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
               Helper.DiscoverySmart _Discovery;
               List<Helper.DiscoverySmart> lstDiscovery = new List<Helper.DiscoverySmart>();
                try
                {
                    foreach (var item in output)
                    {
                        try
                        {
                            _Discovery = new Helper.DiscoverySmart();

                            _Discovery.text = item["text"].ToString();
                            _Discovery.created_at = Utility.ParseTwitterTime(item["created_at"].ToString());
                            _Discovery.tweet_id = item["id_str"].ToString();
                            _Discovery.twitter_id = item["user"]["id_str"].ToString();
                            _Discovery.profile_image_url = item["user"]["profile_image_url"].ToString();
                            _Discovery.screan_name = item["user"]["screen_name"].ToString();
                            _Discovery.name = item["user"]["name"].ToString();
                            _Discovery.description = item["user"]["description"].ToString();
                            _Discovery.followers_count = item["user"]["followers_count"].ToString();
                            _Discovery.friends_count = item["user"]["friends_count"].ToString();

                            lstDiscovery.Add(_Discovery);
                        }
                        catch { }
                    }
                }
                catch { }
                return lstDiscovery;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
