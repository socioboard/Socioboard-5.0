using SociobordRssDataServices.Rss;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SociobordRssDataServices
{
    public class Program
    {
        public static void Main(string[] args)
        {
            RssDateServices _RssDateServices = new RssDateServices();
            _RssDateServices.Rss();
        }
        
       
    }
}
