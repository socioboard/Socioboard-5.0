using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Instagram
{
    public class InstagramDataServices
    {
        public void UpdateInstagramAccount()
        {
            while(true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramaccount = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.IsActive).ToList();
                foreach (var item in lstInstagramaccount)
                {
                    Console.WriteLine(item.InsUserName + "Updating Started");
                    InstagramFeeds.updateInstagramFeeds(item);
                    Console.WriteLine(item.InsUserName + "Updated");
                }
                Thread.Sleep(60000);
            }
        }
    }
}
