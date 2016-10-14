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
    public class GroupShareathon
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public virtual long Userid { get; set; }
        public virtual string FacebookPageUrl { get; set; }
        public virtual string Facebooknameid { get; set; }
        public virtual string Facebookgroupid { get; set; }
        public virtual string Facebookgroupname { get; set; }
        public virtual string Facebookaccountid { get; set; }
        public virtual string Facebookusername { get; set; }
        public virtual string Facebookpageid { get; set; }
        public virtual int Timeintervalminutes { get; set; }
        public virtual string Lastpostid { get; set; }
        public virtual double Lastsharetimestamp { get; set; }
        public virtual bool IsHidden { get; set; }
        public virtual int FacebookStatus { get; set; }
        public virtual string AccessToken { get; set; }
    }
}
