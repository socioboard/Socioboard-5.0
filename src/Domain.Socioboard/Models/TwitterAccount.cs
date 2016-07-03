using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class TwitterAccount
    {
        public TwitterAccount()
        {
            this.lastUpdate = DateTime.UtcNow;
        }
        public long id { get; set; }
        public string twitterUserId { get; set; }
        public string twitterScreenName { get; set; }
        public string oAuthToken { get; set; }
        public string oAuthSecret { get; set; }
        public long userId { get; set; }
        public long followersCount { get; set; }
        public bool isActive { get; set; }
        public long followingCount { get; set; }
        public string profileUrl { get; set; }
        public string profileImageUrl { get; set; }
        public string profileBackgroundImageUrl { get; set; }
        public string twitterName { get; set; }
        public virtual bool isAccessTokenActive { get; set; }
        public virtual DateTime lastUpdate { get; set; }
        public virtual string location { get; set; }
        public virtual string description { get; set; }
    }
}
