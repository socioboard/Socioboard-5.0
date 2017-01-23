using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Coupons
    {
        public virtual Int64 Id { get; set; }
        public virtual string CouponCode { get; set; }
        public virtual DateTime EntryCouponDate { get; set; }
        public virtual DateTime ExpCouponDate { get; set; }
       
        public virtual int Discount { get; set; }
    }
}
