using System;

namespace SitemapXml.Models
{
    public class Store
    {
        public string StoreName { get; private set; }
        public string StoreUrl { get; private set; }
        public DateTime UpdateDate { get; private set; }

        public Store(string storeName, string storeUrl, DateTime updateDate)
        {
            this.StoreName = storeName;
            this.StoreUrl = storeUrl;
            this.UpdateDate = updateDate;
        }
    }
}