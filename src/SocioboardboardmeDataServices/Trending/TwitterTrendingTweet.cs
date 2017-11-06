using Domain.Socioboard.Helpers;
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json.Linq;
using Socioboard.Google.Custom;
using Socioboard.Instagram.Custom;
using Socioboard.Twitter.App.Core;
using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Trending
{
    public class TwitterTrendingTweet
    {
        public void GetLatestTrendsFromTwiter()
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
                            string temptrend = string.Empty;
                            string trend = getBetween(item, "\"", "\\\"").Replace("&#39;", "'");
                            trend = Regex.Replace(trend, @"\\u[\d\w]{4}", String.Empty);
                            trend = trend.Replace("#", "");
                            if(!string.IsNullOrEmpty(trend)&& !trend.Contains("_")&& !trend.Contains("__"))
                            {
                                if (trend.ToLower().Contains(" "))
                                {
                                    temptrend = trend.Replace(" ", "_");
                                }
                                else if(trend.ToLower().Contains("/"))
                                {
                                    temptrend = trend.Replace("/", "_");
                                }
                                else if(trend.ToLower().Contains("'\'"))
                                {
                                    temptrend = trend.Replace("'\'", "_");
                                }
                                else
                                {
                                    temptrend = trend.ToLower();
                                }
                                //Trendingkeyword _Trendingkeyword = new Trendingkeyword();
                                //_Trendingkeyword.Id = ObjectId.GenerateNewId();
                                //_Trendingkeyword.strId = ObjectId.GenerateNewId().ToString();
                                //_Trendingkeyword.keyword = trend;
                                //_Trendingkeyword.TrendingType = Domain.Socioboard.Enum.TrendingType.twitter;
                                //_Trendingkeyword.trendingdate= SBHelper.ConvertToUnixTimestamp(DateTime.UtcNow);
                                //MongoRepository mongorepo = new MongoRepository("Trendingkeyword");
                                //var ret=mongorepo.Find<Trendingkeyword>(t => t.keyword == trend && t.TrendingType==Domain.Socioboard.Enum.TrendingType.twitter);
                                //var task = Task.Run(async () =>
                                //{
                                //    return await ret;
                                //});
                                //int count = task.Result.Count;
                                //if(count<1)
                                //{
                                //    mongorepo.Add<Trendingkeyword>(_Trendingkeyword);
                                //    AddTwittertrendingHashTagFeeds(trend, _Trendingkeyword.strId, "");
                                //}
                                DatabaseRepository dbr = new DatabaseRepository();
                                List<Domain.Socioboard.Models.MongoBoards> boards = new List<Domain.Socioboard.Models.MongoBoards>();
                                try
                                {
                                    boards = dbr.Find<Domain.Socioboard.Models.MongoBoards>(t => t.boardName.Equals(trend.ToLower()) && t.isActive == Domain.Socioboard.Enum.boardStatus.active).ToList();
                                    string Bid = string.Empty;
                                    if (boards == null || boards.Count() == 0)
                                    {
                                        //Bid = boards.First().boardId;
                                        Domain.Socioboard.Models.MongoBoards board = new Domain.Socioboard.Models.MongoBoards();
                                        board.TempboardName = temptrend.ToLower();
                                        board.isActive = Domain.Socioboard.Enum.boardStatus.active;
                                        board.boardName = trend.ToLower();
                                        board.trendingtype = Domain.Socioboard.Enum.TrendingType.twitter;
                                        board.createDate = DateTime.UtcNow;
                                        board.boardId = Guid.NewGuid().ToString();
                                        board.twitterHashTag = AddTwitterHashTag(trend, board.boardId);
                                        board.instagramHashTag = AddInstagramHashTag(trend, board.boardId);
                                        board.gplusHashTag = AddGplusHashTag(trend, board.boardId);
                                        dbr.Add<Domain.Socioboard.Models.MongoBoards>(board);
                                        string boardcreation = getHtmlfromUrl("https://api.socioboard.com/api/BoardMe/AddTOSiteMap?boardName=" + board.boardName);
                                        if (boardcreation.Contains("true"))
                                        {
                                            Console.WriteLine("created new sitemap for twitter trending keyword" + boardcreation);
                                        }

                                        Console.WriteLine("created new bord for twitter trending keyword" + board.boardName);
                                    }
                                    else
                                    {
                                        Bid = boards.First().boardId;
                                        Domain.Socioboard.Models.MongoBoards board = dbr.Single<Domain.Socioboard.Models.MongoBoards>(t => t.boardId == Bid);
                                        // board.TempboardName = temptrend;
                                        board.isActive = Domain.Socioboard.Enum.boardStatus.active;
                                        board.createDate = DateTime.UtcNow;
                                        //board.boardId = board.boardId;
                                        //board.facebookHashTag = AddFacebookHashTag(trds[0], trds[1], board.boardId, ref HttpHelper, ref facebookUser);
                                        //board.twitterHashTag = AddTwitterHashTag(trend, board.boardId);
                                        //board.instagramHashTag = AddInstagramHashTag(trend, board.boardId);
                                        //board.gplusHashTag = AddGplusHashTag(trend, board.boardId);
                                        dbr.Update<Domain.Socioboard.Models.MongoBoards>(board);
                                        string boardcreation = getHtmlfromUrl("https://api.socioboard.com/api/BoardMe/AddTOSiteMap?boardName=" + board.boardName);
                                        if (boardcreation.Contains("true"))
                                        {
                                            Console.WriteLine("created new sitemap for twitter trending keyword" + boardcreation);
                                        }

                                        Console.WriteLine("created new bord for twitter trending keyword" + board.boardName);
                                    }
                                }

                                catch (Exception e)
                                {
                                }
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
            catch (Exception ex)
            {

            }
        }


        public string AddGplusHashTag(string hashTag, string boardId)
        {
            MongoBoardGplusHashTag bgpacc = new MongoBoardGplusHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Aboutme = string.Empty, Boardid = boardId, Circledbycount = string.Empty, Coverphotourl = string.Empty, Displayname = hashTag.ToLower(), Entrydate = DateTime.UtcNow.ToString(), Nickname = hashTag, Pageid = "tag", Pageurl = string.Empty, Plusonecount = string.Empty, Profileimageurl = string.Empty, Tagline = string.Empty };
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusHashTag");
            var ret = boardrepo.Find<MongoBoardGplusHashTag>(t => t.Displayname.Equals(hashTag.ToLower()) && t.Pageid.Equals("tag"));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<MongoBoardGplusHashTag> objgplusPagelist = task.Result.ToList();
            if (objgplusPagelist.Count() > 0)
            {
                return objgplusPagelist.First().strId.ToString();
            }
            boardrepo.Add<MongoBoardGplusHashTag>(bgpacc);
            new Thread(delegate ()
            {
                AddBoardGplusTagFeeds(hashTag, bgpacc.strId.ToString());
            }).Start();
            return bgpacc.strId.ToString();
        }


        public bool AddBoardGplusTagFeeds(string GplusTagId, string BoardId)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusFeeds");
            bool output = false;
            try
            {
                JObject RecentActivities = JObject.Parse(GplusTagSearch.GooglePlusgetUserRecentActivitiesByHashtag(GplusTagId));
                foreach (JObject obj in RecentActivities["items"])
                {
                    MongoBoardGplusFeeds bgpfeed = new MongoBoardGplusFeeds();
                    bgpfeed.Id = ObjectId.GenerateNewId();
                    bgpfeed.Gplusboardaccprofileid = BoardId;
                    try
                    {
                        bgpfeed.Feedlink = obj["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        foreach (JObject att in JArray.Parse(obj["object"]["attachments"].ToString()))
                        {
                            if (att["objectType"].ToString().Equals("photo"))
                            {

                                bgpfeed.Imageurl = att["fullImage"]["url"].ToString() + ",";
                            }
                        }
                    }
                    catch { }
                    try
                    {
                        bgpfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.Parse(obj["published"].ToString()));
                    }
                    catch { }
                    try
                    {
                        bgpfeed.Title = obj["title"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.Feedid = obj["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.FromId = obj["actor"]["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.FromName = obj["actor"]["displayName"].ToString();
                    }
                    catch { }
                    try
                    {
                        bgpfeed.FromPicUrl = obj["actor"]["image"]["url"].ToString();
                    }
                    catch { }

                    try
                    {
                        boardrepo.Add<MongoBoardGplusFeeds>(bgpfeed);
                    }
                    catch { }

                }
            }
            catch { }



            return output;
        }


        public string AddTwitterHashTag(string hashTag, string boardId)
        {
            MongoBoardTwitterHashTag twitteracc = new MongoBoardTwitterHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Boardid = boardId, Statuscount = string.Empty, Entrydate = DateTime.UtcNow.ToString(), Screenname = hashTag.ToLower(), Twitterprofileid = "tag", Friendscount = string.Empty, Followingscount = string.Empty, Followerscount = string.Empty, Favouritescount = string.Empty, Photosvideos = string.Empty, Url = string.Empty, Tweet = string.Empty, Profileimageurl = "tag" };
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwitterHashTag");

            MongoBoardTwitterHashTag objTwitterPage = new MongoBoardTwitterHashTag();
            var ret = mongorepo.Find<MongoBoardTwitterHashTag>(t => t.Screenname.Equals(hashTag.ToLower()));
            var task = Task.Run(async () =>
              {
                  return await ret;

              });
            IList<MongoBoardTwitterHashTag> objTwitterPagelist = task.Result.ToList();
            if (objTwitterPagelist.Count() > 0)
            {
                return objTwitterPagelist.First().strId.ToString();
            }

            mongorepo.Add<MongoBoardTwitterHashTag>(twitteracc);
            new Thread(delegate ()
            {
                AddTwittertrendingHashTagFeeds(hashTag, twitteracc.strId.ToString(), null);
            }).Start();
            return twitteracc.strId.ToString();
        }

        public string AddInstagramHashTag(string hashTag, string boardId)
        {
            MongoBoardInstagramHashTag binstacc = new MongoBoardInstagramHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Bio = "tag", Boardid = boardId, Entrydate = DateTime.UtcNow.ToString(), Followedbycount = string.Empty, Followscount = string.Empty, Media = string.Empty, Profileid = hashTag, Profilepicurl = string.Empty, Username = hashTag.ToLower() };
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramHashTag");
            var ret = boardrepo.Find<MongoBoardInstagramHashTag>(t => t.Username.Equals(hashTag.ToLower()) && t.Bio.Equals("tag"));
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            IList<MongoBoardInstagramHashTag> objInstagramPagelist = task.Result.ToList();
            if (objInstagramPagelist.Count() > 0)
            {
                return objInstagramPagelist.First().strId.ToString();
            }
            boardrepo.Add<MongoBoardInstagramHashTag>(binstacc);
            new Thread(delegate ()
            {
                AddBoardInstagramTagFeeds(hashTag, binstacc.strId.ToString());
            }).Start();
            return binstacc.strId.ToString();
        }


        public bool AddBoardInstagramTagFeeds(string hashTag, string boardInstagramTagId)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramFeeds");
            bool output = false;
            try
            {
                JObject recentactivities = JObject.Parse(TagSearch.InstagramTagSearch(hashTag, "1974224400.2310fd1.699477d40ff64cd6babfb0b3a6cf60fa"));
                foreach (JObject obj in JArray.Parse(recentactivities["data"].ToString()))
                {
                    MongoBoardInstagramFeeds binstfeed = new MongoBoardInstagramFeeds();
                    binstfeed.Id = ObjectId.GenerateNewId();
                    binstfeed.Instagramaccountid = boardInstagramTagId;
                    binstfeed.Isvisible = true;
                    try
                    {
                        binstfeed.Imageurl = obj["images"]["standard_resolution"]["url"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.Link = obj["link"].ToString();
                    }
                    catch { }
                    try
                    {
                        foreach (JValue tag in JArray.Parse(obj["tags"].ToString()))
                        {
                            try
                            {
                                binstfeed.Tags = tag.ToString() + ",";
                            }
                            catch { }
                        }
                    }
                    catch { }
                    try
                    {
                        binstfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(new DateTime(1970, 1, 1).AddSeconds(Convert.ToInt64(obj["created_time"].ToString())));
                    }
                    catch
                    {
                        //binstfeed.Createdtime = DateTime.UtcNow;
                    }
                    try
                    {
                        binstfeed.Feedid = obj["id"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.FromId = obj["user"]["username"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.FromName = obj["user"]["full_name"].ToString();
                    }
                    catch { }
                    try
                    {
                        binstfeed.FromPicUrl = obj["user"]["profile_picture"].ToString();
                    }
                    catch { }

                    try
                    {
                        boardrepo.Add<MongoBoardInstagramFeeds>(binstfeed);

                    }
                    catch (Exception e) { }


                }
            }
            catch { }

            return output;
        }
        public bool AddTwittertrendingHashTagFeeds(string HashTag, string trendingTagid, string LastTweetId)
        {
            //MongoRepository mongorepo = new MongoRepository("MongoBoardTwtTrendingFeeds ");
            //bool output = false;
            //List<MongoBoardTwtTrendingFeeds> twtFeedsList = new List<MongoBoardTwtTrendingFeeds>();
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwtFeeds");
            bool output = false;
            List<MongoBoardTwtFeeds> twtFeedsList = new List<MongoBoardTwtFeeds>();
            string timeline = TwitterHashTag.TwitterBoardHashTagSearch(HashTag, LastTweetId);
            int i = 0;
            if (!string.IsNullOrEmpty(timeline) && !timeline.Equals("[]"))
            {
                foreach (JObject obj in JArray.Parse(timeline))
                {
                    MongoBoardTwtFeeds twitterfeed = new MongoBoardTwtFeeds();
                    twitterfeed.Id = ObjectId.GenerateNewId();

                    i++;
                    try
                    {
                        twitterfeed.Feedurl = JArray.Parse(obj["extended_entities"]["media"].ToString())[0]["url"].ToString();
                    }
                    catch
                    {
                        try
                        {
                            twitterfeed.Feedurl = JArray.Parse(obj["entities"]["urls"].ToString())[0]["expanded_url"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        twitterfeed.Imageurl = JArray.Parse(obj["extended_entities"]["media"].ToString())[0]["media_url"].ToString();
                    }
                    catch
                    {
                        try
                        {
                            twitterfeed.Imageurl = JArray.Parse(obj["entities"]["media"].ToString())[0]["media_url"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        foreach (JObject tag in JArray.Parse(obj["entities"]["hashtags"].ToString()))
                        {
                            try
                            {
                                twitterfeed.Hashtags = tag["text"].ToString() + ",";

                            }
                            catch (Exception e)
                            {

                            }
                        }
                    }
                    catch { }
                    try
                    {
                        twitterfeed.Text = obj["text"].ToString();
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.Retweetcount = Convert.ToInt32(obj["retweet_count"].ToString());
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.Favoritedcount = Convert.ToInt32(obj["favorite_count"].ToString());
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        string Const_TwitterDateTemplate = "ddd MMM dd HH:mm:ss +ffff yyyy";
                        twitterfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact((string)obj["created_at"], Const_TwitterDateTemplate, new System.Globalization.CultureInfo("en-US")));
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.Feedid = obj["id_str"].ToString();
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            twitterfeed.Feedid = obj["id"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        twitterfeed.FromId = obj["user"]["id_str"].ToString();
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            twitterfeed.FromId = obj["user"]["id"].ToString();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    try
                    {
                        twitterfeed.FromName = obj["user"]["screen_name"].ToString();
                    }
                    catch (Exception e)
                    {

                    }
                    try
                    {
                        twitterfeed.FromPicUrl = obj["user"]["profile_image_url"].ToString();
                    }
                    catch (Exception e)
                    {

                    }
                    twitterfeed.Isvisible = true;
                    twitterfeed.Twitterprofileid = trendingTagid;
                    var ret = mongorepo.Find<MongoBoardTwtFeeds>(t => t.Feedid == twitterfeed.Feedid);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        try
                        {
                            mongorepo.Add<MongoBoardTwtFeeds>(twitterfeed);

                        }
                        catch (Exception e) { }
                    }
                    else
                    {
                        FilterDefinition<BsonDocument> filter = new BsonDocument("Feedid", twitterfeed.Feedid);
                        var update = Builders<BsonDocument>.Update
.Set("Favoritedcount", twitterfeed.Favoritedcount)
.Set("FromPicUrl", twitterfeed.FromPicUrl)
.Set("Retweetcount", twitterfeed.Retweetcount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoBoardTwtFeeds>(update, filter);
                    }
                    output = true;
                }
            }
            return output;
        }

        public void UpdateTrendsKeywordfeed()
        {
            MongoRepository mongorepo = new MongoRepository("Trendingkeyword");
            var ret = mongorepo.Find<Trendingkeyword>(t => t.TrendingType == Domain.Socioboard.Enum.TrendingType.twitter);
            var task = Task.Run(async () =>
            {
                return await ret;
            });
            List<Trendingkeyword> lstTrendingkeyword = task.Result.ToList();
            foreach (var item in lstTrendingkeyword)
            {
                AddTwittertrendingHashTagFeeds(item.keyword, item.strId, null);
            }
            Thread.Sleep(1000 * 50);
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
    }
}
