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
    }
}
