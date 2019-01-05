using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using AdvancedContentSearch.Helper;
using AdvancedContentSearch.Model;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Instagram.Custom;

namespace AdvancedContentSearch.SearchLibrary
{
    public class TrendingAdvanceSearch
    {
        public static void GetLatestTrendsFromTwiter()
        {

            try
            {
                string homepageUrl = "https://twitter.com/";
                string trendsUrl = "https://twitter.com/i/trends?k=0b49e0976b&pc=true&personalized=false&show_context=true&src=module&woeid=23424977";

                string homePageResponse = getHtmlfromUrl(trendsUrl);

                try
                {
                    string[] GetTrends = Regex.Split(homePageResponse, "data-trend-name=");
                    GetTrends = GetTrends.Skip(1).ToArray();
                    foreach (string item in GetTrends)
                    {
                        try
                        {
                            string trend = getBetween(item, "\"", "\\\"").Replace("&#39;", "'");
                            trend = Regex.Replace(trend, @"\\u[\d\w]{4}", String.Empty);
                            trend = trend.Replace("#", "");
                            new Thread(delegate ()
                            {
                                fetchdata(trend);
                            }).Start();

                        }
                        catch (Exception ex)
                        {

                        }
                    }
                }
                catch (Exception ex)
                {

                }
            }
            catch (Exception ex)
            {

            }
        }

        private static void fetchdata(string trend)
        {
            getingTweetFromURL("https://twitter.com/search?f=broadcasts&vertical=default&q=" + trend + "&src=tyah");
            getingTweetFromURL("https://twitter.com/search?f=news&vertical=default&q=" + trend + "&src=tyah");
            getingTweetFromURL("https://twitter.com/search?f=videos&vertical=default&q=" + trend + "&src=tyah");
            getingTweetFromURL("https://twitter.com/search?f=tweets&vertical=default&q=" + trend + "&src=tyah");
            getingTweetFromURL("https://twitter.com/search?vertical=default&q=" + trend + "&src=tyah");
            TrendingYoutubeSearch(trend);
            TrendingDailymotionSearch(trend);
            instgramSearch(trend);
        }

        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }

        public static string getHtmlfromUrl(string url)
        {
            string output = string.Empty;
            string facebookSearchUrl = url;
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return output;
        }


        public static void getingTweetFromURL(string URL)
        {
            try
            {
                Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                Like obj_Like = new Like();
                string pagesource = string.Empty;
                string min_position = string.Empty;
                string max_position = string.Empty;
                string paginationURL = string.Empty;
                string HomePagedata = string.Empty, screenName = string.Empty;
                int i = 0;
                string domainType = "https://twitter.com/";
            startAgain:
                if (i == 0)
                {
                    HomePagedata = getHtmlfromUrl(URL);
                    try
                    {
                        min_position = getBetween(HomePagedata, "data-min-position=\"", "\"");
                    }
                    catch { };
                    i++;
                }
                else
                {
                    string tempURL = URL + "-";
                    screenName = getBetween(URL, "https://twitter.com/", "-");
                    paginationURL = "https://twitter.com/i/profiles/show/" + screenName + "/timeline?include_available_features=1&include_entities=1&last_note_ts=1435159522&max_position=" + min_position + " ";
                    HomePagedata = getHtmlfromUrl(paginationURL);
                    try
                    {
                        min_position = getBetween(HomePagedata, "data-min-position=\"", "\"");
                        if (string.IsNullOrEmpty(min_position))
                        {
                            min_position = getBetween(HomePagedata, "min_position\":\"", "\"");
                        }
                    }
                    catch { };

                    string datahkj = string.Empty;
                    JObject Abc = JObject.Parse(HomePagedata);
                    foreach (object data in Abc)
                    {
                        datahkj = data.ToString();
                        if (datahkj.Contains("js-stream-item stream-item stream-item expanding-stream-item") || datahkj.Contains("ProfileTweet u-textBreak js-tweet js-stream-tweet js-actionable-tweet") || datahkj.Contains("tweet js-stream-tweet js-actionable-tweet js-profile-popup-actionable"))
                        {
                            break;
                        }
                    }
                    HomePagedata = datahkj;
                }
                if (!string.IsNullOrEmpty(HomePagedata))
                {
                    string dataHomepage = HomePagedata;
                    string[] spilitMain = Regex.Split(dataHomepage, "tweet js-stream-tweet js-actionable-tweet js-profile-popup-actionable dismissible-content");

                    foreach (string mainData in spilitMain)
                    {

                        if (mainData.Contains("<!DOCTYPE html>"))
                        {
                            continue;
                        }
                        if (mainData.Contains("min_position"))
                        {
                            continue;
                        }
                        string Tweetid = string.Empty, TweeterUserId = string.Empty, TweeterUserScreanName = string.Empty, text = string.Empty;
                        string profileImageurl = string.Empty;
                        string postUrl = string.Empty;
                        string videoUrl = string.Empty;
                        long postedTime = 0;
                        try
                        {
                            if (mainData.Contains("items_html"))
                            {
                                continue;
                            }
                            if (mainData.Contains("data-tweet-id="))
                            {
                                #region ReplayCount Retweet Count Like Count
                                // Replay Count / Retweet Count / Like count
                                string[] spilitGettingCount = Regex.Split(mainData, "data-aria-label-part>");
                                if (spilitGettingCount.Count() == 6)
                                {
                                    spilitGettingCount = spilitGettingCount.Skip(3).ToArray();
                                }

                                string repliesCount = string.Empty, likesCount = string.Empty, retweetCount = string.Empty;
                                foreach (string loopspilitGettingCount in spilitGettingCount)
                                {
                                    try
                                    {
                                        string getFirstNumber = loopspilitGettingCount.Substring(0, 1);
                                        if (!NumberHelper.ValidateNumber(getFirstNumber))
                                        {
                                            continue;
                                        }
                                        if ((loopspilitGettingCount.Contains("replies")) && (!loopspilitGettingCount.Contains("retweets")) && (!loopspilitGettingCount.Contains("likes")))
                                        {
                                            string temploopspilitGettingCount = "-" + loopspilitGettingCount;
                                            repliesCount = getBetween(temploopspilitGettingCount, "-", "replies").Trim();
                                            if (repliesCount.Contains(","))
                                            {
                                                repliesCount = repliesCount.Replace(",", "");
                                            }
                                            _AdvanceSerachData.repliesCount = Convert.ToInt32(repliesCount);
                                        }
                                        else if ((loopspilitGettingCount.Contains("retweets")) && (!loopspilitGettingCount.Contains("replies")) && (!loopspilitGettingCount.Contains("likes")))
                                        {
                                            string temploopspilitGettingCount = "-" + loopspilitGettingCount;
                                            retweetCount = getBetween(temploopspilitGettingCount, "-", "retweets").Trim();
                                            if (retweetCount.Contains(","))
                                            {
                                                retweetCount = retweetCount.Replace(",", "");
                                            }
                                            _AdvanceSerachData.retweetCount = Convert.ToInt32(retweetCount);
                                        }
                                        else if ((loopspilitGettingCount.Contains("likes")))
                                        {
                                            string temploopspilitGettingCount = "-" + loopspilitGettingCount;
                                            likesCount = getBetween(temploopspilitGettingCount, "-", "likes").Trim();
                                            if (likesCount.Contains(","))
                                            {
                                                likesCount = likesCount.Replace(",", "");
                                            }
                                            _AdvanceSerachData.likeCount = Convert.ToInt32(likesCount);
                                        }
                                    }
                                    catch (Exception ex)
                                    {

                                    }
                                }
                                string getSpecifiedDate = string.Empty;
                                string skipORnot = string.Empty;
                                if (obj_Like.IsFilterByIgnoreTweetsSpecifyDay)
                                {
                                    try
                                    {
                                        getSpecifiedDate = getBetween(mainData, "tweet-timestamp js-permalink js-nav js-tooltip", "data");
                                        getSpecifiedDate = getBetween(getSpecifiedDate, "title=\"", "\"").Trim();
                                        if (getSpecifiedDate.Contains("-"))
                                        {
                                            getSpecifiedDate = getSpecifiedDate.Replace("-", "");
                                        }
                                    }
                                    catch (Exception ex)
                                    {

                                    }
                                }
                                if (!string.IsNullOrEmpty(getSpecifiedDate))
                                {
                                    try
                                    {
                                        DateTime dt_LastTweetDate = DateTime.Parse(getSpecifiedDate);

                                        DateTime dt_Now = DateTime.Now;
                                        TimeSpan dt_Difference = dt_Now.Subtract(dt_LastTweetDate);

                                        if (dt_Difference.Days > Convert.ToInt32(obj_Like.NoSpecifyDay))
                                        {
                                            skipORnot = "continue";
                                        }
                                    }
                                    catch (Exception ex)
                                    {

                                    }
                                }

                                int finalComments = 0;
                                try
                                {
                                    if (NumberHelper.ValidateNumber(repliesCount))
                                    {
                                        finalComments = Convert.ToInt32(repliesCount);
                                    }

                                }
                                catch (Exception ex)
                                {
                                }
                                int finalLikes = 0;
                                try
                                {
                                    if (NumberHelper.ValidateNumber(likesCount))
                                    {
                                        finalLikes = Convert.ToInt32(likesCount);
                                    }

                                }
                                catch (Exception ex)
                                {
                                }
                                int finalRetweets = 0;
                                try
                                {
                                    if (NumberHelper.ValidateNumber(retweetCount))
                                    {
                                        finalRetweets = Convert.ToInt32(retweetCount);
                                    }

                                }
                                catch (Exception ex)
                                {
                                }
                                if (obj_Like.IsFilterByComments)
                                {
                                    if (obj_Like.MinComments <= finalComments && obj_Like.MaxComments >= finalComments)
                                    {

                                    }
                                    else
                                    {
                                        skipORnot = "continue";
                                    }
                                }
                                if (obj_Like.IsFilterByLikes)
                                {
                                    if (obj_Like.MinLike <= finalLikes && obj_Like.MaxLike >= finalLikes)
                                    {

                                    }
                                    else
                                    {
                                        skipORnot = "continue";
                                    }
                                }
                                if (obj_Like.IsFilterByRetweets)
                                {
                                    if (obj_Like.MinRetweets <= finalRetweets && obj_Like.MaxRetweets >= finalRetweets)
                                    {

                                    }
                                    else
                                    {
                                        skipORnot = "continue";
                                    }
                                }
                                if (skipORnot == "continue")
                                {
                                    continue;
                                }
                                #endregion
                                //videoUrl
                                string postType = string.Empty;
                                try
                                {
                                    string videorrl = getBetween(mainData, "data-card-url=\"", "\"");
                                    videoUrl = videorrl;
                                    _AdvanceSerachData.videourl = videoUrl;
                                    if (!string.IsNullOrEmpty(videoUrl))
                                    {
                                        _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;

                                    }
                                    else
                                    {
                                        _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                                    }

                                }
                                catch (Exception)
                                {

                                }
                                try
                                {
                                    string time = getBetween(mainData, "data-time=\"", "\"");
                                    postedTime = Convert.ToInt32(time);
                                    _AdvanceSerachData.postedTime = postedTime;
                                }
                                catch (Exception)
                                {

                                }


                                //profileImageUrl
                                try
                                {
                                    string prfurl = getBetween(mainData, "avatar js-action-profile-avatar", "alt=");
                                    profileImageurl = getBetween(prfurl, "src=\"", "\"");
                                    _AdvanceSerachData.ImageUrl = profileImageurl;
                                }
                                catch (Exception)
                                {

                                }
                                //postUrl
                                try
                                {
                                    string posturl = getBetween(mainData, "data-permalink-path=\"", "data-conversation-id").Replace("\"", "");
                                    postUrl = "https://twitter.com" + posturl;
                                    long fbengagementCount = fbShareCount(postUrl);
                                    long redditShare = redditShareCount(postUrl);

                                    //string datacount = getdonreachdatafromUrl("https://free.donreach.com/shares?providers=facebook,twitter,google,pinterest,linkedin,reddit&url=" + postUrl);
                                    //JObject shareData = JObject.Parse(datacount);
                                    //long pinshare = Convert.ToInt32(shareData["shares"]["pinterest"].ToString());
                                    //long linshare = Convert.ToInt32(shareData["shares"]["linkedin"].ToString());
                                    //long gplusshare = Convert.ToInt32(shareData["shares"]["google"].ToString());
                                    //long twittershare = Convert.ToInt32(shareData["shares"]["twitter"].ToString());

                                    long linshare = linShareCount(postUrl);
                                    long pinshare =  pinShareCount(postUrl);
                                    long twittershare = 0;
                                    long gplusshare = GetPlusOnes(postUrl);
                                        
                                    _AdvanceSerachData.postUrl = postUrl;
                                    _AdvanceSerachData.pinShareCount = pinshare;
                                    _AdvanceSerachData.gplusShareCount = gplusshare;
                                    _AdvanceSerachData.linShareCount = linshare;
                                    _AdvanceSerachData.twtShareCount = twittershare;
                                    _AdvanceSerachData.redditShareCount = redditShare;
                                    _AdvanceSerachData.fbengagementCount = fbengagementCount;
                                    _AdvanceSerachData.totalShareCount = Convert.ToInt64(pinshare + gplusshare + linshare + twittershare + redditShare + fbengagementCount);
                                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.twitter;
                                }
                                catch (Exception)
                                {

                                }

                                ///Tweet ID
                                try
                                {
                                    int startindex = mainData.IndexOf("data-item-id=\\\"");
                                    string start = mainData.Substring(startindex).Replace("data-item-id=\\\"", "");
                                    int endindex = start.IndexOf("\\\"");
                                    string end = start.Substring(0, endindex);
                                    Tweetid = end;
                                    _AdvanceSerachData.postId = Tweetid;
                                }
                                catch (Exception ex)
                                {
                                    int startindex = mainData.IndexOf("data-item-id=\"");
                                    string start = mainData.Substring(startindex).Replace("data-item-id=\"", "");
                                    int endindex = start.IndexOf("\"");
                                    string end = start.Substring(0, endindex);
                                    Tweetid = end;
                                    _AdvanceSerachData.postId = Tweetid;
                                }

                                ///Tweet User Screen name
                                try
                                {
                                    int startindex = mainData.IndexOf("data-screen-name=\\\"");
                                    string start = mainData.Substring(startindex).Replace("data-screen-name=\\\"", "");
                                    int endindex = start.IndexOf("\\\"");
                                    string end = start.Substring(0, endindex);
                                    TweeterUserScreanName = end;
                                    _AdvanceSerachData.userName = TweeterUserScreanName;
                                    string contactUrl = "https://api.fullcontact.com/v2/person.json?twitter=" + _AdvanceSerachData.userName + "&apiKey=" + AppSetting.fullcontactserachapikey;
                                    string contactSerachDat = getHtmlfromUrl(contactUrl);


                                    if (!string.IsNullOrEmpty(contactSerachDat) &&
                                        contactSerachDat.Contains("socialProfiles"))
                                    {
                                        JObject contactData = JObject.Parse(contactSerachDat);
                                        foreach (var item in contactData["socialProfiles"])
                                        {
                                            if (item["type"].ToString() == "linkedin")
                                            {
                                                try
                                                {
                                                    _AdvanceSerachData.linkedindescription = item["bio"].ToString();
                                                }
                                                catch (Exception)
                                                {

                                                }
                                                try
                                                {
                                                    _AdvanceSerachData.linkedinprofileurl = item["url"].ToString();
                                                }
                                                catch (Exception)
                                                {
                                                }
                                            }
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    int startindex = mainData.IndexOf("data-screen-name=\"");
                                    string start = mainData.Substring(startindex).Replace("data-screen-name=\"", "");
                                    int endindex = start.IndexOf("\"");
                                    string end = start.Substring(0, endindex);
                                    TweeterUserScreanName = end;
                                    _AdvanceSerachData.userName = TweeterUserScreanName;
                                    string contactUrl = "https://api.fullcontact.com/v2/person.json?twitter=" + _AdvanceSerachData.userName + "&apiKey=" + AppSetting.fullcontactserachapikey;
                                    string contactSerachDat = getHtmlfromUrl(contactUrl);
                                    if (!string.IsNullOrEmpty(contactSerachDat) &&
                                        contactSerachDat.Contains("socialProfiles"))
                                    {
                                        JObject contactData = JObject.Parse(contactSerachDat);
                                        foreach (var item in contactData["socialProfiles"])
                                        {
                                            if (item["type"].ToString() == "linkedin")
                                            {
                                                try
                                                {
                                                    _AdvanceSerachData.linkedindescription = item["bio"].ToString();
                                                }
                                                catch (Exception)
                                                {

                                                }
                                                try
                                                {
                                                    _AdvanceSerachData.linkedinprofileurl = item["url"].ToString();
                                                }
                                                catch (Exception)
                                                {
                                                }
                                            }
                                        }
                                    }    
                                }

                                ///Tweet User User-id
                                try
                                {
                                    int startindex = mainData.IndexOf("data-user-id=\\\"");
                                    string start = mainData.Substring(startindex).Replace("data-user-id=\\\"", "");
                                    int endindex = start.IndexOf("\\\"");
                                    string end = start.Substring(0, endindex);
                                    TweeterUserId = end;
                                }
                                catch (Exception ex)
                                {
                                    int startindex = mainData.IndexOf("data-user-id=\"");
                                    string start = mainData.Substring(startindex).Replace("data-user-id=\"", "");
                                    int endindex = start.IndexOf("\"");
                                    string end = start.Substring(0, endindex);
                                    TweeterUserId = end;
                                }

                                //// Tweet Text

                                string tempmaintextData = getBetween(mainData, "js-tweet-text-container", "</p>");
                                string return_Cut_String = string.Empty;
                                int flag = 1;
                                string maintextData = getBetween(tempmaintextData, "data-aria-label-part=\"0\"", "a href");
                                if (string.IsNullOrEmpty(maintextData))
                                {
                                    tempmaintextData = tempmaintextData + "-";
                                    maintextData = getBetween(tempmaintextData, "data-aria-label-part=\"0\"", "-");
                                }
                                return_Cut_String = "<" + maintextData + ">";
                                if ((!maintextData.Contains("<")) || (!maintextData.Contains(">")))
                                {
                                    return_Cut_String = maintextData + "< >";
                                }

                                while (flag > 0)
                                {
                                    try
                                    {
                                        string start_String = "<";
                                        string end_string = ">";
                                        if (return_Cut_String.Contains(start_String) && return_Cut_String.Contains(end_string))
                                        {
                                            try
                                            {
                                                int start_Length = return_Cut_String.IndexOf(start_String, 0);// + start.Length;
                                                int end_Length = return_Cut_String.IndexOf(end_string, start_Length) + 1;
                                                string TEMPreturn_Cut_String = return_Cut_String.Substring(start_Length, end_Length - start_Length);
                                                return_Cut_String = return_Cut_String.Replace(TEMPreturn_Cut_String, "");
                                            }
                                            catch (Exception ex)
                                            {
                                            }

                                        }
                                        if (!return_Cut_String.Contains(start_String) || !return_Cut_String.Contains(end_string))
                                        {

                                            if (return_Cut_String.Contains("\n"))
                                            {
                                                return_Cut_String = return_Cut_String.Replace("\n", "");
                                            }

                                            text = return_Cut_String;
                                            if (text.Contains("&#39;"))
                                            {
                                                text = text.Replace("&#39;", "");
                                            }
                                            break;
                                        }
                                    }
                                    catch (Exception ex)
                                    {

                                    }
                                }
                                if (text.Length > 140)
                                {
                                    text = text.Substring(0, 140);
                                }
                                _AdvanceSerachData.postdescription = text;
                                _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                                _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                                _AdvanceSerachData.domainType = domainType;

                            }
                        }
                        catch (Exception ex)
                        {
                        }
                        MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
                        int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == _AdvanceSerachData.postUrl);
                        if (count == 0)
                        {
                            mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(_AdvanceSerachData);
                        }
                        else
                        {
                            var update = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Update.Set(t => t.likeCount, _AdvanceSerachData.likeCount).Set(t => t.linShareCount, _AdvanceSerachData.linShareCount).Set(t => t.pinShareCount, _AdvanceSerachData.pinShareCount)
                               .Set(t => t.redditShareCount, _AdvanceSerachData.redditShareCount)
                               .Set(t => t.repliesCount, _AdvanceSerachData.repliesCount)
                               .Set(t => t.retweetCount, _AdvanceSerachData.retweetCount)
                               .Set(t => t.twtShareCount, _AdvanceSerachData.twtShareCount)
                               .Set(t => t.gplusShareCount, _AdvanceSerachData.gplusShareCount)
                               .Set(t => t.fbengagementCount, _AdvanceSerachData.fbengagementCount)
                              .Set(t => t.totalShareCount, _AdvanceSerachData.totalShareCount);
                            mongoreppo.Update<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(update, t => t.postUrl == _AdvanceSerachData.postUrl);
                        }
                    }
                }
                goto startAgain;
            }
            catch (Exception ex)
            {
            }
        }
        public static long fbShareCount(string postUrl)
        {
            try
            {
                postUrl = "https://graph.facebook.com/?fields=id,share,og_object{engagement{count},likes.summary(true).limit(0),comments.limit(0).summary(true)}&id=" + postUrl;
                string data = getHtmlfromUrl(postUrl);
                JObject shareData = JObject.Parse(data);
                return Convert.ToInt32(shareData["og_object"]["engagement"]["count"].ToString());
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        public static long pinShareCount(string postUrl)
        {
            try
            {
                postUrl = "https://api.pinterest.com/v1/urls/count.json?callback=jsonp&url=" + postUrl;
                string data = getHtmlfromUrl(postUrl).Replace("jsonp(", "").Replace(")", "");
                JObject shareData = JObject.Parse(data);
                return Convert.ToInt32(shareData["count"].ToString());
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        public static long linShareCount(string postUrl)
        {
            try
            {
                postUrl = "https://www.linkedin.com/countserv/count/share?url=" + postUrl;
                string data = getHtmlfromUrl(postUrl).Replace("IN.Tags.Share.handleCount(", "").Replace(")", "").Replace(";", "");
                JObject shareData = JObject.Parse(data);
                return Convert.ToInt32(shareData["count"].ToString());
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        public static long redditShareCount(string postUrl)
        {
            try
            {
                postUrl = "http://www.reddit.com/api/info.json?url=" + postUrl;
                string data = getHtmlfromUrl(postUrl).Replace("IN.Tags.Share.handleCount(", "").Replace(")", "").Replace(";", "");
                JObject shareData = JObject.Parse(data);
                return Convert.ToInt32(shareData["data"]["children"]["data"]["score"].ToString());
            }
            catch (Exception ex)
            {
                return 0;
            }
        }
        public static long GetPlusOnes(string url)
        {

            string googleApiUrl = "https://clients6.google.com/rpc?key=AIzaSyBjTBm1HZzlKd1EBcQ3QCCgWfy21kxjvwA";

            string postData = @"[{""method"":""pos.plusones.get"",""id"":""p"",""params"":{""nolog"":true,""id"":""" + url + @""",""source"":""widget"",""userId"":""@viewer"",""groupId"":""@self""},""jsonrpc"":""2.0"",""key"":""p"",""apiVersion"":""v1""}]";

            System.Net.HttpWebRequest request = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(googleApiUrl);
            request.Method = "POST";
            request.ContentType = "application/json-rpc";
            request.ContentLength = postData.Length;

            System.IO.Stream writeStream = request.GetRequestStream();
            UTF8Encoding encoding = new UTF8Encoding();
            byte[] bytes = encoding.GetBytes(postData);
            writeStream.Write(bytes, 0, bytes.Length);
            writeStream.Close();

            System.Net.HttpWebResponse response = (System.Net.HttpWebResponse)request.GetResponse();
            System.IO.Stream responseStream = response.GetResponseStream();
            System.IO.StreamReader readStream = new System.IO.StreamReader(responseStream, Encoding.UTF8);
            string jsonString = readStream.ReadToEnd();

            readStream.Close();
            responseStream.Close();
            response.Close();
            JObject json = JObject.Parse(jsonString);
            //var json = new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize(jsonString);
            long count = Convert.ToInt32(json[0]["result"]["metadata"]["globalCounts"]["count"].ToString().Replace(".0", ""));

            return count;
        }

        public static string getdonreachdatafromUrl(string url)
        {
            string output = string.Empty;
            string facebookSearchUrl = url;
            var facebooklistpagerequest = (HttpWebRequest)WebRequest.Create(facebookSearchUrl);
            facebooklistpagerequest.Method = "GET";
            facebooklistpagerequest.Credentials = CredentialCache.DefaultCredentials;
            facebooklistpagerequest.AllowWriteStreamBuffering = true;
            facebooklistpagerequest.ServicePoint.Expect100Continue = false;
            facebooklistpagerequest.PreAuthenticate = false;
            facebooklistpagerequest.Headers.Add("Authorization", "5dff487cace344b36e6d551b20fc9917");
            try
            {
                using (var response = facebooklistpagerequest.GetResponse())
                {
                    using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                    {
                        output = stream.ReadToEnd();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return output;
        }

        public static void TrendingYoutubeSearch(string trends)
        {
            MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
            try
            {
                string youtubesearchurl = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&order=relevance&q=" + trends + "&key=AIzaSyBmQ1X1UBnKi3V78EkLuh7UHk5odrGfp5M";
                string response = WebRequst(youtubesearchurl);
                var Jdata = Newtonsoft.Json.Linq.JObject.Parse(response);

                foreach (var item in Jdata["items"])
                {
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "https://www.youtube.com/";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.youtube;
                    try
                    {
                        _AdvanceSerachData.userName = item["snippet"]["channelTitle"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.userName = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postId = item["id"]["videoId"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postId = "";
                    }
                    try
                    {
                        _AdvanceSerachData.title = item["snippet"]["title"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.title = "";
                    }
                    try
                    {
                        _AdvanceSerachData.videourl = "https://www.youtube.com/watch?v=" + _AdvanceSerachData.postId;
                        long fbengagementCount = TwitterAdvanceSearch.fbShareCount(_AdvanceSerachData.videourl);
                        long redditShare = TwitterAdvanceSearch.redditShareCount(_AdvanceSerachData.videourl);
                       // string datacount = TwitterAdvanceSearch.getdonreachdatafromUrl("https://free.donreach.com/shares?providers=facebook,twitter,google,pinterest,linkedin,reddit&url=" + _AdvanceSerachData.videourl);
                       // JObject shareData = JObject.Parse(datacount);
                        //long pinshare = Convert.ToInt32(shareData["shares"]["pinterest"].ToString());
                        //long linshare = Convert.ToInt32(shareData["shares"]["linkedin"].ToString());
                        //long gplusshare = Convert.ToInt32(shareData["shares"]["google"].ToString());
                        //long twittershare = Convert.ToInt32(shareData["shares"]["twitter"].ToString());

                        long pinshare = TwitterAdvanceSearch.pinShareCount(_AdvanceSerachData.postUrl);
                        long linshare = TwitterAdvanceSearch.linShareCount(_AdvanceSerachData.postUrl);
                        long twittershare = 0;
                        long gplusshare = TwitterAdvanceSearch.GetPlusOnes(_AdvanceSerachData.postUrl);


                        _AdvanceSerachData.postUrl = _AdvanceSerachData.videourl;
                        _AdvanceSerachData.pinShareCount = pinshare;
                        _AdvanceSerachData.gplusShareCount = gplusshare;
                        _AdvanceSerachData.linShareCount = linshare;
                        _AdvanceSerachData.twtShareCount = twittershare;
                        _AdvanceSerachData.redditShareCount = redditShare;
                        _AdvanceSerachData.fbengagementCount = fbengagementCount;
                        _AdvanceSerachData.totalShareCount = Convert.ToInt64(pinshare + gplusshare + linshare + twittershare + redditShare + fbengagementCount);
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.videourl = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postdescription = item["snippet"]["description"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postdescription = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp((DateTime.Parse(item["snippet"]["publishedAt"].ToString())));
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                    }
                    int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == _AdvanceSerachData.postUrl);
                    if (count == 0)
                    {
                        mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(_AdvanceSerachData);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Update.Set(t => t.linShareCount, _AdvanceSerachData.linShareCount).Set(t => t.pinShareCount, _AdvanceSerachData.pinShareCount)
                           .Set(t => t.redditShareCount, _AdvanceSerachData.redditShareCount)
                           .Set(t => t.twtShareCount, _AdvanceSerachData.twtShareCount)
                           .Set(t => t.gplusShareCount, _AdvanceSerachData.gplusShareCount)
                           .Set(t => t.fbengagementCount, _AdvanceSerachData.fbengagementCount)
                          .Set(t => t.totalShareCount, _AdvanceSerachData.totalShareCount);
                        mongoreppo.Update<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(update, t => t.postUrl == _AdvanceSerachData.postUrl);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }
        public static void TrendingDailymotionSearch(string trends)
        {
            MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
            try
            {
                string _dailymotionpostRestUrl = "https://api.dailymotion.com/videos/?search=" + trends + "&fields=id,title,created_time,url,description,owner.username, owner.screenname, owner.fullname,owner.url, owner.avatar_25_url, owner.avatar_60_url, owner.avatar_80_url, owner.avatar_120_url, owner.avatar_190_url, owner.avatar_240_url, owner.avatar_360_url, owner.avatar_480_url, owner.avatar_720_url";

                string response = WebRequst(_dailymotionpostRestUrl);

                var jdata = Newtonsoft.Json.Linq.JObject.Parse(response);

                foreach (var item in jdata["list"])
                {
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "http://www.dailymotion.com/in";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.dailymotion;
                    try
                    {
                        _AdvanceSerachData.userName = item["owner.username"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.userName = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postId = item["id"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postId = "";
                    }
                    try
                    {
                        _AdvanceSerachData.title = item["title"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.title = "";
                    }
                    try
                    {
                        _AdvanceSerachData.videourl = item["url"].ToString();
                        long fbengagementCount = TwitterAdvanceSearch.fbShareCount(_AdvanceSerachData.videourl);
                        long redditShare = TwitterAdvanceSearch.redditShareCount(_AdvanceSerachData.videourl);
                        //string datacount = TwitterAdvanceSearch.getdonreachdatafromUrl("https://free.donreach.com/shares?providers=facebook,twitter,google,pinterest,linkedin,reddit&url=" + _AdvanceSerachData.videourl);
                        //JObject shareData = JObject.Parse(datacount);
                        //long pinshare = Convert.ToInt32(shareData["shares"]["pinterest"].ToString());
                        //long linshare = Convert.ToInt32(shareData["shares"]["linkedin"].ToString());
                        //long gplusshare = Convert.ToInt32(shareData["shares"]["google"].ToString());
                        //long twittershare = Convert.ToInt32(shareData["shares"]["twitter"].ToString());

                        long pinshare = TwitterAdvanceSearch.pinShareCount(_AdvanceSerachData.postUrl);
                        long linshare = TwitterAdvanceSearch.linShareCount(_AdvanceSerachData.postUrl);
                        long twittershare = 0;
                        long gplusshare = TwitterAdvanceSearch.GetPlusOnes(_AdvanceSerachData.postUrl);


                        _AdvanceSerachData.postUrl = _AdvanceSerachData.videourl;
                        _AdvanceSerachData.pinShareCount = pinshare;
                        _AdvanceSerachData.gplusShareCount = gplusshare;
                        _AdvanceSerachData.linShareCount = linshare;
                        _AdvanceSerachData.twtShareCount = twittershare;
                        _AdvanceSerachData.redditShareCount = redditShare;
                        _AdvanceSerachData.fbengagementCount = fbengagementCount;
                        _AdvanceSerachData.totalShareCount = Convert.ToInt64(pinshare + gplusshare + linshare + twittershare + redditShare + fbengagementCount);
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.videourl = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postdescription = item["description"].ToString();
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postdescription = "";
                    }
                    try
                    {
                        _AdvanceSerachData.postedTime = double.Parse(item["created_time"].ToString());
                    }
                    catch (Exception ex)
                    {

                        _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                    }
                    int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == _AdvanceSerachData.postUrl);
                    if (count == 0)
                    {
                        mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(_AdvanceSerachData);
                    }
                    else
                    {
                        var update = Builders<Domain.Socioboard.Models.Mongo.AdvanceSerachData>.Update.Set(t => t.linShareCount, _AdvanceSerachData.linShareCount).Set(t => t.pinShareCount, _AdvanceSerachData.pinShareCount)
                           .Set(t => t.redditShareCount, _AdvanceSerachData.redditShareCount)
                           .Set(t => t.twtShareCount, _AdvanceSerachData.twtShareCount)
                           .Set(t => t.gplusShareCount, _AdvanceSerachData.gplusShareCount)
                           .Set(t => t.fbengagementCount, _AdvanceSerachData.fbengagementCount)
                          .Set(t => t.totalShareCount, _AdvanceSerachData.totalShareCount);
                        mongoreppo.Update<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(update, t => t.postUrl == _AdvanceSerachData.postUrl);
                    }
                }
            }
            catch (Exception ex)
            {

            }

        }


        public static void instgramSearch(string trends)
        {
            DatabaseRepository dbr = new DatabaseRepository();
            MongoRepository mongoreppo = new MongoRepository("AdvanceSerachData");
            try
            {
                JObject recentactivities = JObject.Parse(TagSearch.InstagramTagSearch(trends, "1974224400.2310fd1.699477d40ff64cd6babfb0b3a6cf60fa"));
                foreach (JObject obj in JArray.Parse(recentactivities["data"].ToString()))
                {
                    Domain.Socioboard.Models.Mongo.AdvanceSerachData _AdvanceSerachData = new Domain.Socioboard.Models.Mongo.AdvanceSerachData();
                    _AdvanceSerachData.Id = ObjectId.GenerateNewId();
                    _AdvanceSerachData.strId = ObjectId.GenerateNewId().ToString();
                    _AdvanceSerachData.domainType = "https://www.instagram.com/?";
                    _AdvanceSerachData.postType = Domain.Socioboard.Enum.AdvanceSearchpostType.trending;
                    _AdvanceSerachData.networkType = Domain.Socioboard.Enum.NetworkType.instagram;

                    try
                    {
                        _AdvanceSerachData.ImageUrl = obj["images"]["standard_resolution"]["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.postUrl = obj["link"].ToString();
                    }
                    catch { }
                    try
                    {
                        foreach (JValue tag in JArray.Parse(obj["tags"].ToString()))
                        {
                            try
                            {
                                _AdvanceSerachData.postdescription = tag.ToString() + ",";
                            }
                            catch { }
                        }
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.postedTime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(Convert.ToDateTime(obj["created_time"].ToString()));
                    }
                    catch
                    {
                        _AdvanceSerachData.postedTime = SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                    }
                    try
                    {
                        _AdvanceSerachData.postId = obj["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.userName = obj["user"]["username"].ToString();
                    }
                    catch { }
                    try
                    {
                        _AdvanceSerachData.userName = obj["user"]["full_name"].ToString();
                    }
                    catch { }
                    int count = mongoreppo.Counts<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(t => t.postUrl == _AdvanceSerachData.postUrl);
                    if (count == 0)
                    {
                        mongoreppo.Add<Domain.Socioboard.Models.Mongo.AdvanceSerachData>(_AdvanceSerachData);
                    }
                    else
                    {

                    }
                }
            }
            catch { }


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
