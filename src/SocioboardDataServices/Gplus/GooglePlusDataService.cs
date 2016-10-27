using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SocioboardDataServices.Gplus
{
    public class GooglePlusDataService
    {
        public void UpdateGooglePlusAccount()
        {
            while (true)
            {

                try
                {

                    Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                    oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(Helper.AppSettings.GoogleConsumerKey,Helper.AppSettings.GoogleConsumerSecret,Helper.AppSettings.GoogleRedirectUri);
                    oAuthToken objToken = new oAuthToken(Helper.AppSettings.GoogleConsumerKey, Helper.AppSettings.GoogleConsumerSecret, Helper.AppSettings.GoogleRedirectUri);
                    JObject userinfo = new JObject();
                    List<Domain.Socioboard.Models.Googleplusaccounts> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.Googleplusaccounts>(t => t.IsActive).ToList();
                  
                    foreach (var item in lstTwtAccounts)
                    {
                        Domain.Socioboard.Models.Groupprofiles _grpProfile = dbr.Single<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(item.GpUserId));
                        try
                        {
                            if (item.LastUpdate.AddHours(1) <= DateTime.UtcNow)
                            {
                                if (item.IsActive)
                                {
                                    try
                                    {
                                        string objRefresh = ObjoAuthTokenGPlus.GetAccessToken(item.RefreshToken);
                                        JObject objaccesstoken = JObject.Parse(objRefresh);
                                        string access_token = objaccesstoken["access_token"].ToString();
                                        string user = objToken.GetUserInfo("self", access_token);
                                        userinfo = JObject.Parse(JArray.Parse(user)[0].ToString());
                                        string people = objToken.GetPeopleInfo("self", access_token, item.GpUserId);
                                        userinfo = JObject.Parse(JArray.Parse(people)[0].ToString());

                                        try
                                        {
                                            item.GpUserName = userinfo["displayName"].ToString();
                                        }
                                        catch
                                        {
                                            try
                                            {
                                                item.GpUserName = userinfo["name"].ToString();
                                            }
                                            catch { }
                                        }
                                        try
                                        {
                                            item.GpProfileImage = Convert.ToString(userinfo["image"]["url"]);
                                            _grpProfile.profilePic = Convert.ToString(userinfo["image"]["url"]);
                                        }
                                        catch
                                        {
                                            try
                                            {
                                                item.GpProfileImage = Convert.ToString(userinfo["picture"]);
                                                _grpProfile.profilePic = Convert.ToString(userinfo["picture"]);
                                            }
                                            catch { }

                                        }
                                        try
                                        {
                                            item.about = Convert.ToString(userinfo["tagline"]);
                                        }
                                        catch
                                        {
                                            item.about = item.about;
                                        }
                                        try
                                        {
                                            item.college = Convert.ToString(userinfo["organizations"][0]["name"]);
                                        }
                                        catch
                                        {
                                            item.college = item.college;
                                        }
                                        try
                                        {
                                            item.coverPic = Convert.ToString(userinfo["cover"]["coverPhoto"]["url"]);
                                        }
                                        catch
                                        {
                                            item.coverPic = item.coverPic;
                                        }
                                        try
                                        {
                                            item.education = Convert.ToString(userinfo["organizations"][0]["type"]);
                                        }
                                        catch
                                        {
                                            item.education = item.education;
                                        }
                                        try
                                        {
                                            item.EmailId = Convert.ToString(userinfo["emails"][0]["value"]);
                                        }
                                        catch
                                        {
                                            item.EmailId = item.EmailId;
                                        }
                                        try
                                        {
                                            item.gender = Convert.ToString(userinfo["gender"]);
                                        }
                                        catch
                                        {
                                            item.gender = item.gender;
                                        }
                                        try
                                        {
                                            item.workPosition = Convert.ToString(userinfo["occupation"]);
                                        }
                                        catch
                                        {
                                            item.workPosition = item.workPosition;
                                        }

                                        #region Get_InYourCircles
                                        try
                                        {
                                            string _InyourCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleList.Replace("[userId]", item.GpUserId).Replace("[collection]", "visible") + "?key=AIzaSyBmQ1X1UBnKi3V78EkLuh7UHk5odrGfp5M", item.AccessToken);
                                            JObject J_InyourCircles = JObject.Parse(_InyourCircles);
                                            item.InYourCircles = Convert.ToInt32(J_InyourCircles["totalItems"].ToString());
                                        }
                                        catch (Exception ex)
                                        {
                                            item.InYourCircles = item.InYourCircles;
                                        }
                                        #endregion

                                        #region Get_HaveYouInCircles
                                        try
                                        {
                                            string _HaveYouInCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleProfile + item.GpUserId + "?key=AIzaSyBmQ1X1UBnKi3V78EkLuh7UHk5odrGfp5M", item.AccessToken);
                                            JObject J_HaveYouInCircles = JObject.Parse(_HaveYouInCircles);
                                            item.HaveYouInCircles = Convert.ToInt32(J_HaveYouInCircles["circledByCount"].ToString());
                                        }
                                        catch (Exception ex)
                                        {
                                            item.HaveYouInCircles = item.HaveYouInCircles;
                                        }
                                        #endregion

                                        dbr.Update<Domain.Socioboard.Models.Googleplusaccounts>(item);
                                        dbr.Update<Domain.Socioboard.Models.Groupprofiles>(_grpProfile);
                                        GooglePlusFeed.GetUserActivities(item.GpUserId, access_token);

                                        item.LastUpdate = DateTime.UtcNow;
                                        dbr.Update<Domain.Socioboard.Models.Googleplusaccounts>(item);
                                    }
                                    catch (Exception)
                                    {
                                        Thread.Sleep(600000);
                                    }
                                }
                            }

                        }
                        catch (Exception ex)
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


        public void UpadateGoogleAnalyticsAccount()
        {
            while (true)
            {

                try
                {
                    Helper.DatabaseRepository dbr = new Helper.DatabaseRepository();
                    oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus("246221405801-5sg3n6bfpj329ie7tiqfdnb404pc78ea.apps.googleusercontent.com", "S5B4EtNKIe-1yHq4xEtXHCHK", "https://www.socioboard.com/GoogleManager/Google");
                    Analytics _Analytics = new Analytics("246221405801-5sg3n6bfpj329ie7tiqfdnb404pc78ea.apps.googleusercontent.com", "S5B4EtNKIe-1yHq4xEtXHCHK", "https://www.socioboard.com/GoogleManager/Google");
                    List<Domain.Socioboard.Models.GoogleAnalyticsAccount> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.GoogleAnalyticsAccount>(t => t.IsActive).ToList();
                  
                    foreach (var item in lstTwtAccounts)
                    {
                        try
                        {
                            if (item.LastUpdate.AddHours(1) <= DateTime.UtcNow)
                            {
                                if (item.IsActive)
                                {
                                    try
                                    {
                                        string objRefresh = ObjoAuthTokenGPlus.GetAccessToken(item.RefreshToken);
                                        JObject objaccesstoken = JObject.Parse(objRefresh);
                                        string access_token = objaccesstoken["access_token"].ToString();
                                        string analytics = _Analytics.getAnalyticsData(item.GaProfileId, "ga:visits,ga:pageviews", DateTime.UtcNow.AddDays(-7).ToString("yyyy-MM-dd"), DateTime.UtcNow.ToString("yyyy-MM-dd"), access_token);
                                        JObject JData = JObject.Parse(analytics);
                                        string visits = JData["totalsForAllResults"]["ga:visits"].ToString();
                                        string pageviews = JData["totalsForAllResults"]["ga:pageviews"].ToString();
                                        item.Views = Double.Parse(pageviews);
                                        item.Visits = Double.Parse(visits);
                                        item.LastUpdate = DateTime.UtcNow;
                                        dbr.Update<Domain.Socioboard.Models.GoogleAnalyticsAccount>(item);
                                    }
                                    catch (Exception ex)
                                    {
                                        Thread.Sleep(600000);
                                    }
                                }
                            }
                        }
                        catch (Exception)
                        {
                            Thread.Sleep(600000);
                        }
                        Thread.Sleep(600000);
                    }
                }
                catch
                {

                }
            }
        }
    }
}
