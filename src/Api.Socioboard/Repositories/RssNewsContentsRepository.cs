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

namespace Api.Socioboard.Repositories
{
    public class RssNewsContentsRepository
    {
        public static string AddRssContentsUrl(string keywords, long userId, Helper.AppSettings _appSettings)
        {
            MongoRepository _rssNewsContents = new MongoRepository("RssNewsContents", _appSettings);

            List<string> list = new List<string>();
            list = findUrl(keywords).ToList();

            Domain.Socioboard.Models.Mongo.RssNewsContents _rssnews = new Domain.Socioboard.Models.Mongo.RssNewsContents();

            foreach (var urlValue in list)
            {
                if (urlValue != null)
                {
                    string rt = ParseFeedUrl(urlValue.ToString(), keywords, userId.ToString(), _appSettings);
                    var ret = _rssNewsContents.Find<Domain.Socioboard.Models.Mongo.RssNewsContents>(t => t.RssFeedUrl.Equals(urlValue) && t.ProfileId.Contains(userId.ToString()));
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        _rssnews.Id = ObjectId.GenerateNewId();
                        //_rssnews.strId = ObjectId.GenerateNewId();
                        _rssnews.ProfileId = userId.ToString();
                        _rssnews.RssFeedUrl = urlValue.ToString();
                        _rssnews.LastUpdate = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                        _rssNewsContents.Add(_rssnews);
                    }
                    else
                    {
                        return "please fill correct url";
                    }
                }

            }
            return "ok";
        }

        public static string[] findUrl(string keywords)
        {
            Domain.Socioboard.Helpers.UrlRSSfeedsNews obj_reqest = new Domain.Socioboard.Helpers.UrlRSSfeedsNews();
            //Globalrequest obj_reqest = new Globalrequest();
            string TOI = "http://timesofindia.indiatimes.com/rss.cms";
            string BBC = "http://www.bbc.com/news/10628494";
            string hinduTimes = "http://www.hindustantimes.com/rss";
            // string TheHindu = "http://www.thehindubusinessline.com/navigation/?type=rss";
            string Baskar = "http://www.bhaskar.com/rss/";


            // string keyword = Console.ReadLine();

            string responce_TOI = obj_reqest.getHtmlfromUrl(new Uri(TOI));
            string responce_BBC = obj_reqest.getHtmlfromUrl(new Uri(BBC));
            string responce_HinduTime = obj_reqest.getHtmlfromUrl(new Uri(hinduTimes));
            string responce_Baskar = obj_reqest.getHtmlfromUrl(new Uri(Baskar));
            string[] url = new string[4];

            List<string> lstkeyword = null;

            //List<string> listUrl = null;
            List<string> list = new List<string>();

            if (keywords != null)
            {
                lstkeyword = keywords.Split(',').ToList();
                keywords = lstkeyword[0];
            }
            else
            {
                //return "profileId required";
            }

            foreach (var keywordslist in lstkeyword)
            {
                if (responce_BBC.Contains(keywords))
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
                                if (item.Contains(keywords))
                                {
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
                if (responce_TOI.Contains(keywords))
                {
                    try
                    {
                        string data = obj_reqest.getBetween(responce_TOI, "<h3 id=\"cross-browser\">", "<h3 id=\"cross-browser\">");
                        string[] report = Regex.Split(data, "id=\"");
                        foreach (string item in report)
                        {
                            try
                            {
                                if ((item.Contains(keywords)) && (!item.Contains(">More</a>")))
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
                if (responce_HinduTime.Contains(keywords))
                {
                    try
                    {
                        string data = obj_reqest.getBetween(responce_HinduTime, "<div class=\"rss_feed_list\">", "<div class=\"tearms_of_use\">");
                        string[] report = Regex.Split(data, "<li><div class=");
                        foreach (string item in report)
                        {
                            try
                            {
                                if (item.Contains(keywords))
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
                if (responce_Baskar.Contains(keywords))
                {
                    try
                    {
                        string data = obj_reqest.getBetween(responce_Baskar, "<th>RSS Path</th>", "<div class=\"rss-right\">");
                        string[] report = Regex.Split(data, "<tr>");
                        foreach (string item in report)
                        {
                            try
                            {
                                if (item.Contains(keywords))
                                {
                                    string[] value = Regex.Split(item, "<td>");
                                    url[3] = obj_reqest.getBetween(value[2], "href=\"", "\"");
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

                list.Add(url.ToString());
            }

            return url;
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
                        if(item.BaseURI.Contains("http://feeds.bbci.co.uk") || item.BaseURI.Contains("http://www.hindustantimes.com"))
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

        public static List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> GetRssNewsFeeds(string userId, string keywords, Helper.AppSettings _appSettings)
        {
            string[] profileids = null;
            MongoRepository _RssRepository = new MongoRepository("RssNewsContentsFeeds", _appSettings);
            List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> lstRss = new List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>();
            //List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileOwnerId == userId).ToList();
            //profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(t=>t.keywords==keywords);//UserId
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            return lstRss = task.Result.ToList();
        }



        public static List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> GetRssNewsPostedFeeds(string userId,  Helper.AppSettings _appSettings)
        {
            string[] profileids = null;
            MongoRepository _RssRepository = new MongoRepository("RssNewsContentsFeeds", _appSettings);
            List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds> lstRss = new List<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>();
            //List<Domain.Socioboard.Models.Groupprofiles> lstGroupprofiles = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileOwnerId == userId).ToList();
            //profileids = lstGroupprofiles.Select(t => t.profileId).ToArray();
            var ret = _RssRepository.Find<Domain.Socioboard.Models.Mongo.RssNewsContentsFeeds>(t => t.UserId == userId);//UserId
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            return lstRss = task.Result.ToList();
        }


    }
}
