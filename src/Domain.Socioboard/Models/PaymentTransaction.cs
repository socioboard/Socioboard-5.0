using Domain.Socioboard.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class PaymentTransaction
    {
        public virtual Int64 id { get; set; }
        public virtual Int64 userid { get; set; }
        public virtual string email { get; set; }
        public virtual string amount { get; set; }
        public virtual DateTime paymentdate { get; set; }
        public virtual string trasactionId { get; set; }
        public virtual string paymentId { get; set; }
        public virtual PaymentType PaymentType { get; set; }
        public virtual string media { get; set; }
        public virtual string itemname { get; set; }
        public virtual string paymentstatus { get; set; }
        public virtual string Payername { get; set; }
        public virtual string payeremail { get; set; }
        public virtual DateTime subscrdate { get; set; }
        public virtual Int32 bluesnapSubscriptions { get; set; }
    }
}
