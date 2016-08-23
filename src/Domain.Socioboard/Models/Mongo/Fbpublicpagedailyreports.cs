using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class Fbpublicpagedailyreports
    {
        [BsonId]
        public virtual Object id { get; set; }
        public virtual double date { get; set; }
        public virtual string pageid { get; set; }
        public virtual float likescount { get; set; }
        public virtual float postscount { get; set; }
        public virtual float pommentscount { get; set; }
        public virtual float sharescount { get; set; }
    }
}
