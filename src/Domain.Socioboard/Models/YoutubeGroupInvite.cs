using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class YoutubeGroupInvite
    {
        public virtual Int64 Id { get; set; }
        public virtual Int64 UserId { get; set; }
        public virtual bool Owner { get; set; }
        public virtual string OwnerName { get; set; }
        public virtual string OwnerEmailid { get; set; }
        public virtual bool Active { get; set; }
        public virtual string SBUserName { get; set; }
        public virtual string SBEmailId { get; set; }
        public virtual string SBProfilePic { get; set; }
        public virtual Int64 AccessSBUserId { get; set; }
    }
}
