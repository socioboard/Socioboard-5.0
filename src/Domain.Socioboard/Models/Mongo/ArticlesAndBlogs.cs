using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class ArticlesAndBlogs
    {
        [BsonId]
        public Object Id { get; set; }
        public Domain.Socioboard.Enum.ArticlesAndBlogsTypes Type { get; set; }
        public string VideoId { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public string VideoUrl { get; set; }
        public string HostName { get; set; }
        public double Created_Time { get; set; }
    }
}
