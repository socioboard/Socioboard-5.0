using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Affiliates
    {
        public virtual Int64 Id { get; set; }
        public virtual Int64 UserId { get; set; }
        public virtual Int64 FriendUserId { get; set; }
        public virtual DateTime AffiliateDate { get; set; }
        public virtual double Amount { get; set; }
    }
}
