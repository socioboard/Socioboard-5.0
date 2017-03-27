using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class RssFeedUrl
    {
        public virtual long rssFeedUrlId { get; set; }
        public virtual string rssurl { get; set; }
        public virtual DateTime LastUpdate { get; set; }
        public virtual string Keywords { get; set; }
    }
}
