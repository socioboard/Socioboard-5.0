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
}
