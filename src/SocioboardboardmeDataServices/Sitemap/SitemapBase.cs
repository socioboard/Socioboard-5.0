using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Xml.Linq;

namespace Sitemap
{
    public abstract class SitemapBase
    {
        protected XNamespace Ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
        protected XNamespace Imagens = "http://www.google.com/schemas/sitemap-image/1.1";
        protected XNamespace Videons = "http://www.google.com/schemas/sitemap-video/1.1";
        protected HttpContext CurrentContext { get { return HttpContext.Current; } }
        protected HttpRequest Request { get { return HttpContext.Current.Request; } }
        protected HttpResponse Response { get { return HttpContext.Current.Response; } }


        protected XElement GetElement(string url, DateTime lastModified, ChangeFrequency changeFrequency, int priority)
        {
            var element = new XElement(Ns + "url", new XElement(Ns + "loc", url));
            element.Add(new XElement(Ns + "lastmod", lastModified.ToString("MM-dd-yyyy")));
            element.Add(new XElement(Ns + "changefreq", changeFrequency));
            element.Add(new XElement(Ns + "priority", priority.ToString(CultureInfo.InvariantCulture)));
            return element;
        }

        protected XElement GetImageElement(string content, string caption)
        {
            var imageElement = new XElement(Imagens + "image");
            imageElement.Add(new XElement(Imagens + "loc", content));
            imageElement.Add(new XElement(Imagens + "caption", caption));
            return imageElement;
        }

        protected XElement GetVideoElement(string thumbnailUrl, string title, string description, string videoUrl)
        {
            var videoElement = new XElement(Videons + "video");
            videoElement.Add(new XElement(Videons + "thumbnail_loc", thumbnailUrl));
            videoElement.Add(new XElement(Videons + "title", title));
            videoElement.Add(new XElement(Videons + "description", description));
            videoElement.Add(new XElement(Videons + "content", videoUrl));
            return videoElement;
        }

        public enum ChangeFrequency
        {
            Always,
            Hourly,
            Daily,
            Weekly,
            Monthly,
            Yearly,
            Never
        }

        /// <summary>
        /// Returns all types in the current AppDomain implementing the interface or inheriting the type. 
        /// </summary>
        public static IEnumerable<Type> TypesImplementingInterface(Type desiredType)
        {
            return System.Reflection.Assembly.GetCallingAssembly().GetTypes()
                   .Where(type => (desiredType.IsAssignableFrom(type) && !type.IsAbstract && !type.IsGenericTypeDefinition && !type.IsInterface));
        }

        public List<XElement> GetSitemapElements(string boardname)
        {
            var sitemapElements = new List<XElement>();
            IEnumerable<Type> sitemaps = TypesImplementingInterface(typeof(ISitemap));
            return sitemaps.Select(sitemap => (ISitemap)Activator.CreateInstance(sitemap))
                .OrderBy(instance => instance.ExecutionOrder)
                .Select(instance => instance.Build(boardname))
                .Where(elements => elements != null)
                .Aggregate(sitemapElements, (current, elements) => current.Union(elements).ToList());
        }
    }
}
