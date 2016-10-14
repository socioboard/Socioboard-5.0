using Api.Socioboard.Model;
using Domain.Socioboard.Models.Mongo;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System;
using Newtonsoft.Json.Linq;
using Socioboard.Google.Custom;

namespace Api.Socioboard.Repositories.BoardMeRepository
{
    public class GplusRepository
    {
        /// <summary>
        /// create an Gplus Hash Tag and fetch all feeds with hash tag and saves in Db
        /// </summary>
        /// <param name="hashTag"> hashtag needs to search.</param>
        /// <param name="boardId"> board id to which we need to add the hasttag.</param>
        /// <param name="_redisCache"> redis cache object</param>
        /// <param name="settings">Application settings class </param>
        /// <param name="_logger"> Serial log object</param>
        /// <returns> gplus hashtag id.</returns>
        public async Task<string> AddGplusHashTag(string hashTag, string boardId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            MongoBoardGplusHashTag bgpacc = new MongoBoardGplusHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Aboutme = string.Empty, Boardid = boardId, Circledbycount = string.Empty, Coverphotourl = string.Empty, Displayname = hashTag.ToLower(), Entrydate = DateTime.UtcNow.ToString(), Nickname = hashTag, Pageid = "tag", Pageurl = string.Empty, Plusonecount = string.Empty, Profileimageurl = string.Empty, Tagline = string.Empty };
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusHashTag", settings);
            IList<MongoBoardGplusHashTag> objgplusPagelist = await boardrepo.Find<MongoBoardGplusHashTag>(t => t.Displayname.Equals(hashTag.ToLower()) && t.Pageid.Equals("tag")).ConfigureAwait(false);
            if (objgplusPagelist.Count() > 0)
            {
                return objgplusPagelist.First().strId.ToString();
            }
            await boardrepo.Add<MongoBoardGplusHashTag>(bgpacc).ConfigureAwait(false);
            new Thread(delegate ()
            {
                AddBoardGplusTagFeeds(hashTag, bgpacc.strId.ToString(),_redisCache,settings, _logger);
            }).Start();
            return bgpacc.strId.ToString();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="GplusTagId"></param>
        /// <param name="BoardId"></param>
        /// <param name="_redisCache"></param>
        /// <param name="settings"></param>
        /// <param name="_logger"></param>
        /// <returns></returns>
        public bool AddBoardGplusTagFeeds(string GplusTagId, string BoardId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusFeeds", settings);
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



                    //if (!boardrepo.checkgPlusFeedExists(bgpfeed.Feedid, BoardId))
                    //{
                    //    boardrepo.addBoardGPlusFeed(bgpfeed);
                    //}
                }
            }
            catch { }



            return output;
        }
    }
}
