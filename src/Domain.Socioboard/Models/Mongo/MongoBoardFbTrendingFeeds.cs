using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardFbTrendingFeeds
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public double publishedtime  { get; set; }
        public string PostImageurl { get; set; }
        public string posturl { get; set; }
        public string Text { get; set; }
        public string Title { get; set; }
        public string facebookprofileid { get; set; }
        public bool Isvisible { get; set; }
        public string FromName { get; set; }
        public string FromPicUrl { get; set; }
    }
}
