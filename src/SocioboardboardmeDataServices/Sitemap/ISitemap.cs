using System.Collections.Generic;
using System.Xml.Linq;

namespace Sitemap
{
    public interface ISitemap
    {
        int ExecutionOrder { get; }
        string UrlPrefix { get; }
        List<XElement> Build(string boardname);
    }
}