using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;

namespace Api.Socioboard.Repositories.BoardMeRepository
{
    public class TwitterRepository
    {
        public async Task<string> AddTwitterHashTag(string hashTag, string boardId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            MongoBoardTwitterHashTag twitteracc = new MongoBoardTwitterHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Boardid = boardId, Statuscount = string.Empty, Entrydate = DateTime.UtcNow.ToString(), Screenname = hashTag.ToLower(), Twitterprofileid = "tag", Friendscount = string.Empty, Followingscount = string.Empty, Followerscount = string.Empty, Favouritescount = string.Empty, Photosvideos = string.Empty, Url = string.Empty, Tweet = string.Empty, Profileimageurl = "tag" };
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwitterHashTag", settings);

            MongoBoardTwitterHashTag objTwitterPage = new MongoBoardTwitterHashTag();
            IList<MongoBoardTwitterHashTag> objTwitterPagelist = await mongorepo.Find<MongoBoardTwitterHashTag>(t => t.Screenname.Equals(hashTag.ToLower())).ConfigureAwait(false);
            if (objTwitterPagelist.Count() > 0)
            {
                return objTwitterPagelist.First().strId.ToString();
            }

            await mongorepo.Add<MongoBoardTwitterHashTag>(twitteracc).ConfigureAwait(false);
            new Thread(delegate ()
            {
                AddBoardTwitterHashTagFeeds(hashTag, twitteracc.strId.ToString(), null, settings, _logger);
                //UpdaeTwt(twitteracc.strId);
            }).Start();
            return twitteracc.strId.ToString();
        }


        public bool AddBoardTwitterHashTagFeeds(string HashTag, string BoardTagid, string LastTweetId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwtFeeds", settings);
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
                            _logger.LogError(e.Message);
                            _logger.LogError(e.StackTrace);
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
                            _logger.LogError(e.Message);
                            _logger.LogError(e.StackTrace);
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
                                _logger.LogError(e.Message);
                                _logger.LogError(e.StackTrace);
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
                        _logger.LogError(e.Message);
                        _logger.LogError(e.StackTrace);
                    }
                    try
                    {
                        twitterfeed.Retweetcount = Convert.ToInt32(obj["retweet_count"].ToString());
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e.Message);
                        _logger.LogError(e.StackTrace);
                    }
                    try
                    {
                        twitterfeed.Favoritedcount = Convert.ToInt32(obj["favorite_count"].ToString());
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e.Message);
                        _logger.LogError(e.StackTrace);
                    }
                    try
                    {
                        string Const_TwitterDateTemplate = "ddd MMM dd HH:mm:ss +ffff yyyy";
                        twitterfeed.Publishedtime = Domain.Socioboard.Helpers.SBHelper.ConvertToUnixTimestamp(DateTime.ParseExact((string)obj["created_at"], Const_TwitterDateTemplate, new System.Globalization.CultureInfo("en-US")));
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e.Message);
                        _logger.LogError(e.StackTrace);
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
                            _logger.LogError(e.Message);
                            _logger.LogError(e.StackTrace);
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
                            _logger.LogError(e.Message);
                            _logger.LogError(e.StackTrace);
                        }
                    }
                    try
                    {
                        twitterfeed.FromName = obj["user"]["screen_name"].ToString();
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e.Message);
                        _logger.LogError(e.StackTrace);
                    }
                    try
                    {
                        twitterfeed.FromPicUrl = obj["user"]["profile_image_url"].ToString();
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e.Message);
                        _logger.LogError(e.StackTrace);
                    }
                    twitterfeed.Isvisible = true;
                    twitterfeed.Twitterprofileid = BoardTagid;
                    try
                    {
                        mongorepo.Add<MongoBoardTwtFeeds>(twitterfeed);

                    }
                    catch (Exception e) { }

                    output = true;
                }
            }
            return output;
        }

        public void UpdaeTwt(string twtId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwitterHashTag", settings);
            var result = mongorepo.Find<MongoBoardTwitterHashTag>(t => t.strId.Equals(twtId));
            var task = Task.Run(async () =>
            {
                return await result;
            });
            IList<MongoBoardTwitterHashTag> boardtwitteracc = task.Result;
            MongoBoardTwitterHashTag twitteracc = boardtwitteracc.First();
            MongoRepository boardtwtfeedsrepo = new MongoRepository("MongoBoardTwtFeeds", settings);
            var result1 = boardtwtfeedsrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(twtId));
            var task1 = Task.Run(async () =>
            {
                return await result1;
            });
            string LastTweetId = task1.Result.Max(t => t.Feedid);
            AddBoardTwitterHashTagFeeds(twitteracc.Screenname, twitteracc.strId, LastTweetId, settings, _logger);
            twitteracc.TotalRetweets = GetBoardTwitterFeedsRetweetsCount(twitteracc.strId, settings, _logger);
            twitteracc.TotalFavorites = GetBoardTwitterFeedsFavoritedCount(twitteracc.strId, settings, _logger);
            twitteracc.TotalTweets = GetBoardTwitterFeedsCount(twitteracc.strId, settings, _logger);
            twitteracc.Top5Retweeted.Clear();
            twitteracc.Top5Retweeted.AddRange(GetBoardTwitterTopFeeds(twitteracc.strId, settings, _logger));
            twitteracc.Top5FavTwitted.Clear();
            twitteracc.Top5FavTwitted.AddRange(GetBoardTwitterTopFavTweets(twitteracc.strId, settings, _logger));

            FilterDefinition<BsonDocument> filter = new BsonDocument("strId", twitteracc.strId);
            // var filter = Builders<MongoBoardTwtProfile>.Filter.Eq(s => s.strId, twitteracc.strId);
            var update = Builders<BsonDocument>.Update
.Set("TotalRetweets", twitteracc.TotalRetweets)
.Set("TotalFavorites", twitteracc.TotalFavorites)
.Set("TotalTweets", twitteracc.TotalTweets)
.Set("Top5Retweeted", twitteracc.Top5Retweeted)
.Set("Top5FavTwitted", twitteracc.Top5FavTwitted);
            mongorepo.Update<MongoBoardTwitterHashTag>(update, filter);

        }



        public List<MongoBoardTwtFeeds> GetBoardTwitterTopFeeds(string BoardTwitterAccountId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardTwtFeeds", settings);
            try
            {
                //List<MongoBoardGplusFeeds> objBoardGplusPagefeeds = boardrepo.getBoardGplusfeedsbyrange(Guid.Parse(BoardGplusprofileId), Convert.ToInt32(_noOfDataToSkip), Convert.ToInt32(_noOfResultsFromTop));
                var result = boardrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(BoardTwitterAccountId)).ConfigureAwait(false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardTwtFeeds> boardslist = task.Result;
                boardslist = boardslist.OrderByDescending(feed => feed.Retweetcount).Take(5).ToList<MongoBoardTwtFeeds>();
                return boardslist.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return null;
            }
        }

        public List<MongoBoardTwtFeeds> GetBoardTwitterTopFavTweets(string BoardTwitterAccountId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardTwtFeeds", settings);
            try
            {
                var result = boardrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(BoardTwitterAccountId)).ConfigureAwait(false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardTwtFeeds> boardslist = task.Result;
                boardslist = boardslist.OrderByDescending(feed => feed.Favoritedcount).Take(5).ToList<MongoBoardTwtFeeds>();
                return boardslist.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return null;
            }
        }

        public string GetBoardTwitterFeedsRetweetsCount(string BoardTwitterAccountId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardTwtFeeds", settings);
            try
            {
                var result = boardrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(BoardTwitterAccountId)).ConfigureAwait(false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardTwtFeeds> boardslist = task.Result;
                if (boardslist != null && boardslist.Count() > 0)
                {
                    return boardslist.Sum(t => t.Retweetcount).ToString();
                }
                return "0";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return "Something Went Wrong";
            }
        }

        public string GetBoardTwitterFeedsFavoritedCount(string BoardTwitterAccountId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardTwtFeeds", settings);
            try
            {

                var result = boardrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(BoardTwitterAccountId)).ConfigureAwait(false);

                var task = Task.Run(async () =>
                {
                    return await result;
                });

                IList<MongoBoardTwtFeeds> boardslist = task.Result;
                if (boardslist != null && boardslist.Count() > 0)
                {
                    return boardslist.Sum(t => t.Favoritedcount).ToString();
                }
                return "0";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return "Something Went Wrong";
            }
        }

        public string GetBoardTwitterFeedsCount(string BoardTwitterAccountId, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardTwtFeeds", settings);
            try
            {
                //List<MongoBoardGplusFeeds> objBoardGplusPagefeeds = boardrepo.getBoardGplusfeedsbyrange(Guid.Parse(BoardGplusprofileId), Convert.ToInt32(_noOfDataToSkip), Convert.ToInt32(_noOfResultsFromTop));

                var result = boardrepo.Find<MongoBoardTwtFeeds>(t => t.Twitterprofileid.Equals(BoardTwitterAccountId)).ConfigureAwait(false);
                var task = Task.Run(async () =>
                {
                    return await result;
                });
                IList<MongoBoardTwtFeeds> boardslist = task.Result;
                if (boardslist != null && boardslist.Count() > 0)
                {
                    return boardslist.Count().ToString();
                }
                return "0";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return "Something Went Wrong";
            }
        }


    }
}
