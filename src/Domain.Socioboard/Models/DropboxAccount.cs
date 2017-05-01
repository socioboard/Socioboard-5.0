using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class DropboxAccount
    {
        public Int64 id { get; set; }
        public string DropboxUserId { get; set; }
        public string DropboxUserName { get; set; }
        public string AccessToken { get; set; }
        public string DropboxEmail { get; set; }
        public string OauthToken { get; set; }
        public string OauthTokenSecret { get; set; }
        public bool IsActive { get; set; }
        public Int64 UserId { get; set; }
        public virtual DateTime lastUpdate { get; set; }
    }
}
