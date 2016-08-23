using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class GoogleAnalyticsAccount
    {
        public virtual Int64 Id { get; set; }
        public virtual Int64 UserId { get; set; }
        public virtual string EmailId { get; set; }
        public virtual string GaAccountId { get; set; }
        public virtual string GaAccountName { get; set; }
        public virtual string GaProfileId { get; set; }
        public virtual string GaWebPropertyId { get; set; }
        public virtual string GaProfileName { get; set; }
        public virtual string WebsiteUrl { get; set; }
        public virtual string RefreshToken { get; set; }
        public virtual string AccessToken { get; set; }
        public virtual string ProfilePicUrl { get; set; }
        public virtual double Visits { get; set; }
        public virtual double Views { get; set; }
        public virtual double TwitterPosts { get; set; }
        public virtual double WebMentions { get; set; }
        public virtual bool IsActive { get; set; }
        public virtual DateTime EntryDate { get; set; }
        public virtual DateTime LastUpdate { get; set; }
        public virtual bool Is90DayDataUpdated { get; set; }
    }
}
