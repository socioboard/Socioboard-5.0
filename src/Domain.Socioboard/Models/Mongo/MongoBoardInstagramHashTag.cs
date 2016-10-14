using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardInstagramHashTag
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string strId { get; set; }

        public string Username { get; set; }
        public string Followedbycount { get; set; }
        public string Followscount { get; set; }
        public string Boardid { get; set; }
        public string Profilepicurl { get; set; }
        public string Profileid { get; set; }
        public string Url { get; set; }
        public string Bio { get; set; }
        public string Media { get; set; }
        public string Entrydate { get; set; }
        public int Ispreviousloaded { get; set; }
    }
}
