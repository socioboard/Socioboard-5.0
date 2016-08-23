using SocioboardDataServices.Reports;
using SocioboardDataServices.Twitter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataServices
{
    public class Program
    {
        public static void Main(string[] args)
        {
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

                Console.WriteLine("Enter 1 to run Facebook DataServices");
                Console.WriteLine("Enter 2 to run Twitter DataServices");
                Console.WriteLine("Enter 3 to run LinkedIn Company Page DataServices");
                Console.WriteLine("Enter 4 to run Instagram DataServices");
                Console.WriteLine("Enter 5 to run Twitter Daily Reports DataServices");
                Console.WriteLine("Enter 6 to run Twitter past 90 Days Reports DataServices");
                Console.WriteLine("Enter 7 to run facebook page Reports DataServices");
                Console.WriteLine("Enter 8 to run GoogleAnalytics Reports DataServices");
                Console.WriteLine("Enter 9 to run Instagram Reports DataServices");
                Console.WriteLine("Enter 10 to run Group Reports DataServices");
                Console.WriteLine("Enter 11 to run Group Past 90 Days Reports DataServices");
                Console.WriteLine("Enter 12 to run Facebook Public Page Reports DataServices");
                string dataService = Console.ReadLine();
               
                if (dataService == "1")
                {
                    Facebook.FbDataServices objFBServices = new Facebook.FbDataServices();
                    objFBServices.UpdateFacebookAccounts();
                }
                else if (dataService == "2")
                {
                    TwtDataService _TwtDataService = new TwtDataService();
                    _TwtDataService.UpdateTwitterAccount();
                }
                else if (dataService == "3")
                {
                    LinkedIn.LinkedInCompanyPageDataServices objLinCompanyPage = new LinkedIn.LinkedInCompanyPageDataServices();
                    objLinCompanyPage.UpdateLinkedInCompanyPage();
                }
               else if (dataService == "4")
                {
                    Instagram.InstagramDataServices objInsServices = new Instagram.InstagramDataServices();
                    objInsServices.UpdateInstagramAccount();
                }
                else if (dataService == "5")
                {
                    TwitterReports.CreateTwitterReports();
                }
                else if (dataService == "6")
                {
                    TwitterReports.CreateTwitterPrevious90DaysReports();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else if (dataService == "7")
                {
                    Reports.FacebookReports.FacebookPageReports.CreateFacebookPageReport();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else if (dataService == "8")
                {
                    Reports.GoogleAnalyticsReports.GoogleAnalyticsReport.CreateGoogleAnalyticsReport();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else if(dataService=="9")
                {
                    InstagramReports.CreateInstagrmaReport();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else if (dataService == "10")
                {
                    Reports.GroupReports.CreateGroupReports();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else if (dataService == "11")
                {
                    Reports.GroupReports.CreateGroupPrevious90DaysReports();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else if (dataService == "12")
                {
                    Reports.FacebookReports.FacebookPublicPageReport.CreateFacebookPublicPageReport();
                    Console.WriteLine("done");
                    Console.ReadKey();
                }
                else
                {
                    Console.WriteLine("Invalid Option");
                }
            }


        }
    }
}
