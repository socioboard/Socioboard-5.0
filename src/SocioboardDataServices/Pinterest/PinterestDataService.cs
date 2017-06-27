using SocioboardDataServices.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Pinterest
{
    public class PinterestDataService
    {
        public void UpdatePinterestAccount()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.PinterestAccount> lstpinterestccount = dbr.Find<Domain.Socioboard.Models.PinterestAccount>(t => t.isactive).ToList();
                    foreach (var item in lstpinterestccount)
                    {
                        try
                        {
                            if (item.lastupdate.AddHours(1) <= DateTime.UtcNow)
                            {
                                Console.WriteLine(item.username + "Updating Started");
                                Pinterestfeeds.UpdatePinterestFeeds(item);
                                Console.WriteLine(item.username + "Updated");
                                item.lastupdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.PinterestAccount>(item); 
                            }
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
