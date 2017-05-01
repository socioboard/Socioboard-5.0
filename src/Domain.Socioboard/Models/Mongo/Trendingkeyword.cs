using Domain.Socioboard.Enum;
using Domain.Socioboard.Helpers;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class Trendingkeyword
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public Object Id { get; set; }
        public string strId { get; set; }
        public string keyword { get; set; }
        public string trendingurl { get; set; }
        public TrendingType TrendingType { get; set; }
        public double trendingdate { get; set; }
    }
}
