using Domain.Socioboard.Enum;
using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    public class FacebookPagePromotionDetails
    {
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string FeedDescription { get; set; }
        public double FeedDate { get; set; }
        public double EntryDate { get; set; }
        public string ProfileId { get; set; }
        public string FromId { get; set; }
        public string FromName { get; set; }
        public string FromProfileUrl { get; set; }
        public FacebookPagePromotion type { get; set; }
        public string FeedId { get; set; }
        public string Picture { get; set; }
        public string message { get; set; }
    }
}
