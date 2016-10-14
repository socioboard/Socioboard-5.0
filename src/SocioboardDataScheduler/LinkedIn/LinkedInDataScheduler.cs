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
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn && t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {
                        try
                        {
                            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = dbr.Single<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId == items.Key && t.IsActive);
                            if (_LinkedInAccount!=null)
                            {
                                foreach (var item in items)
                                {
                                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                                    LinkedInScheduler.PostLinkedInMessage(item, _LinkedInAccount);
                                    Console.WriteLine(item.socialprofileName + "Scheduling");
                                }
                                _LinkedInAccount.SchedulerUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.LinkedInAccount>(_LinkedInAccount);
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
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(60000);
                }
            }
        }
        public void ScheduleLinkedInCompanyPageMessage()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedInComapanyPage && t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {
                        try
                        {

                            Domain.Socioboard.Models.LinkedinCompanyPage _LinkedinCompanyPage = dbr.Single<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.LinkedinPageId == items.Key && t.IsActive);
                            if (_LinkedinCompanyPage!=null)
                            {
                                foreach (var item in lstScheduledMessage)
                                {
                                    Console.WriteLine(item.socialprofileName + "Scheduling Started");
                                    LinkedInCompanyPageScheduler.PostLinkedInCompanyPageMessage(item, _LinkedinCompanyPage);
                                    Console.WriteLine(item.socialprofileName + "Scheduling");
                                }
                                _LinkedinCompanyPage.SchedulerUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(_LinkedinCompanyPage);
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
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(60000);
                }
            }
        }
    }
}
