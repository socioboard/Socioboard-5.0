using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class CommentViewModel
    {
        public virtual string taskId { get; set; }
        public virtual Int64 userId { get; set; }
        public virtual string commentText { get; set; }
    }
}
