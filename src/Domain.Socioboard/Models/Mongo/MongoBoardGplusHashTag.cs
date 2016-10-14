using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardGplusHashTag
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string Pageid { get; set; }
        public string Circledbycount { get; set; }
        public string Plusonecount { get; set; }
        public string Displayname { get; set; }
        public string Boardid { get; set; }
        public string Nickname { get; set; }
        public string Aboutme { get; set; }
        public string Pageurl { get; set; }
        public string Profileimageurl { get; set; }
        public string Tagline { get; set; }
        public string Coverphotourl { get; set; }
        public string Entrydate { get; set; }
        public int Ispreviousloaded { get; set; }
    }
}
