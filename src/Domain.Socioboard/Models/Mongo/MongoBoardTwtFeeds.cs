using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardTwtFeeds
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public double Publishedtime { get; set; }
        public string Feedid { get; set; }
        public string Feedurl { get; set; }
        public string Imageurl { get; set; }
        public string Text { get; set; }
        public string Hashtags { get; set; }
        public string Twitterprofileid { get; set; }
        public bool Isvisible { get; set; }
        public string FromName { get; set; }
        public string FromId { get; set; }
        public string FromPicUrl { get; set; }
        public int Retweetcount { get; set; }
        public int Favoritedcount { get; set; }
    }
}
