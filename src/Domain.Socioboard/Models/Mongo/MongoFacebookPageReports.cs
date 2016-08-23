using Domain.Socioboard.Helpers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace Domain.Socioboard.Models.Mongo
{
    public class MongoFacebookPageReports
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId Id { get; set; }
        public string PageId { get; set; }
        public double date { get; set; }

        public int TalkingAbout { get; set; }

        public int LikesCount { get; set; }

        public int Unlikes { get; set; }

        public int Impression { get; set; }

        public int UniqueUser { get; set; }

        public int StoryShare { get; set; }

        public int ImpressionFans { get; set; }
        public int ImpressionPagePost { get; set; }
        public int ImpressionuserPost { get; set; }
        public int ImpressionCoupn { get; set; }
        public int ImpressionOther { get; set; }
        public int ImpressionMention { get; set; }
        public int ImpressionCheckin { get; set; }
        public int ImpressionQuestion { get; set; }
        public int ImpressionEvent { get; set; }

        public int Organic { get; set; }
        public int Viral { get; set; }
        public int Paid { get; set; }

        public int M_13_17 { get; set; }
        public int M_18_24 { get; set; }
        public int M_25_34 { get; set; }
        public int M_35_44 { get; set; }
        public int M_45_54 { get; set; }
        public int M_55_64 { get; set; }
        public int M_65 { get; set; }

        public int F_13_17 { get; set; }
        public int F_18_24 { get; set; }
        public int F_25_34 { get; set; }
        public int F_35_44 { get; set; }
        public int F_45_54 { get; set; }
        public int F_55_64 { get; set; }
        public int F_65 { get; set; }

        public int Sharing_M_13_17 { get; set; }
        public int Sharing_M_18_24 { get; set; }
        public int Sharing_M_25_34 { get; set; }
        public int Sharing_M_35_44 { get; set; }
        public int Sharing_M_45_54 { get; set; }
        public int Sharing_M_55_64 { get; set; }
        public int Sharing_M_65 { get; set; }

        public int Sharing_F_13_17 { get; set; }
        public int Sharing_F_18_24 { get; set; }
        public int Sharing_F_25_34 { get; set; }
        public int Sharing_F_35_44 { get; set; }
        public int Sharing_F_45_54 { get; set; }
        public int Sharing_F_55_64 { get; set; }
        public int Sharing_F_65 { get; set; }
        public int Story_Fans { get; set; }
        public int Story_PagePost { get; set; }
        public int Story_UserPost { get; set; }
        public int Story_Coupon { get; set; }
        public int Story_Other { get; set; }
        public int Story_Mention { get; set; }
        public int Story_Checkin { get; set; }
        public int Story_Question { get; set; }
        public int Story_Event { get; set; }
    }
}
