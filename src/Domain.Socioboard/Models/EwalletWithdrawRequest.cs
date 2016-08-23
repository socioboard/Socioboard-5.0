using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class EwalletWithdrawRequest
    {
        public virtual Int64 Id { get; set; }
        public virtual Int64 UserID { get; set; }
        public virtual string UserName { get; set; }
        public virtual string UserEmail { get; set; }
        public virtual string WithdrawAmount { get; set; }
        public virtual string PaymentMethod { get; set; }
        public virtual string PaypalEmail { get; set; }
        public virtual string IbanCode { get; set; }
        public virtual string SwiftCode { get; set; }
        public virtual string Other { get; set; }
        public virtual Domain.Socioboard.Enum.EwalletStatus Status { get; set; }
        public virtual DateTime RequestDate { get; set; }
    }
}
