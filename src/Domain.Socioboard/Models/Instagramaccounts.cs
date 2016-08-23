using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Instagramaccounts
    {
        public Int64 id { get; set; }
        public string InstagramId { get; set; }
        public string AccessToken { get; set; }
        public string InsUserName { get; set; }
        public string bio { get; set; }
        public string ProfileUrl { get; set; }
        public bool IsActive { get; set; }
        public int Followers { get; set; }
        public int FollowedBy { get; set; }
        public int TotalImages { get; set; }
        public Int64 UserId { get; set; }
        public virtual DateTime lastUpdate { get; set; }
        public virtual bool Is90DayDataUpdated { get; set; }
        public virtual DateTime lastpagereportgenerated { get; set; }
    }
}
