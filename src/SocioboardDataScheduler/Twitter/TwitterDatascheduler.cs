using SocioboardDataScheduler.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Twitter
{
    public class TwitterDatascheduler
    {
        public void ScheduleTwitterMessage()
        {
            while (true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
                foreach (var item in lstScheduledMessage)
                {
                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                    TwitterScheduler.PostTwitterMessage(item);
                    Console.WriteLine(item.socialprofileName + "Scheduling");
                }
                Thread.Sleep(60000);
            }
        }
    }
}
