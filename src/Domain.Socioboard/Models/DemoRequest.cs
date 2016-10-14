using Domain.Socioboard.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class DemoRequest
    {
        public virtual Int64 id { get; set; }
        public virtual string firstName { get; set; }
        public virtual string lastName { get; set; }
        public virtual string designation { get; set; }
        public virtual string emailId { get; set; }
        public virtual string company { get; set; }
        public virtual string location { get; set; }
        public virtual string skype { get; set; }
        public virtual string phoneNumber { get; set; }
        public virtual string message { get; set; }
        public virtual string companyWebsite { get; set; }
        public virtual DemoPlantype demoPlanType { get; set; }
        public virtual string emailValidationTokenId { get; set; }
    }
}
