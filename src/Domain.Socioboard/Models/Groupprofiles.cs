using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Groupprofiles
    {
        public Groupprofiles()
        {
            this.entryDate = DateTime.UtcNow;
        }
        public virtual Int64 id { get; set; }
        [Required]
        public virtual Int64 profileOwnerId { get; set; }
        [Required]
        public virtual Domain.Socioboard.Enum.SocialProfileType profileType { get; set; }

        public virtual string profileName { get; set; }
        public virtual string profileId { get; set; }
        public virtual string profilePic { get; set; }
        [Required]
        public virtual Int64 groupId { get; set; }
        public virtual DateTime entryDate { get; set; }
    }

    public class profilesdetail
    {
        public Domain.Socioboard.Models.Facebookaccounts Fbaccount { get; set; }
        public Domain.Socioboard.Models.TwitterAccount Twtaccount { get; set; }
        public Domain.Socioboard.Models.Instagramaccounts Instaaccount { get; set; }
        public Domain.Socioboard.Models.YoutubeChannel Ytubeaccount { get; set; }
        public Domain.Socioboard.Models.LinkedInAccount LinkdInaccount { get; set; }
        public Domain.Socioboard.Models.LinkedinCompanyPage LinkdINcompanyaccount { get; set; }
        public Domain.Socioboard.Models.GoogleAnalyticsAccount GAaccount { get; set; }
        public Domain.Socioboard.Models.Googleplusaccounts Gplusaccount { get; set; }

        public Domain.Socioboard.Models.PinterestAccount Pintrestaccount { get; set; }
    }

    public class GetUserGroupData
    {
        public Dictionary<long, List<Groupprofiles>> myProfiles { get; set; }
        public List<Domain.Socioboard.Models.Groups> lstgroup { get; set; }
    }


   
}
