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
    public class FacebookPasswordChangeUserDetail
    {
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public long userId { get; set; }
        public string userPrimaryEmail { get; set; }
        public string profileId { get; set; }
        public string profileName { get; set; }
        public string message { get; set; }
        public string dateValue { get; set; }
        public bool status { get; set; }



    }
}
