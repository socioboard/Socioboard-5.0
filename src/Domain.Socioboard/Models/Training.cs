using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Training
    {
        public virtual Int64 Id { get; set; }
        public virtual Int64 UserId { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual string EmailId { get; set; }
        public virtual string Message { get; set; }
        public virtual string PhoneNo { get; set; }
        public virtual string Company { get; set;}
        public virtual string PaymentStatus { get; set; }
        public virtual DateTime PaymentDate { get; set; }
        public virtual string PaymentAmount { get; set; }   
    }
}
