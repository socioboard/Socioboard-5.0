using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class TwitterFriendRelation
    {
        public string myId { get; set; }
        public string myScreenName { get; set; }
        public string myFollowing { get; set; }
        public string myFollowedBy { get; set; }
        public string myLiveFollowing { get; set; }
        public string myFollowingReceived { get; set; }
        public string myFollowingRequested { get; set; }
        public string myNotificationsEnabled { get; set; }
        public string myCanDm { get; set; }
        public string myBlocking { get; set; }
        public string myBlockedBy { get; set; }
        public string myMuting { get; set; }
        public string myWantRetweets { get; set; }
        public string myAllReplies { get; set; }
        public string myMarkedSpam { get; set; }
        public string targetId { get; set; }
        public string targetScreenName { get; set; }
        public string targetFollowing { get; set; }
        public string targetFollowedBy { get; set; }
        public string targetFollowingReceived { get; set; }
        public string targetFollowingRequsted { get; set; }
    }
}
