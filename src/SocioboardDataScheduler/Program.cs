using SocioboardDataScheduler.Facebook;
using SocioboardDataScheduler.LinkedIn;
using SocioboardDataScheduler.Twitter;
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
                Console.WriteLine("Enter 5 to run Group Shareathon DataScheduler");
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
               
                
            }


        }
    }
}
