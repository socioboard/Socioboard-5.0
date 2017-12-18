using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace SocioboardDataServices.Facebook
{
    public class FbDataServices
    {
        public void UpdateFacebookAccounts()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.IsAccessTokenActive && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookProfile).ToList();
                   
                    FbFeeds fbfeeds = new FbFeeds();
                    foreach (var item in lstFbAcc)
                    {
                        try
                        {
                            Console.WriteLine(item.FbUserName + "Updating Started");
                            fbfeeds.updateFacebookFeeds(item);
                            Console.WriteLine(item.FbUserName + "Updated");
                        }
                        catch
                        {
                            Thread.Sleep(600000);
                        }
                    }
                    Thread.Sleep(600000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }

        }

        public void UpdatefacebookPages()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.Facebookaccounts> lstFbAcc = dbr.Find<Domain.Socioboard.Models.Facebookaccounts>(t => t.IsAccessTokenActive && t.FbProfileType == Domain.Socioboard.Enum.FbProfileType.FacebookPage).ToList();
                  
                    foreach (var item in lstFbAcc)
                    {
                        try
                        {
                            Console.WriteLine(item.FbUserName + "Updating Started");
                            FacebookPageFeed.updateFacebookPageFeeds(item);
                            Console.WriteLine(item.FbUserName + "Updated");
                        }
                        catch(Exception ex)
                        {
                            Thread.Sleep(600000);
                        }
                    }
                    Thread.Sleep(600000);
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
