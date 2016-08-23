using SocioboardDataScheduler.Model;
using SocioboardDataScheduler.Facebook;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace SocioboardDataScheduler.Facebook
{
    public class FacebookDataScheduler
    {
        
        public void ScheduleFacebookMessage()
        {
            while(true)
            {
                DatabaseRepository dbr = new DatabaseRepository();
                List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook && t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage).ToList();
                foreach (var item in lstScheduledMessage)
                {
                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                    FacebookScheduler.PostFacebookMessage(item);
                    Console.WriteLine(item.socialprofileName + "Scheduling");
                }
                Thread.Sleep(60000);
            }
        }
    }
}
