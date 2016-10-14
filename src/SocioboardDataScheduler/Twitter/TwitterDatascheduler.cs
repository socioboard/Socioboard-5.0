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
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && t.profileType == Domain.Socioboard.Enum.SocialProfileType.Twitter).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {
                        try
                        {

                            Domain.Socioboard.Models.TwitterAccount _TwitterAccount = dbr.Single<Domain.Socioboard.Models.TwitterAccount>(t => t.twitterUserId == items.Key && t.isActive);
                            if (_TwitterAccount!=null)
                            {
                                foreach (var item in items)
                                {
                                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                                    TwitterScheduler.PostTwitterMessage(item, _TwitterAccount);
                                    Console.WriteLine(item.socialprofileName + "Scheduling");
                                }
                                _TwitterAccount.SchedulerUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.TwitterAccount>(_TwitterAccount);
                                Thread.Sleep(60000); 
                            }
                        }
                        catch (Exception)
                        {
                            Thread.Sleep(60000);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling"+ex.StackTrace);
                    Thread.Sleep(60000);
                }
            }
        }
    }
}
