using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class TwitterMentionSugg
    {
        public string postId { get; set; }
        public string textMsg { get; set; }
        public string fromName { get; set; }
        public string fromScreenName { get; set; }
        public string fromLocation { get; set; }
        public string fromFollowers { get; set; }
        public string fromFollowing { get; set; }
        public string fromProfilePic { get; set; }
        public string fromProfileLinkUrl { get; set; }
        public string postLinkUrl { get; set; }

    }
}
