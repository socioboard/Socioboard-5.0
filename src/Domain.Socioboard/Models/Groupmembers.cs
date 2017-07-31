using Domain.Socioboard.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Groupmembers
    {
        public virtual long id { get; set; }
        [Required]
        public virtual long userId { get; set; }
        public virtual string firstName { get; set; }
        public virtual string lastName { get; set; }
        public virtual string email { get; set; }
        public virtual string profileImg { get; set; }
        [Required]
        public virtual GroupMemberStatus memberStatus { get; set; }
        [Required]
        public virtual long groupid { get; set; }
        [Required]
        public virtual bool isAdmin { get; set; }
        [Required]
        public virtual string memberCode { get; set; }
    }


    public class retaingroup
    {
        //public List<Domain.Socioboard.Models.Groupmembers> memberofadmin { get; set; }
        //public List<Domain.Socioboard.Models.Groupmembers> memberofNonadmin { get; set; }
        public string grpname { get; set;}
        public string username { get; set; }
        public string userId { get; set; }
        public long grpid { get; set; }
        public long memberid { get; set; }
        public string type { get; set; }
    }
}
