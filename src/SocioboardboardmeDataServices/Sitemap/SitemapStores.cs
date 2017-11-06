using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using SitemapXml.Core;
using SitemapXml.Models;

namespace Sitemap
{
    public class SitemapStores : SitemapBase, ISitemap
    {
        public int ExecutionOrder { get { return 1; } }
        public string UrlPrefix { get { return "BoardSiteMap/"; } }
        
        public List<XElement> Build(string boardname)
        {
           // var stores = Db.GetStores();
            var storeElements = new List<XElement>();

            //stores.ForEach(store =>{
                string storeUrl = string.Format("{0}/{1}{2}", "https://boards.socioboard.com", UrlPrefix, boardname);
                var element = base.GetElement(storeUrl, DateTime.UtcNow, ChangeFrequency.Weekly, 1);
                storeElements.Add(element);
           // });

            return storeElements;
        }
    }
}