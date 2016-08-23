using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Facebookpage
    {
        public string ProfilePageId { get; set; }
        public string AccessToken { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string LikeCount { get; set; }
        public int connected { get; set; }
        public int friendsCount { get; set; }

    }

    public class FacebookGroup
    {
        public string ProfileGroupId { get; set; }
        public string AccessToken { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
