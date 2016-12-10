using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardGplusFeeds
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string Feedlink { get; set; }
        public string Gplusboardaccprofileid { get; set; }
        public double Publishedtime { get; set; }
        public string Imageurl { get; set; }
        public string Title { get; set; }
        public string Feedid { get; set; }
        public string FromName { get; set; }
        public string FromId { get; set; }
        public string FromPicUrl { get; set; }
    }
}
