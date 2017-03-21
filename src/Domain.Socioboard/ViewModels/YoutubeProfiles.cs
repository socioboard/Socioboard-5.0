using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Socioboard.ViewModels
{
    public class YoutubeProfiles
    {

        public string YtChannelId { get; set; }
        public string YtChannelName { get; set; }
        public string YtChannelImage { get; set; }
        public string YtChannelDescrip { get; set; }
        public string Accesstoken { get; set; }
        public string Refreshtoken { get; set; }
        public string PublishDate { get; set; }
        public string viewscount { get; set; }
        public string commentscount { get; set; }
        public string subscriberscount { get; set; }
        public string videoscount { get; set; }
        public int connected { get; set; }

    }
}
