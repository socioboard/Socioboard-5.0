using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Helpers
{
    public class ThumbnailDetails
    {
        public string title { get; set; }
        public string image { get; set; }
        public string url { get; set; }
        public string description { get; set; }
        public List<string> imageurls { get; set; }
    }
}
