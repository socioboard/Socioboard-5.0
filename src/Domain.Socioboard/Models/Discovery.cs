using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Discovery
    {
        public virtual long id { get; set; }
        public virtual DateTime createTime { get; set; }
        public virtual long userId { get; set; }
        public virtual Int64 GroupId { get; set; }
        public virtual string SearchKeyword { get; set; }
        public virtual string Network { get; set; }
    }
}
