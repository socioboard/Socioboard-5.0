using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class Package
    {
        public virtual Int64 id { get; set; }
        public virtual string  packagename { get; set; }
        public virtual string amount { get; set; }
    }
}
