using Domain.Socioboard.Models.Mongo;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System;
using Newtonsoft.Json.Linq;
using Socioboard.Google.Custom;
using SocioboardDataServices.Model;

namespace SocioboardboardmeDataServices.Repositories
{
    public class GplusRepository
    {
        public string AddGplusHashTag(string hashTag, string boardId)
        {
            MongoBoardGplusHashTag bgpacc = new MongoBoardGplusHashTag { Id = ObjectId.GenerateNewId(), strId = ObjectId.GenerateNewId().ToString(), Aboutme = string.Empty, Boardid = boardId, Circledbycount = string.Empty, Coverphotourl = string.Empty, Displayname = hashTag.ToLower(), Entrydate = DateTime.UtcNow.ToString(), Nickname = hashTag, Pageid = "tag", Pageurl = string.Empty, Plusonecount = string.Empty, Profileimageurl = string.Empty, Tagline = string.Empty };
            MongoRepository boardrepo = new MongoRepository("MongoBoardGplusHashTag");
            //var ret= boardrepo.Find<MongoBoardGplusHashTag>(t => t.Displayname.Equals(hashTag.ToLower()) && t.Pageid.Equals("tag"));
            var ret = boardrepo.Find<MongoBoardGplusHashTag>(t => t.strId.Equals(hashTag) && t.Pageid.Equals("tag"));
            var task=Task.Run(async()=>
            {
                return await ret;
            });
            IList<MongoBoardGplusHashTag> objgplusPagelist = task.Result;
            if (objgplusPagelist.Count() > 0)
            {
                AddBoardGplusTagFeeds(objgplusPagelist.First().Displayname, objgplusPagelist.First().strId.ToString());
                
            }
            return objgplusPagelist.First().strId.ToString();
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

                    var ret = boardrepo.Find<MongoBoardGplusFeeds>(t => t.Feedid == bgpfeed.Feedid);
                   var task=Task.Run(async()=>
                   {
                       return await ret;
                   });
                    int count = task.Result.Count;
                    if (count<1)
                    {
                        try
                        {
                            boardrepo.Add<MongoBoardGplusFeeds>(bgpfeed);
                        }
                        catch { } 
                    }

                    
                }
            }
            catch { }



            return output;
        }
    }
}
