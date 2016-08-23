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
            this.createdDate = DateTime.UtcNow;
        }
        public virtual Int64 id { get; set; }
        [Required]
        public virtual string groupName { get; set; }
        [Required]
        public virtual Int64 adminId { get; set; }
        public virtual DateTime createdDate { get; set; }
    }
}
