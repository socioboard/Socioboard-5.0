using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class TasksViewModel
    {
        public virtual Int64 senderUserId { get; set; }
        public virtual Int64 recipientUserId { get; set; }
        public virtual Int64 groupId { get; set; }
        public virtual string taskMessage { get; set; }
        public virtual string taskMessageImageUrl { get; set; }
        public virtual Domain.Socioboard.Enum.FeedTableType feedTableType { get; set; }
        public virtual string feedId { get; set; }
        public virtual string taskComment { get; set; }
    }
}
