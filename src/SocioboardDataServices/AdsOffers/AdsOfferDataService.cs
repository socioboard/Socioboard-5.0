using SocioboardDataServices.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using SocioboardDataServices.Helper;

namespace SocioboardDataServices.AdsOffers
{
    public class AdsOfferDataService
    {
        public void FindAdsOfferUrl()
        {
            while (true)
            {
                try
                {
                    DatabaseRepository dbr = new DatabaseRepository();
                    List<Domain.Socioboard.Models.AdsOffers> lstadsAcc = dbr.Find<Domain.Socioboard.Models.AdsOffers>(t => t.adsaccountstatus==Domain.Socioboard.Enum.AdsOfferAccountStatus.Active && t.Verified==Domain.Socioboard.Enum.AdsStatus.Verified && (t.Verifieddate<=DateTime.UtcNow.Date || t.Verifieddate ==null)).ToList();
                    foreach (var item in lstadsAcc)
                    {
                        try
                        {
                            Console.WriteLine(item.EmailId + "Find URL Started");
                            string lstcontent = findUrlForAds(item.WebsiteUrl);
                            if(lstcontent== "Ads found on website")
                            {
                               // item.Verified = Domain.Socioboard.Enum.AdsStatus.Verified;
                                item.Verifieddate = DateTime.UtcNow.Date.AddDays(1);
                                //item.adsaccountstatus = Domain.Socioboard.Enum.AdsOfferAccountStatus.Active;
                                int SavedUserStatus = dbr.Update<Domain.Socioboard.Models.AdsOffers>(item);
                                Console.WriteLine(item.EmailId + " has active ads on "+item.WebsiteUrl+" URL");
                            }
                            else
                            {
                                item.Verified = Domain.Socioboard.Enum.AdsStatus.NotVerified;
                                //item.Verifieddate = DateTime.UtcNow.Date.AddDays(1);
                                item.adsaccountstatus = Domain.Socioboard.Enum.AdsOfferAccountStatus.InActive;
                                int SavedAdsStatus = dbr.Update<Domain.Socioboard.Models.AdsOffers>(item);
                                if(SavedAdsStatus == 1)
                                {
                                    IList<Domain.Socioboard.Models.User> lstUser = dbr.Find<Domain.Socioboard.Models.User>(t => t.Id == item.UserId);
                                    lstUser.First().Adsstatus = Domain.Socioboard.Enum.AdsStatus.NotVerified;
                                    lstUser.First().TrailStatus = Domain.Socioboard.Enum.UserTrailStatus.free;
                                    lstUser.First().PaymentType = Domain.Socioboard.Enum.PaymentType.paypal;
                                    lstUser.First().PayPalAccountStatus = Domain.Socioboard.Enum.PayPalAccountStatus.notadded;
                                    lstUser.First().AccountType = Domain.Socioboard.Enum.SBAccountType.Free;
                                    lstUser.First().PaymentStatus = Domain.Socioboard.Enum.SBPaymentStatus.UnPaid;
                                    int SavedUserStatus = dbr.Update<Domain.Socioboard.Models.User>(lstUser.First());
                                }
                                Console.WriteLine(item.EmailId + " has not active ads on " + item.WebsiteUrl + " URL");
                            }
                            Console.WriteLine(item.EmailId + " Find URL Completed");
                        }
                        catch
                        {
                            Thread.Sleep(600000);
                        }
                    }
                    Thread.Sleep(600000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("issue in web api calling" + ex.StackTrace);
                    Thread.Sleep(600000);
                }
            }



        }
        public static string findUrlForAds(string url)
        {
            try
            {
                string keywords = "https://www.socioboard.com";
                Domain.Socioboard.Helpers.UrlRSSfeedsNews obj_reqest = new Domain.Socioboard.Helpers.UrlRSSfeedsNews();
                //Globalrequest obj_reqest = new Globalrequest();
                string sourceurl = url;
                string responce_sourceurl = obj_reqest.getHtmlfromUrl(new Uri(sourceurl));
                if (keywords != null && responce_sourceurl.Contains(keywords))
                {
                    return "Ads found on website";
                }
                else
                {
                    return "Ads not found on website";
                }
            }
            catch (Exception ex)
            {
                return "Something went wrong please try after sometime";
            }
        }

        public static string getBetween(string strSource, string strStart, string strEnd)
        {
            int Start, End;
            if (strSource.Contains(strStart) && strSource.Contains(strEnd))
            {
                Start = strSource.IndexOf(strStart, 0) + strStart.Length;
                End = strSource.IndexOf(strEnd, Start);
                return strSource.Substring(Start, End - Start);
            }
            else
            {
                return "";
            }
        }

    }
}
