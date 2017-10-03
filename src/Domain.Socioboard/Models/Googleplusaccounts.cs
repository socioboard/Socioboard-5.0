using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Googleplusaccounts
    {
        public Googleplusaccounts()
        {
            this.IsAccessTokenActive = true;
            this.LastUpdate = DateTime.UtcNow;
        }
        public virtual Int64 Id { get; set; }
        public virtual Int64 UserId { get; set; }
        public virtual string GpUserId { get; set; }
        public virtual string GpUserName { get; set; }
        public virtual string GpProfileImage { get; set; }
        public virtual string AccessToken { get; set; }
        public virtual string RefreshToken { get; set; }
        public virtual bool IsActive { get; set; }
        public virtual string EmailId { get; set; }
        public virtual Int64 InYourCircles { get; set; }
        public virtual Int64 HaveYouInCircles { get; set; }
        public virtual DateTime EntryDate { get; set; }
        public virtual bool IsAccessTokenActive { get; set; }
        public virtual DateTime LastUpdate { get; set; }
        public virtual string coverPic { get; set; }
        public virtual string birthday { get; set; }
        public virtual string education { get; set; }
        public virtual string college { get; set; }
        public virtual string workPosition { get; set; }
        public virtual string homeTown { get; set; }
        public virtual string gender { get; set; }
        public virtual string bio { get; set; }
        public virtual string about { get; set; }
        public virtual string workCompany { get; set; }
        public virtual bool socialSignInEnable { get; set; }
    }
}
