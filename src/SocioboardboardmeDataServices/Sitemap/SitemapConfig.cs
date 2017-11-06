using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Hosting;
using System.Xml.Linq;

namespace Sitemap
{
    public class SitemapConfig : SitemapBase
    {
        public static void BuildSitemapXml(string boardname)
        {
            var ctx = HttpContext.Current;
            var sitemap = new SitemapConfig();
            var sitemapThread = new Thread(() =>
            {
                HttpContext.Current = ctx;
                sitemap.Start(boardname);
            });
            sitemapThread.Start();
        }

        public void Start(string boardname)
        {
            // string encoding = Response.ContentEncoding.WebName;

            var sitemap = new XDocument(new XDeclaration("1.0", "UTF-8", ""),
                new XElement(Ns + "urlset",
                    new XAttribute("xmlns", Ns.NamespaceName),
                    new XAttribute(XNamespace.Xmlns + "image", Imagens),
                    //   new XAttribute(XNamespace.Xmlns + "video", Videons),
                    base.GetSitemapElements(boardname))
                );
            try
            {
                sitemap.Save("https://boards.socioboard.com/wwwroot/contents/socioboard/boardsitemaps" + "/sitemap.xml");
            }
            catch (Exception ex)
            {
            }
        }
    }

}