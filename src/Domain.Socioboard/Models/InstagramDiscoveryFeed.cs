using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Domain.Socioboard.Models
{
    
    public class InstagramDiscoveryFeed
    {
        public string strId { get; set; }
        public string FeedImageUrl { get; set; }
        public string FeedDate { get; set; }
        public string InstagramId { get; set; }
        public int LikeCount { get; set; }
        public string FeedId { get; set; }
        public int CommentCount { get; set; }
        public int IsLike { get; set; }
        public string AdminUser { get; set; }
        public string Feed { get; set; }
        public string ImageUrl { get; set; }
        public string FeedUrl { get; set; }
        public string FromId { get; set; }
        public string Type { get; set; }
        public string VideoUrl { get; set; }
    }
}