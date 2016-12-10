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
using MongoDB.Driver;
using MongoDB.Bson;
using Socioboard.Twitter.Twitter.Core.UserMethods;

namespace Api.Socioboard.Helper
{
    public static class TwitterHelper
    {

        public static string PostTwitterMessage(AppSettings _AppSettings, Cache _redisCache, string message, string profileid, long userid,string url,bool isScheduled, DatabaseRepository dbr, ILogger _logger, string sscheduledmsgguid = "")
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
            if (!string.IsNullOrEmpty(url))
            {
                try
                {
                    PhotoUpload ph = new PhotoUpload();
                    string res = string.Empty;
                    rt = ph.NewTweet(url, message, OAuthTwt, ref res);
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
                scheduledMessage.picUrl = objTwitterAccount.profileImageUrl;
                scheduledMessage.profileId = profileid;
                scheduledMessage.profileType = Domain.Socioboard.Enum.SocialProfileType.Twitter;
                scheduledMessage.scheduleTime = DateTime.UtcNow;
                scheduledMessage.shareMessage = message;
                scheduledMessage.socialprofileName = objTwitterAccount.twitterScreenName;
                scheduledMessage.userId = userid;
                scheduledMessage.status = Domain.Socioboard.Enum.ScheduleStatus.Compleated;
                scheduledMessage.url = url;
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
                        objDiscoverySearch.Message = chile["text"].ToString().TrimStart('"').TrimEnd('"').Replace("&amp", " ");
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


        public static string TwitterComposeMessageRss(string message, string OAuthToken, string OAuthSecret, string profileid, string TwitterScreenName, string rssFeedId, Helper.AppSettings _appSettings)
        {
            string ret = "";
            oAuthTwitter OAuthTwt = new oAuthTwitter();
            OAuthTwt.AccessToken = OAuthToken;
            OAuthTwt.AccessTokenSecret = OAuthSecret;
            OAuthTwt.TwitterScreenName = TwitterScreenName;
            OAuthTwt.TwitterUserId = profileid;
            Tweet twt = new Tweet();
            MongoRepository rssfeedRepo = new MongoRepository("RssFeed", _appSettings);
            try
            {
                JArray post = twt.Post_Statuses_Update(OAuthTwt, message);

                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("strId", rssFeedId);
                var update = Builders<BsonDocument>.Update.Set("Status", true);
                rssfeedRepo.Update<Domain.Socioboard.Models.Mongo.RssFeed>(update, filter);

                return ret = "Messages Posted Successfully";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ret = "Message Could Not Posted";
            }
        }


        public static List<Domain.Socioboard.Models.TwitterRecentFollower> TwitterRecentFollower(long groupId, Model.DatabaseRepository dbr, Helper.AppSettings _appSettings)
        {
            string[] profileids = null;
            List<Domain.Socioboard.Models.TwitterRecentFollower> lstTwitterRecentFollower = new List<Domain.Socioboard.Models.TwitterRecentFollower>();
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            List<Domain.Socioboard.Models.TwitterAccount> lstAccRepo = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => profileids.Contains(t.twitterUserId) && t.isActive).ToList();
            oAuthTwitter oauth = null;
            Users twtUsers = new Users();
            foreach (Domain.Socioboard.Models.TwitterAccount itemTwt in lstAccRepo)
            {
                oauth = new oAuthTwitter();
                oauth.AccessToken = itemTwt.oAuthToken;
                oauth.AccessTokenSecret = itemTwt.oAuthSecret;
                oauth.TwitterScreenName = itemTwt.twitterScreenName;
                oauth.TwitterUserId = itemTwt.twitterUserId;
                oauth.ConsumerKey = _appSettings.twitterConsumerKey;
                oauth.ConsumerKeySecret = _appSettings.twitterConsumerScreatKey;
                JArray jarresponse = twtUsers.Get_Followers_ById(oauth, itemTwt.twitterUserId);
                foreach (var item in jarresponse)
                {
                    int resposecount = 0;
                    if (item["ids"] != null)
                    {
                        foreach (var child in item["ids"])
                        {
                            if (resposecount < 2)
                            {
                                JArray userprofile = twtUsers.Get_Users_LookUp(oauth, child.ToString());
                                foreach (var items in userprofile)
                                {
                                    Domain.Socioboard.Models.TwitterRecentFollower objTwitterRecentFollower = new Domain.Socioboard.Models.TwitterRecentFollower();
                                    resposecount++;
                                    objTwitterRecentFollower.screen_name = items["screen_name"].ToString();
                                    objTwitterRecentFollower.name = items["name"].ToString();
                                    objTwitterRecentFollower.profile_image_url = items["profile_image_url"].ToString();
                                    lstTwitterRecentFollower.Add(objTwitterRecentFollower);
                                }
                            }
                        }
                    }
                }
            }
            return lstTwitterRecentFollower;
        }

        public static void PostTwitterDirectmessage(string toId, string message, string profileId,Model.DatabaseRepository dbr, Helper.AppSettings _appSettings,Helper.Cache _redisCache)
        {
            Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages _TwitterDirectMessages = new Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages();
            Domain.Socioboard.Models.TwitterAccount objTwitterAccount = Repositories.TwitterRepository.getTwitterAccount(profileId, _redisCache,dbr);
            oAuthTwitter OAuthTwt = new oAuthTwitter(_appSettings.twitterConsumerKey, _appSettings.twitterConsumerScreatKey, _appSettings.twitterRedirectionUrl);
            OAuthTwt.AccessToken = objTwitterAccount.oAuthToken;
            OAuthTwt.AccessTokenSecret = objTwitterAccount.oAuthSecret;
            OAuthTwt.TwitterScreenName = objTwitterAccount.twitterScreenName;
            OAuthTwt.TwitterUserId = objTwitterAccount.twitterUserId;
            const string format = "ddd MMM dd HH:mm:ss zzzz yyyy";
            TwitterUser twtuser = new TwitterUser();
            JArray ret = new JArray();
            try
            {
                ret = twtuser.PostDirect_Messages_New(OAuthTwt, message, toId);
                _TwitterDirectMessages.messageId = ret[0]["id_str"].ToString();
                _TwitterDirectMessages.message = ret[0]["text"].ToString();
                _TwitterDirectMessages.profileId = objTwitterAccount.twitterUserId;
                _TwitterDirectMessages.createdDate= DateTime.ParseExact(ret[0]["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture).ToString("yyyy/MM/dd HH:mm:ss");
                _TwitterDirectMessages.timeStamp = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact(ret[0]["created_at"].ToString().TrimStart('"').TrimEnd('"'), format, System.Globalization.CultureInfo.InvariantCulture));
                _TwitterDirectMessages.entryDate = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                _TwitterDirectMessages.recipientId = ret[0]["recipient"]["id_str"].ToString();
                _TwitterDirectMessages.recipientProfileUrl = ret[0]["recipient"]["profile_image_url_https"].ToString();
                _TwitterDirectMessages.recipientScreenName = ret[0]["recipient"]["screen_name"].ToString();
                _TwitterDirectMessages.senderId = ret[0]["sender"]["id_str"].ToString();
                _TwitterDirectMessages.senderProfileUrl = ret[0]["sender"]["profile_image_url_https"].ToString();
                _TwitterDirectMessages.senderScreenName = ret[0]["sender"]["screen_name"].ToString();
                _TwitterDirectMessages.type = Domain.Socioboard.Enum.TwitterMessageType.TwitterDirectMessageSent;
                MongoRepository mongorepo = new MongoRepository("MongoTwitterDirectMessages", _appSettings);
                mongorepo.Add<Domain.Socioboard.Models.Mongo.MongoTwitterDirectMessages>(_TwitterDirectMessages);
               
            }
            catch (Exception ex)
            {

            }
        }



        public static bool FollowAccount(oAuthTwitter OAuth, string Screen_name, string user_id)
        {
            bool IsFollowed = false;

            string RequestUrl = "https://api.twitter.com/1.1/friendships/create.json";
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            if (!string.IsNullOrEmpty(Screen_name))
            {
                strdic.Add("screen_name", Screen_name);
            }
            else if (!string.IsNullOrEmpty(user_id))
            {
                strdic.Add("user_id", user_id);
            }
            else
            {
                return false;
            }
            strdic.Add("follow", "true");
            string response = OAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!string.IsNullOrEmpty(response))
            {
                IsFollowed = true;
            }
            return IsFollowed;
        }


    }
}
