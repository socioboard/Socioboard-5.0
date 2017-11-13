using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.Models.Mongo
{
    public class YoutubeSearch
    {
        public string YtChannelId { get; set; }
        public string YtVideoId { get; set; }
        public string VdoPublishDate { get; set; }
        public string VdoTitle { get; set; }
        public string VdoDescription { get; set; }
        public string VdoImage { get; set; }
        public string VdoUrl { get; set; }
        public string VdoEmbed { get; set; }
        public double dateTimeUnix { get; set; }
        public DateTime Date { get; set; }
        public string channelTitle { get; set; }
        public string channelUrl { get; set; }
        public string playlistUrl { get; set; }
        public string searchType { get; set; }
        public string pageCode { get; set; }
    }
}
