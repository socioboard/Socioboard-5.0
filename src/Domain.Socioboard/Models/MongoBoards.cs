using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
   
    public class MongoBoards
    {
        public long id { get; set; }
        public string boardName { get; set; }
        public long userId { get; set; }
        public string boardId { get; set; }
        public Domain.Socioboard.Enum.TrendingType trendingtype { get; set; }
        public DateTime createDate { get; set; }
        public Domain.Socioboard.Enum.boardStatus isActive { get; set; }
        public string facebookHashTag { get; set; }
        public string twitterHashTag { get; set; }
        public string instagramHashTag { get; set; }
        public string gplusHashTag { get; set; }
    }
}
