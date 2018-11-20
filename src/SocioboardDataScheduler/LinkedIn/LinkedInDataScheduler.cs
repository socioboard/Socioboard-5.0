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
        //public static Semaphore objSemaphoreacc = new Semaphore(5, 10);
        //public static Semaphore objSemaphorepage = new Semaphore(5, 10);
        public void ScheduleLinkedInMessage()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.ScheduledMessage> lstScheduledMessage = dbr.Find<Domain.Socioboard.Models.ScheduledMessage>(t => (t.profileType == Domain.Socioboard.Enum.SocialProfileType.LinkedIn && t.status == Domain.Socioboard.Enum.ScheduleStatus.Pending) && t.scheduleTime <= DateTime.UtcNow).ToList();
                    var newlstScheduledMessage = lstScheduledMessage.GroupBy(t => t.profileId).ToList();

                    foreach (var items in newlstScheduledMessage)
                    {
                        try
                        {
                            Domain.Socioboard.Models.LinkedInAccount _LinkedInAccount = dbr.Find<Domain.Socioboard.Models.LinkedInAccount>(t => t.LinkedinUserId == items.Key && t.IsActive).FirstOrDefault();
                            Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _LinkedInAccount.UserId);
                            if (_LinkedInAccount!=null)
                            {
                                foreach (var item in items)
                                {
                                    try
                                    {
                                        Console.WriteLine(item.socialprofileName + "Scheduling Started");
                                        LinkedInScheduler.PostLinkedInMessage(item, _LinkedInAccount, _user);
                                        Console.WriteLine(item.socialprofileName + "Scheduling");
                                    }
                                    catch (Exception)
                                    {
                                        
                                    }
                                }
                                _LinkedInAccount.SchedulerUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.LinkedInAccount>(_LinkedInAccount);
                                Thread.Sleep(10000); 
                            }
                        }
                        catch (Exception)
                        {

                            Thread.Sleep(10000);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(10000);
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

                            Domain.Socioboard.Models.LinkedinCompanyPage _LinkedinCompanyPage = dbr.Find<Domain.Socioboard.Models.LinkedinCompanyPage>(t => t.LinkedinPageId == items.Key && t.IsActive).FirstOrDefault();
                            Domain.Socioboard.Models.User _user = dbr.Single<Domain.Socioboard.Models.User>(t => t.Id == _LinkedinCompanyPage.UserId);
                            if (_LinkedinCompanyPage!=null)
                            {
                                foreach (var item in lstScheduledMessage)
                                {
                                    try
                                    {
                                        Console.WriteLine(item.socialprofileName + "Scheduling Started");
                                        LinkedInCompanyPageScheduler.PostLinkedInCompanyPageMessage(item, _LinkedinCompanyPage, _user);
                                        Console.WriteLine(item.socialprofileName + "Scheduling");
                                    }
                                    catch (Exception)
                                    {
                                        
                                    }
                                }
                                _LinkedinCompanyPage.SchedulerUpdate = DateTime.UtcNow;
                                dbr.Update<Domain.Socioboard.Models.LinkedinCompanyPage>(_LinkedinCompanyPage);
                                Thread.Sleep(10000); 
                            }
                        }
                        catch (Exception)
                        {

                            Thread.Sleep(10000);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(10000);
                }
            }
        }
    }
}
