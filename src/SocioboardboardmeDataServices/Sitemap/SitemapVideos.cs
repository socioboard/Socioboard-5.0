using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using Sitemap;
using SitemapXml.Core;
using SitemapXml.Models;

namespace SitemapXml.Sitemap
{
    public class SitemapVideos : SitemapBase
    {
        //public int ExecutionOrder { get { return 2; } }

        //public string UrlPrefix { get { return "Videos/"; } }

        //public List<XElement> Build()
        //{
        //    var videos = Db.GetVideos();
        //    var videoElements = new List<XElement>();
        //    videos.ForEach(video =>
        //    {
        //        string videoUrl = string.Format("{0}/{1}{2}", WebHelper.SiteDomain, UrlPrefix, video.VideoUrl);
        //        string thumbnailUrl = string.Format("{0}/{1}{2}", WebHelper.SiteDomain, UrlPrefix, video.ThumbnailUrl);
        //        var element = base.GetVideoElement(thumbnailUrl, video.Title, video.Description, videoUrl);
        //        videoElements.Add(element);
        //    });
        //    return videoElements;
        //}
    }
}