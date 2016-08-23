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
    public class Rss
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string strId { get; set; }
        public string RssFeedUrl { get; set; }
        public string ProfileId { get; set; }
        public Domain.Socioboard.Enum.SocialProfileType ProfileType { get; set; }
        public long UserId { get; set; }
        public string CreatedOn { get; set; }
        public string ProfileName { get; set; }
        public string ProfileImageUrl { get; set; }

        public Domain.Socioboard.Models.RssFeedUrl rssFeedUrl { get; set; }
    }
}
