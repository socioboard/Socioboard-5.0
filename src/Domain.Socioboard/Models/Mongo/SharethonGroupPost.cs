using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class SharethonGroupPost
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public virtual string Facebookgroupid { get; set; }
        public virtual string Facebookaccountid { get; set; }
        public virtual DateTime PostedTime { get; set; }
        public virtual string PostId { get; set; }
        public virtual string Facebookgroupname { get; set; }

    }
}
