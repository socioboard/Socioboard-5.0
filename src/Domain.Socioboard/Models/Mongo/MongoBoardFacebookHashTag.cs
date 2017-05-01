using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class MongoBoardFacebookHashTag
    {
        

        [BsonId]
        public ObjectId Id { get; set; }
        public string strId { get; set; }
        public string Screenname { get; set; }
        public string Boardid { get; set; }
        public string Facebookprofileid { get; set; }
        public string Profileimageurl { get; set; }
        public string Url { get; set; }
        public string text { get; set; }
        public string Photosvideos { get; set; }
        public string Followingscount { get; set; }
        public string Entrydate { get; set; }
        public int Ispreviousloaded { get; set; }
        
    }
}
