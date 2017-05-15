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

    public class FacaebookPageDailyReports
    {
        [BsonId]
        [JsonConverter(typeof(ObjectIdConverter))]
        public ObjectId id { get; set; }
        public double date { get; set; }
        public string pageId { get; set; }

        public string totalLikes { get; set; }
        public string talkingAbout { get; set; }

        public int likes { get; set; }
        public string perDayLikes { get; set; }

        public int unlikes { get; set; }
        public string perDayUnlikes { get; set; }

        public int impression { get; set; }
        public string perDayImpression { get; set; }

        public int uniqueUser { get; set; }

        public int storyShare { get; set; }
        public string perDayStoryShare { get; set; }

        public int impressionFans { get; set; }
        public int impressionPagePost { get; set; }
        public int impressionuserPost { get; set; }
        public int impressionCoupn { get; set; }
        public int impressionOther { get; set; }
        public int impressionMention { get; set; }
        public int impressionCheckin { get; set; }
        public int impressionQuestion { get; set; }
        public int impressionEvent { get; set; }

        public int organic { get; set; }
        public int viral { get; set; }
        public int paid { get; set; }

        public int m_13_17 { get; set; }
        public int m_18_24 { get; set; }
        public int m_25_34 { get; set; }
        public int m_35_44 { get; set; }
        public int m_45_54 { get; set; }
        public int m_55_64 { get; set; }
        public int m_65 { get; set; }

        public int f_13_17 { get; set; }
        public int f_18_24 { get; set; }
        public int f_25_34 { get; set; }
        public int f_35_44 { get; set; }
        public int f_45_54 { get; set; }
        public int f_55_64 { get; set; }
        public int f_65 { get; set; }

        public int sharing_M_13_17 { get; set; }
        public int sharing_M_18_24 { get; set; }
        public int sharing_M_25_34 { get; set; }
        public int sharing_M_35_44 { get; set; }
        public int sharing_M_45_54 { get; set; }
        public int sharing_M_55_64 { get; set; }
        public int sharing_M_65 { get; set; }

        public int sharing_F_13_17 { get; set; }
        public int sharing_F_18_24 { get; set; }
        public int sharing_F_25_34 { get; set; }
        public int sharing_F_35_44 { get; set; }
        public int sharing_F_45_54 { get; set; }
        public int sharing_F_55_64 { get; set; }
        public int sharing_F_65 { get; set; }
        public int story_Fans { get; set; }
        public int story_PagePost { get; set; }
        public int story_UserPost { get; set; }
        public int story_Coupon { get; set; }
        public int story_Other { get; set; }
        public int story_Mention { get; set; }
        public int story_Checkin { get; set; }
        public int story_Question { get; set; }
        public int story_Event { get; set; }
        public string name { get; set; }
    }
}