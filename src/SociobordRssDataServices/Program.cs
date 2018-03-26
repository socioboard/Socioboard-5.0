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
            //RssDateServices _RssDateServices = new RssDateServices();
           // _RssDateServices.Rss();
            Program.StartService(args);
        }


        static void StartService(string[] args)
        {
            string check = string.Empty;
            try
            {
                check = args[0];
            }
            catch (Exception)
            {
                check = null;
            }
            if (string.IsNullOrEmpty(check))
            {
                Console.WriteLine("Enter 1 to run RSS DataServices");
                Console.WriteLine("Enter 2 to run RSS Contents news DataServices");
                Console.WriteLine("Enter 3 to run RSS recent post Dataservice");
                string dataService = Console.ReadLine();
                if (dataService == "1")
                {
                    RssDateServices _RssDateServices = new RssDateServices();
                    _RssDateServices.Rss();
                }
                else if (dataService == "2")
                {
                    RssDateServices _RssDateServices = new RssDateServices();
                    _RssDateServices.RssContentsFeeds();
                }
                else if(dataService == "3")
                {
                    RssDateServices _RssDateServices = new RssDateServices();
                    _RssDateServices.RssFeedRecent();
                }
            }
        }

    }
}
