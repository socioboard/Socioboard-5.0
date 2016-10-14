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
    public class Tasks
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public virtual ObjectId Id { get; set; }
        public virtual string strId { get; set; }
        public virtual Int64 senderUserId { get; set; }
        public virtual Int64 recipientUserId { get; set; }
        public virtual Int64 groupId { get; set; }
        public virtual string taskMessage { get; set; }
        public virtual string taskMessageImageUrl { get; set; }
        public virtual Domain.Socioboard.Enum.TaskStatus taskStatus { get; set; }
        public virtual Domain.Socioboard.Enum.ReadStaus readStaus { get; set; }
        public virtual Domain.Socioboard.Enum.FeedTableType feedTableType { get; set; }
        public virtual string feedTableId { get; set; }
        public virtual double cratedOn { get; set; }
        public virtual double completeddOn { get; set; }

    }

    


}
