using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Domain.Socioboard.Models;
namespace SocioBoardMailSenderServices.EmailServices
{
    public class SocialStat
    {

        public virtual string Mentions { get; set; }
        public virtual string Direct_Message { get; set; }
        public virtual string Messages_Sent { get; set; }
        public virtual string New_Followers { get; set; }
        public virtual string Retweets { get; set; }
        public virtual string Clicks { get; set; }
        public virtual string male { get; set; }
        public virtual string female { get; set; }
        public virtual List<Domain.Socioboard.Models.TwitterAccount> lsttwitterfollower { get; set; }

    }

    public class FbPageStat
    {
        public virtual string TotalLikes { get; set; }
        public virtual string TalkingAbout { get; set; }
        public virtual string PageLike { get; set; }
        public virtual string PageImpression { get; set; }
        public virtual string PageUnlike { get; set; }
        public virtual List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookAccount { get; set; }
        public virtual List<Domain.Socioboard.Models.Facebookaccounts> lstFacebookpage { get; set; }
    }

    public class InstagramStat
    {
        public virtual string NewFollowers { get; set; }
        public virtual string NewFollowings { get; set; }
        public virtual string ImageCount { get; set; }
        public virtual string VideoCount { get; set; }
        public virtual string LikesCount { get; set; }
        public virtual string CommentCount { get; set; }
        public virtual List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramAccount { get; set; }

    }
}
