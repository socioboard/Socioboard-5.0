using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.LinkedIn
{
    public class LinkedInDataScheduler
    {
        public void ScheduleLinkedInMessage()
        {
            while (true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn && t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending).ToList();
                foreach (var item in lstScheduledMessage)
                {
                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                    LinkedInScheduler.PostLinkedInMessage(item);
                    Console.WriteLine(item.socialprofileName + "Scheduling");
                }
                Thread.Sleep(60000);
            }
        }
        public void ScheduleLinkedInCompanyPageMessage()
        {
            while (true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage && t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending).ToList();
                foreach (var item in lstScheduledMessage)
                {
                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                    LinkedInCompanyPageScheduler.PostLinkedInCompanyPageMessage(item);
                    Console.WriteLine(item.socialprofileName + "Scheduling");
                }
                Thread.Sleep(60000);
            }
        }
    }
}
