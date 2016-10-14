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
    public class TaskComments
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public virtual ObjectId Id { get; set; }
        public virtual string strId { get; set; }
        public virtual string taskId { get; set; }
        public virtual Int64 userId { get; set; }
        public virtual string commentText { get; set; }
        public virtual double createdOn { get; set; }

    }
}
