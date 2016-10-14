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
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending && (t.profileType == Domain.Socioboard.Enum.SocialProfileType.Facebook || t.profileType == Domain.Socioboard.Enum.SocialProfileType.FacebookFanPage)&& t.scheduleTime <= DateTime.UtcNow).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();
                   
                    foreach (var items in newlstScheduledMessage)
                    {
                        try
                        {
                            Domain.Socioboard.Models.Facebookaccounts _facebook = dbr.Single<Domain.Socioboard.Models.Facebookaccounts>(t => t.FbUserId == items.Key && t.IsAccessTokenActive);
                            if (_facebook!=null)
                            {
                                foreach (var item in items)
                                {
                                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                                    FacebookScheduler.PostFacebookMessage(item, _facebook);
                                    Console.WriteLine(item.socialprofileName + "Scheduling");
                                }
                                _facebook.SchedulerUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.Facebookaccounts>(_facebook);
                            }
                        }
                        catch (Exception ex)
                        {
                          //  Thread.Sleep(60000);
                        }
                    }
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                    
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
            }
        }
    }
}
