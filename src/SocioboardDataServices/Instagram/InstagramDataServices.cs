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
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.Instagramaccounts> lstInstagramaccount = dbr.Find<Domain.Socioboard.Models.Instagramaccounts>(t => t.IsActive).ToList();
                    foreach (var item in lstInstagramaccount)
                    {
                        try
                        {
                            Console.WriteLine(item.InsUserName + "Updating Started");
                            InstagramFeeds.updateInstagramFeeds(item);
                            Console.WriteLine(item.InsUserName + "Updated");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("issue in Updation" + ex.StackTrace);
                            Thread.Sleep(600000);
                        }
                    }
                    Thread.Sleep(60000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }
        }
    }
}
