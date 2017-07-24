using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Authentication;
using Socioboard.Twitter.Twitter.Core.TweetMethods;
using SociobordRssDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;

namespace SociobordRssDataServices.Rss
{
    public class RssFeed
    {
        public static int apiHitsCount = 0;
        public static int MaxapiHitsCount = 20;
        public static int twtapiHitsCount = 0;
        public static int twtMaxapiHitsCount = 50;

        public static void updateRssFeeds(Domain.Socioboard.Models.Mongo.Rss _rss)
        {
            ParseFeedUrl(_rss.RssFeedUrl, _rss.ProfileType, _rss.ProfileId, _rss.UserId, _rss.ProfileName, _rss.ProfileImageUrl);

        }

        public static string ParseFeedUrl(string TextUrl, Domain.Socioboard.Enum.SocialProfileType profiletype, string profileid, long userId, string profileName, string profileImageUrl)
        {

            MongoRepository _RssFeedRepository = new MongoRepository("RssFeed");
            try
            {

                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(TextUrl);
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("item");
                if (profiletype == Domain.Socioboard.Enum.SocialProfileType.Facebook || profiletype == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                {
                    Model.DatabaseRepository dbr = new DatabaseRepository();
                    Domain.Socioboard.Models.Facebookaccounts _Facebookaccounts = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == profileid).First();
                    //if (_Facebookaccounts.SchedulerUpdate.AddHours(1) <= DateTime.UtcNow)
                    //{
                    if (_Facebookaccounts != null)
                    {
                        if (_Facebookaccounts.IsActive)
                        {

                            foreach (XmlElement item in abc)
                            {
                                Domain.Socioboard.Models.Mongo.RssFeed objRssFeeds = new Domain.Socioboard.Models.Mongo.RssFeed();
                                try
                                {
                                    objRssFeeds.Id = ObjectId.GenerateNewId();
                                    objRssFeeds.strId = ObjectId.GenerateNewId().ToString();
                                    objRssFeeds.ProfileName = profileName;
                                    objRssFeeds.ProfileImageUrl = profileImageUrl;

                                    try
                                    {
                                        objRssFeeds.Message = item.ChildNodes[9].InnerText;
                                        objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                        objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);

                                    }
                                    catch (Exception ex)
                                    {
                                        try
                                        {
                                            if (item.ChildNodes[2].InnerText.Contains("www") && item.ChildNodes[2].InnerText.Contains("http"))
                                            {
                                                objRssFeeds.Message = item.ChildNodes[1].InnerText;
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                            }
                                            else
                                            {
                                                objRssFeeds.Message = item.ChildNodes[2].InnerText;
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                            }
                                        }
                                        catch
                                        {
                                            objRssFeeds.Message = item.ChildNodes[1].InnerText;
                                            objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                            objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                        }
                                    }
                                    if(string.IsNullOrEmpty(objRssFeeds.Message))
                                    {
                                        objRssFeeds.Message = item.ChildNodes[7].InnerText;
                                    }

                                    try
                                    {
                                        objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[4].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                                    }
                                    catch (Exception ex)
                                    {
                                        objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[3].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                                    }

                                    if (item.ChildNodes[0].Name== "guid")
                                    {
                                        objRssFeeds.Title = item.ChildNodes[1].InnerText; 
                                    }
                                    else
                                    {
                                        objRssFeeds.Title = item.ChildNodes[0].InnerText;
                                    }

                                    if (item.ChildNodes[1].InnerText.Contains("www") || item.ChildNodes[1].InnerText.Contains("http"))
                                    {
                                        try
                                        {
                                            objRssFeeds.Image = item.ChildNodes[1].InnerText;
                                            objRssFeeds.Image = getBetween(objRssFeeds.Image, "src=\"", "\"");
                                            objRssFeeds.Link = item.ChildNodes[1].InnerText;
                                            objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                        }
                                        catch (Exception ex)
                                        {
                                            objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                            objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                        }
                                    }
                                    else
                                    {
                                        objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                        objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                        if(string.IsNullOrEmpty(objRssFeeds.Link))
                                        {
                                            objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                        }
                                    }
                                    objRssFeeds.RssFeedUrl = TextUrl;
                                    objRssFeeds.ProfileId = profileid;
                                    objRssFeeds.ProfileType = profiletype;
                                    objRssFeeds.Status = false;
                                    var ret = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssFeed>(t => t.Link.Equals(objRssFeeds.Link) && t.ProfileId.Equals(profileid) && t.ProfileType.Equals(profiletype));
                                    var task = Task.Run(async () =>
                                    {
                                        return await ret;
                                    });
                                    int count = task.Result.Count;
                                    if (count < 1)
                                    {
                                        _RssFeedRepository.Add<Domain.Socioboard.Models.Mongo.RssFeed>(objRssFeeds);
                                    }

                                }
                                catch (Exception ex)
                                {

                                }
                                if (apiHitsCount < MaxapiHitsCount)
                                {
                                    string facebookdata = FacebookComposeMessageRss(objRssFeeds.Message, _Facebookaccounts.AccessToken, _Facebookaccounts.FbUserId, objRssFeeds.Title, objRssFeeds.Link, objRssFeeds.strId);
                                    if (!string.IsNullOrEmpty(facebookdata))
                                    {
                                        apiHitsCount++;

                                    }
                                }
                                else
                                {
                                    apiHitsCount = 0;
                                    return "ok";
                                }
                            }
                            _Facebookaccounts.SchedulerUpdate = DateTime.UtcNow;
                            dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_Facebookaccounts);

                        }
                    }
                    //}
                    //else
                    //{
                    //    apiHitsCount = 0;
                    //}
                }
                if (profiletype == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                {
                    Model.DatabaseRepository dbr = new DatabaseRepository();
                    Domain.Socioboard.Models.TwitterAccount _TwitterAccount = dbr.Find<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == profileid).First();
                    //if (_TwitterAccount.SchedulerUpdate.AddMinutes(15) <= DateTime.UtcNow)
                    //{
                    if (_TwitterAccount != null)
                    {
                        if (_TwitterAccount.isActive)
                        {

                            foreach (XmlElement item in abc)
                            {
                                Domain.Socioboard.Models.Mongo.RssFeed objRssFeeds = new Domain.Socioboard.Models.Mongo.RssFeed();
                                try
                                {
                                    objRssFeeds.Id = ObjectId.GenerateNewId();
                                    objRssFeeds.strId = ObjectId.GenerateNewId().ToString();
                                    objRssFeeds.ProfileName = profileName;
                                    objRssFeeds.ProfileImageUrl = profileImageUrl;

                                    try
                                    {
                                        objRssFeeds.Message = item.ChildNodes[9].InnerText;
                                        objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                        objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);

                                    }
                                    catch (Exception ex)
                                    {
                                        try
                                        {
                                            if (item.ChildNodes[2].InnerText.Contains("www") && item.ChildNodes[2].InnerText.Contains("http"))
                                            {
                                                objRssFeeds.Message = item.ChildNodes[1].InnerText;
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                            }
                                            else
                                            {
                                                objRssFeeds.Message = item.ChildNodes[2].InnerText;
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                            }
                                        }
                                        catch
                                        {
                                            objRssFeeds.Message = item.ChildNodes[1].InnerText;
                                            objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                            objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                        }
                                    }

                                    if (string.IsNullOrEmpty(objRssFeeds.Message))
                                    {
                                        objRssFeeds.Message = item.ChildNodes[7].InnerText;
                                    }
                                    try
                                    {
                                        objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[4].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                                    }
                                    catch (Exception ex)
                                    {
                                        objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[3].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                                    }

                                    objRssFeeds.Title = item.ChildNodes[0].InnerText;

                                    if (item.ChildNodes[1].InnerText.Contains("www") || item.ChildNodes[1].InnerText.Contains("http"))
                                    {
                                        try
                                        {
                                            objRssFeeds.Image = item.ChildNodes[1].InnerText;
                                            objRssFeeds.Image = getBetween(objRssFeeds.Image, "src=\"", "\"");
                                            objRssFeeds.Link = item.ChildNodes[1].InnerText;
                                            objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                            if (string.IsNullOrEmpty(objRssFeeds.Link))
                                            {
                                                objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                            objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                            if (string.IsNullOrEmpty(objRssFeeds.Link))
                                            {
                                                objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                        objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                        if (string.IsNullOrEmpty(objRssFeeds.Link))
                                        {
                                            objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                        }
                                    }
                                    objRssFeeds.RssFeedUrl = TextUrl;
                                    objRssFeeds.ProfileId = profileid;
                                    objRssFeeds.ProfileType = profiletype;
                                    objRssFeeds.Status = false;
                                    var ret = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssFeed>(t => t.Link.Equals(objRssFeeds.Link) && t.ProfileId.Equals(profileid) && t.ProfileType.Equals(profiletype));
                                    var task = Task.Run(async () =>
                                    {
                                        return await ret;
                                    });
                                    int count = task.Result.Count;
                                    if (count < 1)
                                    {
                                        _RssFeedRepository.Add<Domain.Socioboard.Models.Mongo.RssFeed>(objRssFeeds);
                                    }

                                }
                                catch (Exception ex)
                                {

                                }
                                if (twtapiHitsCount < twtMaxapiHitsCount)
                                {

                                    string twitterdata = TwitterComposeMessageRss(objRssFeeds.Message, _TwitterAccount.oAuthToken, _TwitterAccount.oAuthSecret, _TwitterAccount.twitterUserId, _TwitterAccount.twitterScreenName, objRssFeeds.strId);
                                    if (!string.IsNullOrEmpty(twitterdata))
                                    {
                                        twtapiHitsCount++;

                                    }
                                }
                                else
                                {
                                    twtapiHitsCount = 0;
                                    return "ok";
                                }

                            }
                            _TwitterAccount.SchedulerUpdate = DateTime.UtcNow;
                            dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);
                        }
                    }
                    //}
                    //else
                    //{
                    //    twtapiHitsCount = 0;
                    //}
                }


                return "ok";
            }
            catch (Exception ex)
            {

                return "invalid url";
            }
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

        public static string FacebookComposeMessageRss(string message, string accessToken, string FbUserId, string title, string link, string rssFeedId)
        {
            string ret = "";
            FacebookClient fb = new FacebookClient();
            MongoRepository rssfeedRepo = new MongoRepository("RssFeed");
            try
            {
                fb.AccessToken = accessToken;
                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                var args = new Dictionary<string, object>();
                args["message"] = message;
                args["link"] = link;
                ret = fb.Post("v2.7/" + FbUserId + "/feed", args).ToString();
                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("strId", rssFeedId);
                var update = Builders<BsonDocument>.Update.Set("Status", true);
                rssfeedRepo.Update<Domain.Socioboard.Models.Mongo.RssFeed>(update, filter);
                Thread.Sleep(1000 * 60 * 10);
                return ret = "Messages Posted Successfully";
            }
            catch (Exception ex)
            {
                if(ex.Message.Contains("Error validating access token: Session has expired on"))
                {
                    Model.DatabaseRepository dbr = new DatabaseRepository();
                    Domain.Socioboard.Models.Facebookaccounts _Facebookaccounts = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == FbUserId).First();
                    _Facebookaccounts.IsActive = false;
                    dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_Facebookaccounts);
                }
                Console.WriteLine(ex.Message);
                apiHitsCount = MaxapiHitsCount;
                return ret = "";
            }
        }

        public static string TwitterComposeMessageRss(string message, string OAuthToken, string OAuthSecret, string profileid, string TwitterScreenName, string rssFeedId)
        {
            string ret = "";
            oAuthTwitter OAuthTwt = new oAuthTwitter(Helper.AppSettings.twitterConsumerKey,Helper.AppSettings.twitterConsumerScreatKey,Helper.AppSettings.twitterRedirectionUrl);
            OAuthTwt.AccessToken = OAuthToken;
            OAuthTwt.AccessTokenSecret = OAuthSecret;
            OAuthTwt.TwitterScreenName = TwitterScreenName;
            OAuthTwt.TwitterUserId = profileid;
            Tweet twt = new Tweet();
            if (message.Length>139)
            {
                message = message.Substring(0, 139); 
            }
            MongoRepository rssfeedRepo = new MongoRepository("RssFeed");
            try
            {
                JArray post = twt.Post_Statuses_Update(OAuthTwt, message);

                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("strId", rssFeedId);
                var update = Builders<BsonDocument>.Update.Set("Status", true);
                rssfeedRepo.Update<Domain.Socioboard.Models.Mongo.RssFeed>(update, filter);
                Thread.Sleep(1000 * 60 * 10);
                return ret = "Messages Posted Successfully";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                twtapiHitsCount = twtMaxapiHitsCount;
                return ret = "";
            }
        }

        public static void updateRssContentFeeds(Domain.Socioboard.Models.Mongo.RssNewsContents _rssNews, string keywords)
        {
            ParseContentFeedUrl(_rssNews.RssFeedUrl, _rssNews.ProfileId, keywords);
        }

        public static string ParseContentFeedUrl(string RssFeedUrl, string ProfileId, string keywords)
        {
            MongoRepository _RssFeedRepository = new MongoRepository("RssNewsContentsFeeds");
            try
            {
                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(RssFeedUrl);
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("item");

                foreach (XmlElement item in abc)
                {
                    Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds objRssFeeds = new Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds();
                    try
                    {
                        objRssFeeds.Id = ObjectId.GenerateNewId();
                        // objRssFeeds.strId = ObjectId.GenerateNewId().ToString();
                        try
                        {
                            objRssFeeds.Message = item.ChildNodes[9].InnerText;
                            objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                            objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);

                        }
                        catch (Exception ex)
                        {
                            try
                            {
                                if (item.ChildNodes[2].InnerText.Contains("www") && item.ChildNodes[2].InnerText.Contains("http"))
                                {
                                    objRssFeeds.Message = item.ChildNodes[1].InnerText;
                                    objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                    objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                }
                                else
                                {
                                    objRssFeeds.Message = item.ChildNodes[2].InnerText;
                                    objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                    objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                                }
                            }
                            catch
                            {
                                objRssFeeds.Message = item.ChildNodes[1].InnerText;
                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "<.*?>", string.Empty).Replace("[&#8230;]", "");
                                objRssFeeds.Message = Regex.Replace(objRssFeeds.Message, "@<[^>]+>|&nbsp;", string.Empty);
                            }
                        }


                        try
                        {
                            objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[4].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                        }
                        catch (Exception ex)
                        {
                            objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[3].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                        }

                        objRssFeeds.Title = item.ChildNodes[0].InnerText;

                        if (item.ChildNodes[1].InnerText.Contains("www") || item.ChildNodes[1].InnerText.Contains("http"))
                        {
                            try
                            {
                                objRssFeeds.Image = item.ChildNodes[1].InnerText;
                                objRssFeeds.Image = getBetween(objRssFeeds.Image, "src=\"", "\"");
                                objRssFeeds.Link = item.ChildNodes[1].InnerText;
                                objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");


                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                            }
                        }
                        else
                        {
                            objRssFeeds.Link = item.ChildNodes[2].InnerText;


                            //  objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                        }
                        if (item.BaseURI.Contains("http://feeds.bbci.co.uk") || item.BaseURI.Contains("http://www.hindustantimes.com"))
                        {
                            objRssFeeds.Image = item.ChildNodes[5].OuterXml;
                            objRssFeeds.Image = getBetween(objRssFeeds.Image, "url=\"", "\"");//media:content url="
                        }



                        objRssFeeds.RssFeedUrl = RssFeedUrl;
                        objRssFeeds.UserId = ProfileId;
                        objRssFeeds.keywords = keywords;


                        var ret = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(t => t.Link == objRssFeeds.Link && t.UserId == ProfileId);
                        var task = Task.Run(async () =>
                        {
                            return await ret;
                        });
                        int count = task.Result.Count;
                        if (count < 1)
                        {
                            _RssFeedRepository.Add(objRssFeeds);
                        }

                    }
                    catch (Exception ex)
                    {

                    }

                }
                return "ok";
            }
            catch (Exception ex)
            {
                return "Invalid Url";
            }
        }

    }
}
