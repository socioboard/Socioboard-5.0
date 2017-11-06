using System.Web;

namespace SitemapXml.Core
{
    public class WebHelper
    {
        public static string SiteDomain = HttpContext.Current.Request.Url.Scheme + System.Uri.SchemeDelimiter +
                                      HttpContext.Current.Request.Url.Host +
                                      (HttpContext.Current.Request.Url.IsDefaultPort
                                          ? ""
                                          : ":" + HttpContext.Current.Request.Url.Port);
    }
}