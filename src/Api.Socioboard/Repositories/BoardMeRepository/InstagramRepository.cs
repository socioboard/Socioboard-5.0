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
using Socioboard.Instagram.Custom;

namespace Api.Socioboard.Repositories.BoardMeRepository
{
    public class InstagramRepository
    {
        /// <summary>
        /// Adds an Instagram hashtag if not exists in db else it's returns existing hashtag Id
        /// </summary>
        /// <param name="hashTag"> hashtag needs to search.</param>
        /// <param name="boardId"> board id to which we need to add the hasttag.</param>
        /// <param name="_redisCache"> redis cache object</param>
        /// <param name="settings">Application settings class </param>
        /// <param name="_logger"> Serial log object</param>
        /// <returns>instagram hashtag id</returns>
        public async Task<string> AddInstagramHashTag(string hashTag, string boardId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            MongoBoardInstagramHashTag binstacc = new MongoBoardInstagramHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Bio = "tag", Boardid = boardId, Entrydate = DateTime.UtcNow.ToString(), Followedbycount = string.Empty, Followscount = string.Empty, Media = string.Empty, Profileid = hashTag, Profilepicurl = string.Empty, Username = hashTag.ToLower() };
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramHashTag",settings);
            IList<MongoBoardInstagramHashTag> objInstagramPagelist = await boardrepo.Find<MongoBoardInstagramHashTag>(t => t.Username.Equals(hashTag.ToLower()) && t.Bio.Equals("tag")).ConfigureAwait(false);
            if (objInstagramPagelist.Count() > 0)
            {
                return objInstagramPagelist.First().strId.ToString();
            }
            await boardrepo.Add<MongoBoardInstagramHashTag>(binstacc).ConfigureAwait(false);
            new Thread(delegate ()
            {
                AddBoardInstagramTagFeeds(hashTag, binstacc.strId.ToString(),_redisCache,settings,_logger);
            }).Start();
            return binstacc.strId.ToString();
        }


        public bool AddBoardInstagramTagFeeds(string hashTag, string boardInstagramTagId, Helper.Cache _redisCache, Helper.AppSettings settings, ILogger _logger)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramFeeds",settings);
            bool output = false;
            try
            {
                JObject recentactivities = JObject.Parse(TagSearch.InstagramTagSearch(hashTag,settings.InstagramBoardMeAccessToken));
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


                    //if (!boardrepo.checkInstagramFeedExists(binstfeed.Feedid, BoardInstagramTagId))
                    //{
                    //    boardrepo.addBoardInstagramFeeds(binstfeed);
                    //}
                }
            }
            catch { }

            return output;
        }
    }
}
