using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoDirectMessages
    {
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public string message { get; set; }
        public string recipientId { get; set; }
        public string recipientScreenName { get; set; }
        public string recipientProfileUrl { get; set; }
        public string createdDate { get; set; }
        public double timeStamp { get; set; }
        public string entryDate { get; set; }
        public string senderId { get; set; }
        public string senderScreenName { get; set; }
        public string senderProfileUrl { get; set; }
        public string profileId { get; set; }
        public Domain.Socioboard.Enum.MessageType type { get; set; }
        public string messageId { get; set; }
        public string image { get; set; }
        public string  ConversationLink { get; set; }
    }
}
