using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class InstagramDailyReport
    {
        [BsonId]
        public Object id { get; set; }
        public double date { get; set; }
        public string profileId { get; set; }
        public string instaName { get; set; }
        public string fullName { get; set; }
        public string profilePicUrl { get; set; }
        public long mediaCount { get; set; }
        public long followcount { get; set; }
        public long followingcount { get; set; }
        public long postcomment { get; set; }
        public long postlike { get; set; }
        public long videopost { get; set; }
        public long imagepost { get; set; }
       

    }
}
