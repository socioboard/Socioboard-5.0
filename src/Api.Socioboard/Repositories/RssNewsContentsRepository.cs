using Api.Socioboard.Model;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using Domain.Socioboard.Models.Mongo;
using Socioboard.Twitter.App.Core;
using Socioboard.Google.Custom;
using Api.Socioboard.Helper;

namespace Api.Socioboard.Repositories
{
    public class RssNewsContentsRepository
    {
        public static string AddRssContentsUrl(string keywords, string userId, Helper.AppSettings _appSettings, Model.DatabaseRepository dbr)
        {

            var _rssNewsContents = new MongoRepository("RssNewsContents", _appSettings);

            var list = new List<string>();
            list = findUrl(keywords).ToList();

            var _rssnews = new RssNewsContents();

            Domain.Socioboard.Models.RssFeedUrl _RssContentFeeds = new Domain.Socioboard.Models.RssFeedUrl();


            foreach (var urlValue in list)
            {
                if (urlValue != null)
                {
                    string rt = ParseFeedUrl(urlValue.ToString(), keywords, userId, _appSettings);

                    _RssContentFeeds = dbr.FindSingle<Domain.Socioboard.Models.RssFeedUrl>(t => t.rssurl.Contains(urlValue) && t.Keywords != null);

                    if (_RssContentFeeds == null)
                    {
                        _RssContentFeeds = new Domain.Socioboard.Models.RssFeedUrl
                        {
                            rssurl = urlValue,
                            LastUpdate = DateTime.UtcNow,
                            Keywords = keywords
                        };

                        try
                        {
                            dbr.Add(_RssContentFeeds);
                        }

                        catch (Exception error)
                        {
                            // ignored
                        }
                    }

                    var ret = _rssNewsContents.Find<RssNewsContents>(t => t.RssFeedUrl.Equals(urlValue) && t.ProfileId.Contains(userId));
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });

                    int count = task.Result.Count;

                    if (count < 1)
                    {
                        _rssnews.Id = ObjectId.GenerateNewId();
                        _rssnews.ProfileId = userId;
                        _rssnews.RssFeedUrl = urlValue;
                        _rssnews.LastUpdate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        _rssNewsContents.Add(_rssnews);
                    }
                    else
                    {
                        return "Data already added";
                    }
                }
            }
            return "added successfully";
        }

        public static List<string> findUrl(string keywords)
        {
            Domain.Socioboard.Helpers.UrlRSSfeedsNews obj_reqest = new Domain.Socioboard.Helpers.UrlRSSfeedsNews();
            //Globalrequest obj_reqest = new Globalrequest();
            string TOI = "http://timesofindia.indiatimes.com/rss.cms";
            string BBC = "http://www.bbc.com/news/10628494";
            string hinduTimes = "http://www.hindustantimes.com/rss";
            // string TheHindu = "http://www.thehindubusinessline.com/navigation/?type=rss";
            //string Baskar = "http://www.bhaskar.com/rss/";


            // string keyword = Console.ReadLine();

            string responce_TOI = obj_reqest.getHtmlfromUrl(new Uri(TOI));
            string responce_BBC = obj_reqest.getHtmlfromUrl(new Uri(BBC));
            string responce_HinduTime = obj_reqest.getHtmlfromUrl(new Uri(hinduTimes));
            //string responce_Baskar = obj_reqest.getHtmlfromUrl(new Uri(Baskar));
            string[] url = new string[4];

            //List<string> url = null;
            List<string> lstkeyword = null;

            //List<string> listUrl = null;
            List<string> list = new List<string>();

            if (keywords != null)
            {
                lstkeyword = keywords.Split(',').ToList();
                // keywords = lstkeyword[0];
            }
            else
            {
                //return "profileId required";
            }

            foreach (var keywordslist in lstkeyword)
            {

                if (responce_BBC.Contains(keywordslist))
                {
                    try
                    {
                        string data = obj_reqest.getBetween(responce_BBC, "<strong>Popular BBC News Feeds</strong>", "class=\"media-landscape has");
                        //string data = Globalrequest.getBetween(responce_BBC, "<strong>Popular BBC News Feeds</strong>", "class=\"media-landscape has");
                        string[] report = Regex.Split(data, "<p><a");
                        foreach (string item in report)
                        {
                            try
                            {
                                if (item.Contains(keywordslist))
                                {
                                    //url[0] = null;
                                    url[0] = obj_reqest.getBetween(item, "href=\"", "\"");
                                    break;
                                }
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
                if (responce_TOI.Contains(keywordslist))
                {
                    try
                    {
                        string data = obj_reqest.getBetween(responce_TOI, "<h3 id=\"cross-browser\">", "<h3 id=\"cross-browser\">");
                        string[] report = Regex.Split(data, "id=\"");
                        foreach (string item in report)
                        {
                            try
                            {
                                if ((item.Contains(keywordslist)) && (!item.Contains(">More</a>")))
                                {
                                    url[1] = obj_reqest.getBetween(item, "url=", "\">");
                                    break;
                                }
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
                if (responce_HinduTime.Contains(keywordslist))
                {
                    try
                    {
                        string data = obj_reqest.getBetween(responce_HinduTime, "<div class=\"rss_feed_list\">", "<div class=\"tearms_of_use\">");
                        string[] report = Regex.Split(data, "<li><div class=");
                        foreach (string item in report)
                        {
                            try
                            {
                                if (item.Contains(keywordslist))
                                {
                                    url[2] = obj_reqest.getBetween(item, "href=\"", "\"");
                                    break;
                                }
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


                foreach (var itemurl in url)
                {
                    if (list.Contains(itemurl))
                    {

                    }
                    else
                    {
                        list.Add(itemurl);
                    }
                }


            }

            return list;
        }


        public static string ParseFeedUrl(string TextUrl, string keywords, string userId, Helper.AppSettings _appSettings)
        {

            MongoRepository _RssFeedRepository = new MongoRepository("RssNewsContentsFeeds", _appSettings);
            try
            {

                XmlDocument xmlDoc = new XmlDocument(); // Create an XML document object
                xmlDoc.Load(TextUrl);
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



                        objRssFeeds.RssFeedUrl = TextUrl;
                        objRssFeeds.UserId = userId;
                        objRssFeeds.keywords = keywords;


                        var ret = _RssFeedRepository.Find<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(t => t.Link == objRssFeeds.Link && t.UserId == userId);
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

        public static List<RssNewsContentsFeeds> GetRssNewsFeeds(string userId, string keywords, AppSettings _appSettings)
        {
            string[] profileids = null;
            var _RssRepository = new MongoRepository("RssNewsContentsFeeds", _appSettings);

            var ret = _RssRepository.Find<RssNewsContentsFeeds>(t => t.keywords == keywords && t.UserId == userId.ToString());
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            return task.Result.ToList();
        }


        public static List<RssNewsContentsFeeds> GetRssNewsFeeds(string userId, string keywords, AppSettings _appSettings, int skip, int count)
        {
            string[] profileids = null;
            var _RssRepository = new MongoRepository("RssNewsContentsFeeds", _appSettings);

            var ret = _RssRepository.FindWithRange<RssNewsContentsFeeds>(t => t.keywords == keywords && t.UserId == userId.ToString(), skip, count);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            return task.Result.ToList();
        }



        public static List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> GetRssNewsPostedFeeds(string userId, Helper.Cache _redisCache, Helper.AppSettings _appSettings)
        {
            string[] profileids = null;
            //MongoRepository _RssRepository = new MongoRepository("RssNewsContentsFeeds", _appSettings);
            List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> _RssRepository = _redisCache.Get<List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>>(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + userId);
            if (_RssRepository != null)
            {
                return _RssRepository;
            }
            else
            {
                MongoRepository mongorepo = new MongoRepository("RssNewsContentsFeeds", _appSettings);
                // MongoRepository mongorepo = new MongoRepository("MongoTwitterFeed", settings);
                var builder = Builders<RssNewsContentsFeeds>.Sort;
                var sort = builder.Descending(t => t.PublishingDate);
                var result = mongorepo.FindWithRange<RssNewsContentsFeeds>(t => t.UserId.Equals(userId), sort, 0, 200);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<RssNewsContentsFeeds> lstRss = task.Result;

                if (lstRss != null)
                {
                    _redisCache.Set(Domain.Socioboard.Consatants.SocioboardConsts.CacheTwitterRecent100Feeds + userId, lstRss.ToList());

                    return lstRss.ToList();
                }

                return null;
            }

            // List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> lstRss = new List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>();
            //List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileOwnerId == userId).ToList();
            //profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            //var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(t => t.UserId == userId);//UserId
            //var task = Task.Run(async () =>
            //{
            //    return await ret;
            //});
            // return lstRss = task.Result.ToList();
        }


        //public static string addtwitterContentfeedsdata(string keyword, string userId, Helper.AppSettings _appSettings )
        //{
        //    //MongoRepository mongorepo = new MongoRepository("ContentFeeds", _appSettings);
        //    MongoRepository mongorepo = new MongoRepository("RssNewsContentsFeeds", _appSettings);
        //    bool output = false;

        //    string timeline = TwitterHashTag.TwitterBoardHashTagSearch(keyword, null);
        //    int i = 0;
        //    if (!string.IsNullOrEmpty(timeline) && !timeline.Equals("[]"))
        //    {
        //        foreach (JObject obj in JArray.Parse(timeline))
        //        {
        //            RssNewsContentsFeeds contentFeedsDet = new RssNewsContentsFeeds();
        //            // Domain.Socioboard.Models.Mongo.ContentFeeds contentFeedsDet = new Domain.Socioboard.Models.Mongo.ContentFeeds();
        //            contentFeedsDet.Id = ObjectId.GenerateNewId();

        //            i++;
        //            try
        //            {
        //                contentFeedsDet.Link = JArray.Parse(obj["entities"]["expanded_url"].ToString())[0]["url"].ToString();
        //                //contentFeedsDet = JArray.Parse(obj["entities"]["expanded_url"].ToString())[0]["url"].ToString();
        //            }
        //            catch
        //            {
        //                try
        //                {
        //                    //contentFeedsDet.Link = JArray.Parse(obj["entities"]["urls"].ToString())[0]["expanded_url"].ToString();
        //                    contentFeedsDet.Link = JArray.Parse(obj["entities"]["urls"].ToString())[0]["expanded_url"].ToString();
        //                }
        //                catch (Exception e)
        //                {

        //                }
        //            }
        //            try
        //            {
        //                //contentFeedsDet.Image = JArray.Parse(obj["extended_entities"]["media"].ToString())[0]["media_url"].ToString();
        //                contentFeedsDet.Image = JArray.Parse(obj["extended_entities"]["media"].ToString())[0]["media_url"].ToString();
        //            }
        //            catch
        //            {
        //                try
        //                {
        //                    contentFeedsDet.Image = JArray.Parse(obj["entities"]["media"].ToString())[0]["media_url"].ToString();
        //                }
        //                catch (Exception e)
        //                {

        //                }
        //            }

        //            try
        //            {
        //                contentFeedsDet.Title = obj["text"].ToString();
        //                //contentFeedsDet.Title = obj["text"].ToString();
        //            }
        //            catch (Exception e)
        //            {

        //            }

        //            try
        //            {
        //                string Const_TwitterDateTemplate = "ddd MMM dd HH:mm:ss +ffff yyyy";
        //                contentFeedsDet.PublishingDate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact((string)obj["created_at"], Const_TwitterDateTemplate, new System.Globalization.CultureInfo("en-US"))).ToString();
        //                //contentFeedsDet.CreatedDate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact((string)obj["created_at"], Const_TwitterDateTemplate, new System.Globalization.CultureInfo("en-US")));
        //            }
        //            catch (Exception e)
        //            {

        //            }
        //            contentFeedsDet.UserId = userId;
        //            contentFeedsDet.keywords = keyword;
        //            // var ret = mongorepo.Find<RssNewsContentsFeeds>(t => t.FeedId == contentFeedsDet.FeedId);

        //            var ret = mongorepo.Find<RssNewsContentsFeeds>(t => t.UserId == userId && t.Image == contentFeedsDet.Image);
        //            var task = Task.Run(async () =>
        //            {
        //                return await ret;
        //            });
        //            int count = task.Result.Count;
        //            if (count < 1)
        //            {
        //                try
        //                {
        //                    //mongorepo.Add<RssNewsContentsFeeds>(contentFeedsDet);ContentFeeds
        //                    mongorepo.Add<RssNewsContentsFeeds>(contentFeedsDet);
        //                }
        //                catch (Exception e) { }

        //            }
        //            else
        //            {
        //                //return "already data present";
        //            }
        //        }
        //        return "data successfully added";
        //    }
        //    output = true;
        //    return output.ToString();
        //}

        public static bool addGplusContentfeedsdata(string keywords, string userId, Helper.AppSettings _appSettings)
        {
            MongoRepository mongorepo = new MongoRepository("RssNewsContentsFeeds", _appSettings);

            bool output = false;
            try
            {
                var discoveryResponse = GplusDiscoverySearchHelper.GooglePlus(keywords, _appSettings.GoogleApiKeyForRssFeed);

                JObject GplusActivities = JObject.Parse(discoveryResponse);

                foreach (JObject obj in JArray.Parse(GplusActivities["items"].ToString()))
                {
                    RssNewsContentsFeeds contentGFeedsDet = new RssNewsContentsFeeds();
                    contentGFeedsDet.Id = ObjectId.GenerateNewId();

                    try
                    {
                        foreach (JObject att in JArray.Parse(obj["object"]["attachments"].ToString()))
                        {
                            contentGFeedsDet.Image = att["fullImage"]["url"].ToString();

                            contentGFeedsDet.Link = att["url"].ToString();

                            contentGFeedsDet.Title = att["displayName"].ToString();
                        }
                    }
                    catch { }
                    try
                    {
                        contentGFeedsDet.PublishingDate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.Parse(obj["published"].ToString())).ToString();
                    }
                    catch { }


                    contentGFeedsDet.UserId = userId;
                    contentGFeedsDet.keywords = keywords;
                    var ret = mongorepo.Find<RssNewsContentsFeeds>(t => t.Title == contentGFeedsDet.Title);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        try
                        {
                            mongorepo.Add(contentGFeedsDet);
                            output = true;
                        }
                        catch { }
                    }


                }
                return output;
            }
            catch { }

            return output;

        }


        public static string DeleteContentfeedsRepo(string feedId, Helper.AppSettings _appSettings)
        {
            try
            {
                MongoRepository _ContentFeedsRepo = new MongoRepository("RssNewsContentsFeeds", _appSettings);
                var builders = Builders<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>.Filter;
                FilterDefinition<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> filter = builders.Eq("Link", feedId);
                _ContentFeedsRepo.Delete<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(filter);
                return "success";
            }
            catch (Exception ex)
            {
                return "Error";
            }
        }


    }
}
