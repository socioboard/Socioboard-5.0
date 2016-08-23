using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class RssFeed
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string RssFeedUrl { get; set; }
        public string ProfileId { get; set; }
        public Domain.Socioboard.Enum.SocialProfileType ProfileType { get; set; }
        public string Message { get; set; }
        public string Title { get; set; }
        public string Link { get; set; }
        public bool Status { get; set; }
        public string ProfileName { get;set; }
        public string ProfileImageUrl { get; set; }
        public string PublishingDate { get; set; }

    }
}
