using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class InvitationDetails
    {

        public virtual long GroupId { get; set; }

        public virtual string Message { get; set; }

        public virtual string EmailId { get; set; }

        public virtual string MemberCode { get; set; }

        public virtual long UserId { get; set; }

        public virtual Int64 NotifyId { get; set; }
    }
}
