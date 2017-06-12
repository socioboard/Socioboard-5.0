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
    public class RssNewsContentsFeeds
    {
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        //  public string strId { get; set; }
        public string RssFeedUrl { get; set; }
        public string FeedId { get; set; }
        public string UserId { get; set; }
        public string Message { get; set; }
        public string Title { get; set; }
        public string Link { get; set; }
        public string ProfileName { get; set; }
        public string PublishingDate { get; set; }
        public string Image { get; set; }
        public string keywords { get; set; }

    }
}
