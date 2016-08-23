using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class GoogleAnalyticsProfiles
    {
        public string EmailId { get; set; }
        public string AccountId { get; set; }
        public string WebPropertyId { get; set; }
        public string AccountName { get; set; }
        public string ProfileId { get; set; }
        public string WebsiteUrl { get; set; }
        public string ProfileName { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public int connected { get; set; }

    }
}
