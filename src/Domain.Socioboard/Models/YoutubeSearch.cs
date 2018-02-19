using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models
{
    public class YoutubeSearch
    {
        public string videoId { get; set; }
        public string channelId { get; set; }
        public string title { get; set; }
        public string descript { get; set; }
        public string videoThumbnails { get; set; }
        public string channelTitle { get; set; }
        public string publishedAt { get; set; }
        public DateTime publishedAtDateTime { get; set; }
        public double publishedAtUnixtype { get; set; }

    }
}
