using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Groups
    {
        public Groups()
        {
            this.CreatedDate = DateTime.UtcNow;
        }
        public virtual Int64 Id { get; set; }
        [Required]
        public virtual string GroupName { get; set; }
        [Required]
        public virtual Int64 AdminId { get; set; }
        public virtual DateTime CreatedDate { get; set; }
    }
}
