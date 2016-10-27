using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class GroupdailyReports
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public double date { get; set; }
        public Int64 GroupId { get; set; }
        public long  inbox { get; set; }
        public long  sent { get; set; }
        public long  twitterfollower { get; set; }
        public long fbfan { get; set; }
        public long interaction { get; set; }
        public long twtmentions { get; set; }
        public long twtretweets { get; set; }
        public long  malecount { get; set; }
        public long  femalecount { get; set; }
        public long uniqueusers { get; set; }
        public long twitter_account_count { get; set; }

        public long facebookPageCount { get; set; }
        public long plainText { get; set; }
        public long photoLinks { get; set; }
        public long linkstoPages { get; set; }

    }
}
