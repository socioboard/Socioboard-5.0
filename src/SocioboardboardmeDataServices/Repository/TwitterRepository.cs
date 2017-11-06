
using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Socioboard.Twitter.App.Core;
using MongoDB.Driver;
using SocioboardDataServices.Model;

namespace SocioboardboardmeDataServices.Repositories
{
    public class TwitterRepository
    {
        public string AddTwitterHashTag(string hashTag, string boardId)
        {
            MongoBoardTwitterHashTag twitteracc = new MongoBoardTwitterHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Boardid = boardId, Statuscount = string.Empty, Entrydate = DateTime.UtcNow.ToString(), Screenname = hashTag.ToLower(), Twitterprofileid = "tag", Friendscount = string.Empty, Followingscount = string.Empty, Followerscount = string.Empty, Favouritescount = string.Empty, Photosvideos = string.Empty, Url = string.Empty, Tweet = string.Empty, Profileimageurl = "tag" };
            MongoRepository mongorepo = new MongoRepository("MongoBoardTwitterHashTag");

            MongoBoardTwitterHashTag objTwitterPage = new MongoBoardTwitterHashTag();
            // var ret= mongorepo.Find<MongoBoardTwitterHashTag>(t => t.Screenname.Equals(hashTag.ToLower()));
            var ret = mongorepo.Find<MongoBoardTwitterHashTag>(t => t.strId.Equals(hashTag));
            var task=Task.Run(async()=>
            {
                return await ret;
            });
            IList<MongoBoardTwitterHashTag> objTwitterPagelist = task.Result;
            if (objTwitterPagelist.Count() > 0)
            {
                AddBoardTwitterHashTagFeeds(objTwitterPagelist.First().Screenname, objTwitterPagelist.First().strId.ToString(), null);
               
            }
            return objTwitterPagelist.First().strId.ToString();
        }


        public bool AddBoardTwitterHashTagFeeds(string HashTag, string BoardTagid, string LastTweetId)
        {
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
                    twitterfeed.Twitterprofileid = BoardTagid;
                    var ret = mongorepo.Find<MongoBoardTwtFeeds>(t => t.Feedid == twitterfeed.Feedid);
                    var task=Task.Run(async()=>
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
.Set("Retweetcount", twitterfeed.Retweetcount);
                        mongorepo.Update<Domain.Socioboard.Models.Mongo.MongoBoardTwtFeeds>(update, filter);
                    }
                    output = true;
                }
            }
            return output;
        }

    }
}
