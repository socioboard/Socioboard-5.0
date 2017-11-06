using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Socioboard.Instagram.Custom;
using SocioboardDataServices.Model;

namespace SocioboardboardmeDataServices.Repositories
{
    public class InstagramRepository
    {
      
        public string AddInstagramHashTag(string hashTag, string boardId)
        {
            MongoBoardInstagramHashTag binstacc = new MongoBoardInstagramHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Bio = "tag", Boardid = boardId, Entrydate = DateTime.UtcNow.ToString(), Followedbycount = string.Empty, Followscount = string.Empty, Media = string.Empty, Profileid = hashTag, Profilepicurl = string.Empty, Username = hashTag.ToLower() };
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramHashTag");
            // var ret= boardrepo.Find<MongoBoardInstagramHashTag>(t => t.Username.Equals(hashTag.ToLower()) && t.Bio.Equals("tag"));
            var ret = boardrepo.Find<MongoBoardInstagramHashTag>(t => t.strId.Equals(hashTag) && t.Bio.Equals("tag"));
            var task=Task.Run(async()=>
            {
                return await ret;

            });
            IList<MongoBoardInstagramHashTag> objInstagramPagelist = task.Result;
            if (objInstagramPagelist.Count() > 0)
            {
                AddBoardInstagramTagFeeds(objInstagramPagelist.First().Username, objInstagramPagelist.First().strId.ToString());
                
            }
            return objInstagramPagelist.First().strId.ToString();
        }


        public bool AddBoardInstagramTagFeeds(string hashTag, string boardInstagramTagId)
        {
            MongoRepository boardrepo = new MongoRepository("MongoBoardInstagramFeeds");
            bool output = false;
            try
            {
                JObject recentactivities = JObject.Parse(TagSearch.InstagramTagSearch(hashTag, "1479225281.d89b5cf.bd764cfc979f4bcbabbddf61359659cd"));
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
                    var ret = boardrepo.Find<MongoBoardInstagramFeeds>(t => t.Feedid == binstfeed.Feedid);
                    var task = Task.Run(async () =>
                    {
                        return await ret;
                    });
                    int count = task.Result.Count;
                    if (count < 1)
                    {
                        try
                        {
                            boardrepo.Add<MongoBoardInstagramFeeds>(binstfeed);

                        }
                        catch (Exception e) { } 
                    }

                }
            }
            catch { }

            return output;
        }
    }
}
