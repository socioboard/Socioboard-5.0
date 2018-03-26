using SocioboardDataServices.CustomTwitterFeeds;
using SocioboardDataServices.Pinterest;
using SocioboardDataServices.Reports;
using SocioboardDataServices.Twitter;
using SocioboardDataServices.TwitterTrimme;
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
                Console.WriteLine("Enter 13 to run Facebook  Page  DataServices");
                Console.WriteLine("Enter 14 to run Linked DataServices");
                Console.WriteLine("Enter 15 to run GooglePlus DataServices");
                Console.WriteLine("Enter 16 to run GoogleAnalytics DataServices");
                Console.WriteLine("Enter 17 to run Youtube DataServices");
                Console.WriteLine("Enter 18 to run Youtube Reports Dataservices");
                Console.WriteLine("Enter 19 to run Youtube Video Dataservices");
                Console.WriteLine("Enter 20 to run Find AdsOffer On User Websites Dataservices");
                Console.WriteLine("Enter 21 to run Youtube Pinterest Dataservices");
                Console.WriteLine("Enter 22 to run Youtube CommentReply Dataservices");
                Console.WriteLine("Enter 23 to run deletetwitterfeeds ");
                Console.WriteLine("Enter 24 to run CustomUpdateTwitterFeeds");
                Console.WriteLine("Enter 25 to run YoutubeGroupUpdatesData ");
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
                else if (dataService == "9")
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
                else if (dataService == "13")
                {
                    Facebook.FbDataServices objFBServices = new Facebook.FbDataServices();
                    objFBServices.UpdatefacebookPages();
                    Console.ReadKey();
                }
                else if (dataService == "14")
                {
                    LinkedIn.LinkedInCompanyPageDataServices objLinCompanyPage = new LinkedIn.LinkedInCompanyPageDataServices();
                    objLinCompanyPage.UpdateLinkedIn();
                    Console.ReadKey();
                }
                else if (dataService == "15")
                {
                    Gplus.GooglePlusDataService objGplus = new Gplus.GooglePlusDataService();
                    objGplus.UpdateGooglePlusAccount();
                    Console.ReadKey();
                }
                else if (dataService == "16")
                {
                    Gplus.GooglePlusDataService objGplus = new Gplus.GooglePlusDataService();
                    objGplus.UpadateGoogleAnalyticsAccount();
                    Console.ReadKey();
                }
                else if (dataService == "17")
                {
                    Youtube.YtDataServices objYtube = new Youtube.YtDataServices();
                    objYtube.UpdateYtAccount();
                    Console.ReadKey();
                }
                else if (dataService == "18")
                {
                    Reports.YoutubeAnalytics objYtubeAnalytics = new YoutubeAnalytics();
                    objYtubeAnalytics.UpdateYAnalyticsReports();
                    Console.ReadKey();
                }
                else if (dataService == "19")
                {
                    Reports.YoutubeVideosList objYtubeVideoList = new YoutubeVideosList();
                    objYtubeVideoList.UpdateVideoDetailsList();
                    Console.ReadKey();
                }
                else if (dataService == "20")
                {
                    AdsOffers.AdsOfferDataService objAdsOffers = new AdsOffers.AdsOfferDataService();
                    objAdsOffers.FindAdsOfferUrl();
                    Console.ReadKey();
                }
                else if (dataService == "21")
                {
                    PinterestDataService _PinterestDataService = new Pinterest.PinterestDataService();
                    _PinterestDataService.UpdatePinterestAccount();
                    Console.ReadKey();
                }
                else if (dataService == "22")
                {
                    Youtube.YtCommentsReply objYt = new Youtube.YtCommentsReply();
                    objYt.TakeComments();
                    Console.ReadKey();
                }

                else if (dataService == "23")
                {
                    DeleteTwtFeedsdata objclass = new DeleteTwtFeedsdata();
                    objclass.deleteTwitterfeeds();
                    Console.ReadKey();
                }
                else if (dataService == "24")
                {
                    CustomtwtClass objclass = new CustomtwtClass();
                    objclass.UpdateCustomeTwitterAccountFeeds();
                    Console.ReadKey();
                }
                else if (dataService == "25")
                {
                    Youtube.YoutubeGroupsUpdatesData objclass = new Youtube.YoutubeGroupsUpdatesData();
                    objclass.YoutubeGrpUpdat();
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
