using Api.Socioboard.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;

namespace Api.Socioboard.Repositories
{
    public class RssFeedRepository
    {

        public static string AddRssUrl(string profileId ,string Url, Model.DatabaseRepository dbr)
        {
            string[] profilesList = null;
            if (profileId != null)
            {
                profilesList = profileId.Split(',');
                profileId = profilesList[0];
            }
           
            foreach (var item in profilesList)
            {
                string prid = null;
                if (item.Contains("page_"))
                {
                    prid = item.Substring(5, item.Length - 5);
                }
                else if(item.Contains("tw_"))
                {
                    prid = item.Substring(3, item.Length - 3);
                }
                else
                {
                     prid = item.Substring(3, item.Length - 3);
                }
                
                Domain.Socioboard.Models.RssFeedUrl _RssFeedUrl = dbr.FindSingle<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl.Contains(Url) && t.Keywords == null && t.ProfileId == prid);

                if (_RssFeedUrl != null)
                {
                    //return "null";
                }
                else
                {
                    _RssFeedUrl = new Domain.Socioboard.Models.RssFeedUrl();
                    _RssFeedUrl.rssurl = Url;
                    _RssFeedUrl.ProfileId = prid;
                    _RssFeedUrl.LastUpdate = DateTime.UtcNow;
                    dbr.Add<Domain.Socioboard.Models.RssFeedUrl>(_RssFeedUrl);
                    _RssFeedUrl = dbr.FindSingle<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl.Contains(Url) && t.Keywords == null);
                   
                }
               
            }
            return "success";
        }

        public static string AddRssFeed(string TextUrl, long Userid, string profileId, Domain.Socioboard.Enum.SocialProfileType ProfileType, string profileimageurl, string profilename, string xmldata,Model.DatabaseRepository dbr, Helper.AppSettings _appSettings)
        {
            int UrlAdded = 0;
            string RetMsg = string.Empty;
            MongoRepository _RssRepository = new MongoRepository("Rss", _appSettings);
            Domain.Socioboard.Models.RssFeedUrl rssobj = new Domain.Socioboard.Models.RssFeedUrl();
            rssobj = dbr.FindSingle<Domain.Socioboard.Models.RssFeedUrl>(t => t.ProfileId == profileId && t.rssurl == TextUrl);
            string rt = null;
            if (xmldata != null)
            {
                rt = ParseXMLFeedUrl(TextUrl, ProfileType, profileId, Userid, profilename, profileimageurl, rssobj, _appSettings);
            }
            else
            {
                rt = ParseFeedUrl(TextUrl, ProfileType, profileId, Userid, profilename, profileimageurl, _appSettings);
            }
            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.RssFeedUrl.Equals(TextUrl) && t.ProfileId.Contains(profileId) && t.ProfileType == ProfileType && t.UserId.Equals(Userid));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            int count = task.Result.Count;



            if (count < 1)
            {

                if (rt == "ok")
                {
                    Domain.Socioboard.Models.Mongo.Rss _Rss = new Domain.Socioboard.Models.Mongo.Rss();
                    _Rss.Id = ObjectId.GenerateNewId();
                    _Rss.strId = ObjectId.GenerateNewId().ToString();
                    _Rss.RssFeedUrl = TextUrl;
                    _Rss.ProfileType = ProfileType;
                    _Rss.ProfileId = profileId;
                    _Rss.UserId = Userid;
                    _Rss.ProfileImageUrl = profileimageurl;
                    _Rss.ProfileName = profilename;
                    _Rss.rssFeedUrl = rssobj;
                    _Rss.CreatedOn = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                    _RssRepository.Add(_Rss);
                     UrlAdded++;
                }
                else
                {
                    return "Please Fill Correct Url For Feeds";
                }

            }
            else
            {

            }
            if (UrlAdded == 1)
            {
                RetMsg = "Url for " + UrlAdded.ToString() + " account is added";
            }
            else if (UrlAdded > 1)
            {
                RetMsg = "Url for " + UrlAdded.ToString() + " accounts is added";
            }
            else
            {
                RetMsg = "Url has already added";
            }
            return RetMsg;
        }

        public static string ParseFeedUrl(string TextUrl, Domain.Socioboard.Enum.SocialProfileType profiletype, string profileid, long userId, string profileName, string profileImageUrl, Helper.AppSettings _appSettings)
        {

            MongoRepository _RssFeedRepository = new MongoRepository("RssFeed", _appSettings);
            try
            {

                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(TextUrl);
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("item");
                
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
                                else if(item.ChildNodes[2].InnerText.Contains("http"))
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
                            if(item.ChildNodes[3].Name== "pubDate")
                            {
                                objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[3].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                            }
                            else
                            {
                                objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[4].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                            }
                            
                        }
                        catch (Exception ex)
                        {
                            objRssFeeds.PublishingDate = DateTime.Parse(item.ChildNodes[5].InnerText).ToString("yyyy/MM/dd HH:mm:ss");
                            
                        }

                        objRssFeeds.Title = item.ChildNodes[0].InnerText;

                        if (item.ChildNodes[1].InnerText.Contains("www") || item.ChildNodes[1].InnerText.Contains("http"))
                        {
                            try
                            {
                                //objRssFeeds.Image = item.ChildNodes[1].InnerText;
                               // objRssFeeds.Image = getBetween(objRssFeeds.Image, "src=\"", "\"");
                               if(item.ChildNodes[2].Name=="link")
                                {
                                    objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                }
                                else
                                {
                                    objRssFeeds.Link = item.ChildNodes[1].InnerText;
                                    objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                }
                               
                               
                                if(objRssFeeds.Link=="")
                                {
                                    objRssFeeds.Link = item.ChildNodes[1].InnerText;
                                }
                                
                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Link = item.ChildNodes[2].InnerText;
                                objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                            }
                        }
                        else if(item.ChildNodes[3].InnerText.Contains("www")|| item.ChildNodes[3].InnerText.Contains("https"))
                        {
                            try
                            {
                                objRssFeeds.Message = item.ChildNodes[4].InnerText;
                                objRssFeeds.Message = getBetween(objRssFeeds.Message, "<a href=\"", "\">");
                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Link = "";
                            }
                            try
                            {
                                objRssFeeds.Link = item.ChildNodes[3].InnerText;
                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Link = "";
                            }
                        }
                        else if(item.ChildNodes[2].InnerText.Contains("https"))
                        {
                            try
                            {
                                objRssFeeds.Link = item.ChildNodes[2].InnerText;
                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Link = "";
                            }
                            try
                            {
                                if(item.ChildNodes[7].Name == "description")
                                {
                                    objRssFeeds.Message = item.ChildNodes[7].InnerText;
                                }
                                else
                                {
                                    objRssFeeds.Message = item.ChildNodes[6].InnerText;
                                    //objRssFeeds.Message = getBetween(objRssFeeds.Message, "<a href=\"", "\">");
                                }
                              
                            }
                            catch(Exception ex)
                            {
                                objRssFeeds.Message = "";
                            }
                            try
                            {
                                objRssFeeds.Title = item.ChildNodes[1].InnerText;
                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Message = "";
                            }
                            try
                            {
                                if(item.ChildNodes[8].Name != "media")
                                {
                                    objRssFeeds.Image = item.ChildNodes[8].InnerText;
                                }
                                else
                                {
                                    objRssFeeds.Image = "";
                                }
                               
                            }
                            catch (Exception ex)
                            {
                                objRssFeeds.Message = "";
                            }

                        }
                        else
                        {
                            objRssFeeds.Link = item.ChildNodes[2].InnerText;
                            // objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
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
                return "invalid url";
            }
        }

        public static string ParseXMLFeedUrl(string TextUrl, Domain.Socioboard.Enum.SocialProfileType profiletype, string profileid, long userId, string profileName, string profileImageUrl, Domain.Socioboard.Models.RssFeedUrl rssobj , Helper.AppSettings _appSettings)
        {
           
            MongoRepository _RssFeedRepository = new MongoRepository("RssFeed", _appSettings);

            MongoRepository _RssRepository = new MongoRepository("Rss", _appSettings);
            var rets = _RssRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.RssFeedUrl.Equals(TextUrl) && t.ProfileId.Contains(profileid) && t.ProfileType == profiletype && t.UserId.Equals(userId));
            var tasks = Task.Run(async () =>
            {
                return await rets;
            });
            int counts = tasks.Result.Count;
            if (counts < 1)
            {
                Domain.Socioboard.Models.Mongo.Rss _Rss = new Domain.Socioboard.Models.Mongo.Rss();
                _Rss.Id = ObjectId.GenerateNewId();
                _Rss.strId = ObjectId.GenerateNewId().ToString();
                _Rss.RssFeedUrl = TextUrl;
                _Rss.ProfileType = profiletype;
                _Rss.ProfileId = profileid;
                _Rss.UserId = userId;
                _Rss.ProfileImageUrl = profileImageUrl;
                _Rss.ProfileName = profileName;
                _Rss.rssFeedUrl = rssobj;
                _Rss.CreatedOn = DateTime.UtcNow.ToString("yyyy/MM/dd HH:mm:ss");
                try
                {
                    _RssRepository.Add(_Rss);
                }
                catch (Exception ex)
                {

                }


            }



            try
            {

                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(TextUrl);
                string datevalue = null;
                string urlvalue = null;
                var abc = xmlDoc.DocumentElement.GetElementsByTagName("sitemap");
                var urls = xmlDoc.DocumentElement.GetElementsByTagName("url");

                if (abc.Count!=0)
                {
                   
                    try
                    {
                        foreach (XmlElement siteval in abc)
                        {
                            Domain.Socioboard.Models.Mongo.RssFeed objRssFeeds = new Domain.Socioboard.Models.Mongo.RssFeed();
                            try
                            {
                                urlvalue = siteval.ChildNodes[0].InnerText;
                            }
                            catch (Exception ex)
                            {
                                urlvalue = "";
                            }
                            try
                            {
                                datevalue = siteval.ChildNodes[1].InnerText;
                            }
                            catch (Exception ex)
                            {
                                datevalue = "";
                            }

                            DateTime todate = DateTime.Now;
                            DateTime fromDate = DateTime.Now;
                            fromDate = fromDate.AddYears(-1);
                            fromDate = fromDate.AddMonths(5);
                            DateTime dt = Convert.ToDateTime(datevalue);

                            if (dt > fromDate && dt < todate)
                            {
                                xmlDoc.Load(urlvalue);
                                var sitedatalist = xmlDoc.DocumentElement.GetElementsByTagName("url");
                                foreach (XmlElement item in sitedatalist)
                                {
                                    objRssFeeds.Id = ObjectId.GenerateNewId();
                                    objRssFeeds.strId = ObjectId.GenerateNewId().ToString();
                                    objRssFeeds.ProfileName = profileName;
                                    objRssFeeds.ProfileImageUrl = profileImageUrl;
                                    objRssFeeds.RssFeedUrl = TextUrl;
                                    objRssFeeds.ProfileId = profileid;
                                    objRssFeeds.ProfileType = profiletype;
                                    objRssFeeds.Status = false;
                                    try
                                    {
                                        objRssFeeds.Link = item.ChildNodes[0].InnerText;
                                       // objRssFeeds.Link = getBetween(objRssFeeds.Link, "<a href=\"", "\">");
                                    }
                                    catch(Exception ex)
                                    {
                                        objRssFeeds.Link = "";
                                    }
                                   

                                    objRssFeeds.PublishingDate = item.ChildNodes[1].InnerText;

                                    var ret = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssFeed>(t => t.Link.Equals(objRssFeeds.Link) && t.ProfileId.Equals(profileid) && t.ProfileType.Equals(profiletype));
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
                            }
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
                else
                {
                    

                    //DateTime todate = DateTime.Now;
                    //DateTime fromDate = DateTime.Now;
                    //fromDate = fromDate.AddYears(-1);
                    //fromDate = fromDate.AddMonths(5);
                    //DateTime dt = Convert.ToDateTime(datevalue);

                    //if (dt > fromDate && dt < todate)
                    //{
                    xmlDoc.Load(TextUrl);
                        var sitedatalist = xmlDoc.DocumentElement.GetElementsByTagName("url");
                        try
                        {
                            foreach (XmlElement item in sitedatalist)
                            {
                                Domain.Socioboard.Models.Mongo.RssFeed objRssFeeds = new Domain.Socioboard.Models.Mongo.RssFeed();

                                objRssFeeds.Id = ObjectId.GenerateNewId();
                                objRssFeeds.strId = ObjectId.GenerateNewId().ToString();
                                objRssFeeds.ProfileName = profileName;
                                objRssFeeds.ProfileImageUrl = profileImageUrl;
                                objRssFeeds.RssFeedUrl = TextUrl;
                                objRssFeeds.ProfileId = profileid;
                                objRssFeeds.ProfileType = profiletype;
                                objRssFeeds.Status = false;
                                try
                                {
                                    objRssFeeds.Link = item.ChildNodes[0].InnerText;
                                objRssFeeds.Link= objRssFeeds.Link.Replace("\r", "").Replace("\n","");
                                }
                                catch(Exception ex)
                                {

                                }
                                try
                                {
                                    objRssFeeds.PublishingDate = item.ChildNodes[1].InnerText;
                                }
                                catch(Exception ex) { }
                                

                                var ret = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssFeed>(t => t.Link.Equals(objRssFeeds.Link) && t.ProfileId.Equals(profileid) && t.ProfileType.Equals(profiletype));
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
                        }
                        catch(Exception ex)
                        {

                        }
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

        public static List<Domain.Socioboard.Models.Mongo.Rss> GetRssDataByUser(long userId, long groupId, Helper.AppSettings _appSettings, DatabaseRepository dbr)
        {
            string[] profileids = null;
            MongoRepository _RssRepository = new MongoRepository("Rss", _appSettings);
            List<Domain.Socioboard.Models.Mongo.Rss> lstRss = new List<Domain.Socioboard.Models.Mongo.Rss>();
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => profileids.Contains(t.ProfileId));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            return lstRss = task.Result.ToList();
        }

        public static List<Domain.Socioboard.Models.Mongo.RssFeed> GetPostedRssDataByUser(long userId, long groupId, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {
            string[] profileids = null;
            MongoRepository _RssRepository = new MongoRepository("RssFeed", _appSettings);
            List<Domain.Socioboard.Models.Mongo.RssFeed> lstRss = new List<Domain.Socioboard.Models.Mongo.RssFeed>();
            List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.groupId == groupId).ToList();
            profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.RssFeed>(t => profileids.Contains(t.ProfileId) && t.Status == true);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
             lstRss = task.Result.ToList();
            lstRss.OrderByDescending(t => t.PublishingDate);
                return lstRss.ToList();

        }

        public static string PostRssfeed(string profileId, string Url, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr, Helper.Cache _redisCache)
        {
            string ret = "";
            string[] lstProfileIds = null;
            if (profileId != null)
            {
                lstProfileIds = profileId.Split(',');
                profileId = lstProfileIds[0];
            }
          
            foreach (var itemPrf in lstProfileIds)
            {
                string prId = itemPrf.Substring(5, itemPrf.Length - 5);
                MongoRepository _RssFeedRepository = new MongoRepository("RssFeed", _appSettings);
                List<Domain.Socioboard.Models.Mongo.RssFeed> objrssdata = new List<Domain.Socioboard.Models.Mongo.RssFeed>();
                var rt = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssFeed>(t => t.ProfileId.Equals(prId) && t.Status == false);
                var task = Task.Run(async () =>
                {
                    return await rt;
                });
                IList<Domain.Socioboard.Models.Mongo.RssFeed> _objrssdata = task.Result;
                objrssdata = _objrssdata.ToList();
                foreach (var item in objrssdata)
                {
                    if (_objrssdata.First().ProfileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || _objrssdata.First().ProfileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)
                    {
                        try
                        {
                            Domain.Socioboard.Models.Facebookaccounts _Facebookaccounts = Repositories.FacebookRepository.getFacebookAccount(item.ProfileId, _redisCache, dbr);
                            ret = Helper.FacebookHelper.FacebookComposeMessageRss(item.Message, _Facebookaccounts.AccessToken, _Facebookaccounts.FbUserId, item.Title, item.Link, item.strId, _appSettings);

                        }
                        catch (Exception ex)
                        {
                            return "";
                        }
                        Thread.Sleep(600000);
                    }
                    else if (_objrssdata.First().ProfileType == Domain.Socioboard.Enum.SocialProfileType.Twitter)
                    {
                        try
                        {
                            string message = "";
                            string UrlShortendata = GetShortenUrl(item.Link, _appSettings);
                            string shortenUrl = string.Empty;
                            try
                            {
                                JObject JData = JObject.Parse(UrlShortendata);
                                if (JData["status_txt"].ToString() == "OK")
                                    shortenUrl = JData["data"]["url"].ToString();
                            }
                            catch (Exception ex)
                            {

                            }

                            if (item.Message.Length > 115)
                            {
                                message = item.Message.Substring(0, 115);
                            }
                            else
                            {
                                message = item.Message;
                            }
                            message += " " + shortenUrl;
                            Domain.Socioboard.Models.TwitterAccount _TwitterAccount = Repositories.TwitterRepository.getTwitterAccount(item.ProfileId, _redisCache, dbr);
                            ret = Helper.TwitterHelper.TwitterComposeMessageRss(message, _TwitterAccount.oAuthToken, _TwitterAccount.oAuthSecret, _TwitterAccount.twitterUserId, _TwitterAccount.twitterScreenName, item.strId, _appSettings);

                        }
                        catch (Exception ex)
                        {
                            return "";
                        }
                        Thread.Sleep(600000);
                    }


                }
                return ret;
            }
            return ret;
        }

        public static string EditFeedUrl(string NewFeedUrl, string OldFeedUrl, string RssId, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {

            Domain.Socioboard.Models.RssFeedUrl _RssFeedUrl = new Domain.Socioboard.Models.RssFeedUrl();
            _RssFeedUrl = dbr.Find<Domain.Socioboard.Models.RssFeedUrl>(t=>t.rssurl.Contains(OldFeedUrl)).FirstOrDefault();
            _RssFeedUrl.rssurl = NewFeedUrl;
            dbr.Update<Domain.Socioboard.Models.RssFeedUrl>(_RssFeedUrl);
            _RssFeedUrl = dbr.FindSingle<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl.Contains(NewFeedUrl));
            try
            {
                MongoRepository _RssRepository = new MongoRepository("Rss", _appSettings);
                var builders = Builders<BsonDocument>.Filter;
                FilterDefinition<BsonDocument> filter = builders.Eq("strId", RssId);
                var update = Builders<BsonDocument>.Update.Set("RssFeedUrl", NewFeedUrl).Set("rssFeedUrl", _RssFeedUrl);
                _RssRepository.Update<Domain.Socioboard.Models.Mongo.Rss>(update, filter);
                return "Success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }

        public static string DeleteFeedUrl(string RssId,Model.DatabaseRepository dbr,Helper.AppSettings _appSettings)
        {
           
            try
            {
                MongoRepository _RssRepository = new MongoRepository("Rss", _appSettings);
                List<Domain.Socioboard.Models.Mongo.Rss> lstRss = new List<Domain.Socioboard.Models.Mongo.Rss>();
                var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.Rss>(t => t.strId == RssId);
                var task = Task.Run(async () =>
                {
                    return await ret;
                });
                lstRss = task.Result.ToList();

                Domain.Socioboard.Models.RssFeedUrl feedurl = dbr.FindSingle<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl.Equals(lstRss.First().RssFeedUrl) && t.ProfileId == lstRss.First().ProfileId );
                if (feedurl != null)
                {
                    dbr.Delete<Domain.Socioboard.Models.RssFeedUrl>(feedurl);
                    
                }

                var builders = Builders<Domain.Socioboard.Models.Mongo.Rss>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.Rss> filter = builders.Eq("strId", RssId);
                
                _RssRepository.Delete<Domain.Socioboard.Models.Mongo.Rss>(filter);

               
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }
        public static string GetShortenUrl(string Url, Helper.AppSettings _appSettings)
        {
            try
            {
                string url = "https://api-ssl.bitly.com/v3/shorten?access_token=" + _appSettings.bitlyaccesstoken + "&longUrl=" + Url + "&domain=bit.ly&format=json";
                HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(url);
                httpRequest.Method = "GET";
                httpRequest.ContentType = "application/x-www-form-urlencoded";
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
                return Url;
            }
        }
    }
}
