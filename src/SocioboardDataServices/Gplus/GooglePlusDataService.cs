using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod;
using SocioboardDataServices.Helper;
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
                    oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    oAuthToken objToken = new oAuthToken(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    JObject userinfo = new JObject();
                    List<Domain.Socioboard.Models.Googleplusaccounts> lstTwtAccounts = dbr.Find<Domain.Socioboard.Models.Googleplusaccounts>(t => t.IsActive).ToList();
                
                    foreach (var item in lstTwtAccounts)
                    {

                        List<Domain.Socioboard.Models.Groupprofiles> _grpProfile = dbr.Find<Domain.Socioboard.Models.Groupprofiles>(t => t.profileId.Contains(item.GpUserId)).ToList();
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
                                            _grpProfile.Select(s => { s.profilePic = Convert.ToString(userinfo["image"]["url"]); return s; }).ToList();
                                        }
                                        catch
                                        {
                                            try
                                            {
                                                item.GpProfileImage = Convert.ToString(userinfo["picture"]);
                                                _grpProfile.Select(s => { s.profilePic = Convert.ToString(userinfo["picture"]); return s; }).ToList();

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
                                            string _InyourCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleList.Replace("[userId]", item.GpUserId).Replace("[collection]", "visible") + "?key=" + AppSettings.googleApiKey, item.AccessToken);
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
                                            string _HaveYouInCircles = ObjoAuthTokenGPlus.APIWebRequestToGetUserInfo(Globals.strGetPeopleProfile + item.GpUserId + "?key=" + AppSettings.googleApiKey, item.AccessToken);
                                            JObject J_HaveYouInCircles = JObject.Parse(_HaveYouInCircles);
                                            item.HaveYouInCircles = Convert.ToInt32(J_HaveYouInCircles["circledByCount"].ToString());
                                        }
                                        catch (Exception ex)
                                        {
                                            item.HaveYouInCircles = item.HaveYouInCircles;
                                        }
                                        #endregion

                                        dbr.Update<Domain.Socioboard.Models.Googleplusaccounts>(item);
                                        foreach (var item_grpProfile in _grpProfile)
                                        {
                                            dbr.Update<Domain.Socioboard.Models.Groupprofiles>(item_grpProfile);
                                        }
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
                    oAuthTokenGPlus ObjoAuthTokenGPlus = new oAuthTokenGPlus(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
                    Analytics _Analytics = new Analytics(AppSettings.googleClientId, AppSettings.googleClientSecret, AppSettings.googleRedirectionUrl);
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
