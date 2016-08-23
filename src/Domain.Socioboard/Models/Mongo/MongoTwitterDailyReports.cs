using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoTwitterDailyReports
    {
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public int newFollowers { get; set; }
        public int newFollowing { get; set; }
        public int mentions { get; set; }
        public int retweets { get; set; }
        public int directMessagesReceived { get;  set; }
        public int directMessagesSent { get; set; }
        public int messagesReceived { get; set; }
        public int messagesSent { get; set; }
        public double timeStamp { get; set; }
        public string profileId { get; set; }
    }
}
