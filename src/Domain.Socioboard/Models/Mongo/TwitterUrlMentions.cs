using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class TwitterUrlMentions
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string Feed { get; set; }
        public string FeedId { get; set; }
        public double Feeddate { get; set; }
        public string FromId { get; set; }
        public string FromName { get; set; }
        public string FromImageUrl { get; set; }
        public string HostName { get; set; }

    }
}
