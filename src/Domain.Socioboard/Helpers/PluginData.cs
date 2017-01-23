using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Helpers
{
    public class PluginData
    {
        public string profileType { get; set; }
        public string url { get; set; }
        public string content { get; set; }
        public string imageUrl { get; set; }
        public string name { get; set; }
        public string userImage { get; set; }
        public string screenName { get; set; }
        public string tweet { get; set; }
        public string tweetId { get; set; }
        public string type { get; set; }
        public ThumbnailDetails _ThumbnailDetails { get; set; }
    }
}
