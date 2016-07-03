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
            this.EntryDate = DateTime.UtcNow;
        }
        public virtual Int64 Id { get; set; }
        [Required]
        public virtual Int64 ProfileOwnerId { get; set; }
        [Required]
        public virtual Domain.Socioboard.Enum.SocialProfileType ProfileType { get; set; }
        public virtual string ProfileName { get; set; }
        public virtual string ProfileId { get; set; }
        public virtual string ProfilePic { get; set; }
        [Required]
        public virtual Int64 GroupId { get; set; }
        public virtual DateTime EntryDate { get; set; }
    }
}
