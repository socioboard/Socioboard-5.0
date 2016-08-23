using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Domain.Socioboard.Models
{
    public class LinkedInAccount 
    {
        public Int64 id { get; set; }
        public string LinkedinUserId { get; set; }
        public string LinkedinUserName { get; set; }
        public string OAuthToken { get; set; }
        public string OAuthVerifier { get; set; }
        public string OAuthSecret { get; set; }
        public string ProfileUrl { get; set; }
        public string ProfileImageUrl { get;set; }
        public bool IsActive { get; set; }
        public string EmailId { get; set; }
        public Int64 UserId { get; set; }
        public int Connections { get; set; }
        public string ProfileType { get; set; }
        public virtual DateTime LastUpdate { get; set; }







    }
}