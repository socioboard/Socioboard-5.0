using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardTwitterHashTag
    {
        public MongoBoardTwitterHashTag()
        {
            this.Top5FavTwitted = new List<MongoBoardTwtFeeds>();
            this.Top5Retweeted = new List<MongoBoardTwtFeeds>();
        }


        [BsonId]
        public ObjectId Id { get; set; }
        public string strId { get; set; }

        public string Screenname { get; set; }
        public string Statuscount { get; set; }
        public string Friendscount { get; set; }
        public string Followerscount { get; set; }
        public string Favouritescount { get; set; }
        public string Boardid { get; set; }
        public string Twitterprofileid { get; set; }
        public string Profileimageurl { get; set; }
        public string Url { get; set; }
        public string Tweet { get; set; }
        public string Photosvideos { get; set; }
        public string Followingscount { get; set; }
        public string Entrydate { get; set; }
        public int Ispreviousloaded { get; set; }



        public string TotalRetweets { get; set; }
        public string TotalFavorites { get; set; }
        public string TotalTweets { get; set; }
        public List<MongoBoardTwtFeeds> Top5Retweeted { get; set; }
        public List<MongoBoardTwtFeeds> Top5FavTwitted { get; set; }
    }
}
