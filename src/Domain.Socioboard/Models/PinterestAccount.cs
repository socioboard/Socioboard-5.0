using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class PinterestAccount
    {
        public virtual long id { get; set; }
        public virtual string username { get; set; }
        public virtual string bio { get; set; }
        public virtual string firstname { get; set; }
        public virtual string lastname { get; set; }
        public virtual string accounttype { get; set; }
        public virtual string url { get; set; }
        public virtual string profileimgaeurl { get; set; }
        public virtual long pinscount { get; set; }
        public virtual long followingcount { get; set; }
        public virtual long followerscount { get; set; }
        public virtual long boardscount { get; set; }
        public virtual long likescount { get; set; }
        public virtual string profileid { get; set; }
        public virtual string accesstoken { get; set; }
        public virtual long userid { get; set; }
        public virtual bool isactive { get; set; }
        public virtual DateTime lastupdate { get; set; }
    }
}
