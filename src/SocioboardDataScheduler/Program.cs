using SocioboardDataScheduler.Facebook;
using SocioboardDataScheduler.LinkedIn;
using SocioboardDataScheduler.Shareathon;
using SocioboardDataScheduler.Twitter;
using SocioboardDataScheduler.ContentStudio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
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

                Console.WriteLine("Enter 1 to run Facebook DataScheduler");

                Console.WriteLine("Enter 2 to run Twitter DataScheduler");
                Console.WriteLine("Enter 3 to run LinkedIn Company Page DataScheduler");
                Console.WriteLine("Enter 4 to run LinkedIn DataScheduler");
                Console.WriteLine("Enter 5 to run Page Shareathon DataScheduler");
                Console.WriteLine("Enter 6 to run Group Shareathon DataScheduler");
                Console.WriteLine("Enter 7 to run Content studio Shareathon DataSchedule");
                Console.WriteLine("Enter 8 to run Facebook DaywiseScheduler");
                Console.WriteLine("Enter 9 to run Share Feeds with OtherSocialMedia Schedule");
                Console.WriteLine("Enter 10 to run Facebook feeds manager schedule");
                string[] str = { Console.ReadLine() };

                string reporttype = str[0];
                string type = string.Empty;
                switch (reporttype)
                {
                    case "1":
                        type = "Facebook DataScheduler";
                        break;
                    case "2":
                        type = "Twitter DataScheduler";
                        break;
                    case "3":
                        type = "LinkedIn Company Page DataScheduler";
                        break;
                    case "4":
                        type = "LinkedIn DataScheduler";
                        break;
                    case "5":
                        type = "Page Shareathon DataSchedule";
                        break;
                    case "6":
                        type = "Group Shareathon DataSchedule";
                        break;
                    case "7":
                        type = "Content studio Shareathon DataSchedule";
                        break;
                    case "8":
                        type = "Facebook DaywiseScheduler";
                        break;
                    case "9":
                        type = "Share Feeds with OtherSocialMedia Schedule";
                        break;
                    case "10":
                        type = "Facebook feeds manager schedule";
                        break;
                    default:
                        break;
                }

               

                if (type == "Facebook DataScheduler")
                {
                    FacebookDataScheduler objFacebookDataScheduler = new FacebookDataScheduler();
                    objFacebookDataScheduler.ScheduleFacebookMessage();
                }
                if (type == "Twitter DataScheduler")
                {
                    TwitterDatascheduler objTwitterDatascheduler = new TwitterDatascheduler();
                    objTwitterDatascheduler.ScheduleTwitterMessage();
                }
                if (type == "LinkedIn Company Page DataScheduler")
                {
                    LinkedInDataScheduler objLinkedInDataScheduler = new LinkedInDataScheduler();
                    objLinkedInDataScheduler.ScheduleLinkedInCompanyPageMessage();
                }
                if (type == "LinkedIn DataScheduler")
                {
                    LinkedInDataScheduler objLinkedInDataScheduler = new LinkedInDataScheduler();
                    objLinkedInDataScheduler.ScheduleLinkedInMessage();
                }
                if (type == "Page Shareathon DataSchedule")
                {
                    ShareathonDataSchedulars _ShareathonDataSchedulars = new SocioboardDataScheduler.Shareathon.ShareathonDataSchedulars();
                    while (true)
                    {
                        try
                        {
                            _ShareathonDataSchedulars.ShareShateathons();
                            Thread.Sleep(60 * 60 * 1000);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("issue in web api calling" + ex.StackTrace);
                            Thread.Sleep(60 * 60 * 1000);
                        }
                    }

                }
                if (type == "Group Shareathon DataSchedule")
                {
                    ShareathonDataSchedulars _ShareathonDataSchedulars = new SocioboardDataScheduler.Shareathon.ShareathonDataSchedulars();
                    while (true)
                    {
                        try
                        {
                            _ShareathonDataSchedulars.ShareGroupShareathon();
                            Thread.Sleep(60 * 60 * 1000);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("issue in web api calling" + ex.StackTrace);
                            Thread.Sleep(60 * 60 * 1000);
                        }
                    }
                }
                if (type == "Share Feeds with OtherSocialMedia Schedule")
                {
                    FacebookShareFeeds _sharefeedsSchedule = new SocioboardDataScheduler.Shareathon.FacebookShareFeeds();
                    while (true)
                    {
                        try
                        {
                            _sharefeedsSchedule.ScheduleTwitterMessage();
                         
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("issue in web api calling" + ex.StackTrace);
                            
                        }
                    }
                }

                if (type == "Content studio Shareathon DataSchedule")
                {
                    ContentTrendDataScheduler objContentStudioDatascheduler = new ContentTrendDataScheduler();
                    objContentStudioDatascheduler.SchdeuledContentFeeds();
                }

                if (type == "Facebook DaywiseScheduler")
                {
                    FacebookDataScheduler objDaywiseDatascheduler = new FacebookDataScheduler();
                    objDaywiseDatascheduler.dayscheduleFBMessage();
                }

                if (type == "Facebook feeds manager schedule")
                {
                    FacebookFeedsManagerSched objfbfeedsmanager = new FacebookFeedsManagerSched();
                    objfbfeedsmanager.ScheduleFacebookfeedmanagerPost();
                }


            }
        }
    }
}
