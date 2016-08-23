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
    public class LinkedinCompanyPagePosts
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string Posts { get; set; }
        public string PostDate { get; set; }
        public string  EntryDate { get; set; }
        public long UserId { get; set; }
        public string Type { get; set; }
        public string PostId { get; set; }
        public string PageId { get; set; }
        public string PostImageUrl { get; set; }
        public string UpdateKey { get; set; }
        public int Likes { get; set; }
        public int Comments { get; set; }
        public int IsLiked { get; set; }
    }

    public class LinkdeinPageComment
    {
        public string Comment { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime CommentTime { get; set; }
        public string PictureUrl { get; set; }
    }
}
