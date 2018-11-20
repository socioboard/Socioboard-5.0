using System;

namespace Domain.Socioboard.Models
{
    public class Facebookaccounts
    {
        public Facebookaccounts()
        {
            IsAccessTokenActive = true;
        }
        public virtual long Id { get; set; }

        public virtual string FbUserId { get; set; }

        public virtual string FbUserName { get; set; }

        public virtual string AccessToken { get; set; }

        public virtual long Friends { get; set; }

        public virtual string EmailId { get; set; }

        public virtual string CoverPic { get; set; }

        public virtual string Birthday { get; set; }

        public virtual string Education { get; set; }
        public virtual string College { get; set; }

        public virtual string WorkPosition { get; set; }

        public virtual string HomeTown { get; set; }

        public virtual string Gender { get; set; }

        public virtual string Bio { get; set; }

        public virtual string About { get; set; }

        public virtual string WorkCompany { get; set; }

        public virtual Enum.FbProfileType FbProfileType { get; set; }

        public virtual Enum.FbPageSubscription FbPageSubscription { get; set; }

        public virtual string ProfileUrl { get; set; }

        public virtual bool IsActive { get; set; }

        public virtual long UserId { get; set; }

        public virtual bool IsAccessTokenActive { get; set; }

        public virtual DateTime LastUpdate { get; set;}

        public virtual DateTime SchedulerUpdate { get; set; }

        public virtual DateTime PageShareathonUpdate { get; set; }

        public virtual DateTime GroupShareathonUpdate { get; set; }

        public virtual DateTime LastPageReportGenerated { get; set; }

        public virtual bool Is90DayDataUpdated { get; set; }

        public virtual DateTime ContentShareathonUpdate { get; set; }

        public virtual bool SocailSignInEnable { get; set; }

    }
}
