using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class GoogleAnalyticsReport
    {
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string GaProfileId { get; set; }
        public string Visits { get; set; }
        public string Views { get; set; }
        public string TwitterMention { get; set; }
        public string Article_Blogs { get; set; }
        public double date { get; set; }
    }
}
