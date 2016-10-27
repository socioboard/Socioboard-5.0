using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class AgencyUser
    {
        public virtual long id { get; set; }
        public virtual string userName { get; set; }
        public virtual string email { get; set; }
        public virtual string company { get; set; }
        public virtual string message { get; set; }
        public virtual string phnNumber { get; set; }
        public virtual string planType { get; set; }
        public virtual DateTime createdDate { get; set; }
        public virtual double amount { get; set; }
    }
}
