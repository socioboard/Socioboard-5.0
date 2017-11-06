using System;
using System.Security.Cryptography;

namespace SitemapXml.Models
{
    public class Video
    {
        public string Title { get; private set; }
        public string Description { get; private set; }
        public string ThumbnailUrl { get; private set; }
        public string VideoUrl { get; private set; }

        public Video(string title, string description, string thumbnailUrl, string videoUrl)
        {
            this.Title = title;
            this.Description = description;
            this.ThumbnailUrl = thumbnailUrl;
            this.VideoUrl = videoUrl;
        }
    }
}