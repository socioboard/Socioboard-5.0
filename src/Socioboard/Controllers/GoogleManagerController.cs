using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Domain.Socioboard.Enum;

namespace Socioboard.Controllers
{
    public class GoogleManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;

        public GoogleManagerController(Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings, ILogger<FacebookManagerController> logger)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }


        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<ActionResult> Google(string code)
        {
            var googleLogin = HttpContext.Session.GetObjectFromJson<string>("googlepluslogin");
            var googleSocial = HttpContext.Session.GetObjectFromJson<string>("Google");
            var plan = HttpContext.Session.GetObjectFromJson<string>("RegisterPlan");

            if (googleSocial == "Youtube_Account" || googleSocial == "Ganalytics_Account")
                googleLogin = null;

       
            if (googleLogin != null && googleLogin.Equals("Google_Login"))
            {
                try
                {
                    var parameters = new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("code", code),
                        new KeyValuePair<string, string>("accType", plan)
                    };

                    var response = await WebApiReq.PostReq("/api/Google/GoogleLogin", parameters, "", "", _appSettings.ApiDomain);

                    if (!response.IsSuccessStatusCode)
                        return RedirectToAction("Index", "Home");

                    try
                    {
                        var user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();

                        // If expired, make user to use free plan
                        if (user.ExpiryDate < DateTime.UtcNow)
                        {
                            HttpContext.Session.Remove("User");

                            var param = new List<KeyValuePair<string, string>>
                            {
                                new KeyValuePair<string, string>("Id", user.Id.ToString())
                            };

                            var trialStatus = await WebApiReq.PostReq("/api/User/UpdateTrialStatus", param, "", "", _appSettings.ApiDomain);

                            if (!trialStatus.IsSuccessStatusCode)
                                return RedirectToAction("Index", "Payment");

                            var userDetails = await trialStatus.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                            HttpContext.Session.SetObjectAsJson("User", userDetails);
                            return RedirectToAction("Index", "Home");
                        }

                        HttpContext.Session.SetObjectAsJson("User", user);
                    }
                    catch (Exception)
                    {
                        try
                        {
                            HttpContext.Session.Remove("User");
                            TempData["Error"] = await response.Content.ReadAsStringAsync();
                            return RedirectToAction("Index", "Index");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex.StackTrace);
                        }
                    }
                    return RedirectToAction("Index", "Home");

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex.StackTrace);
                    HttpContext.Session.Remove("User");
                    return RedirectToAction("Index", "Index");
                }             
            }


            if (googleSocial.Equals("Gplus_Account"))
            {
                HttpContext.Session.SetObjectAsJson("Google", null);
                return RedirectToAction("AddGoogleAcc", "GoogleManager", new { code = code });
            }
            if (googleSocial.Equals("Ganalytics_Account"))
            {
                HttpContext.Session.SetObjectAsJson("Google", null);
                return RedirectToAction("AddGanalyticsAcc", "GoogleManager", new { code = code });
            }
            if (googleSocial.Equals("ReconGplusAccount"))
            {
                HttpContext.Session.SetObjectAsJson("Google", null);
                return RedirectToAction("ReconnectGplusAcc", "GoogleManager", new { code = code });
            }
            if (googleSocial.Equals("ReconnectYTAcc"))
            {
                HttpContext.Session.SetObjectAsJson("Google", null);
                return RedirectToAction("ReconnectYTAcc", "GoogleManager", new { code = code });
            }
            if (googleSocial.Equals("Youtube_Account"))
            {
                HttpContext.Session.SetObjectAsJson("Google", null);
                return RedirectToAction("AddYoutubeAcc", "GoogleManager", new { code = code });
            }
            return View();
        }

        [HttpGet]
        public ActionResult getGoogleLoginUrl(string plan)
        {
            HttpContext.Session.SetObjectAsJson("googlepluslogin", "Google_Login");
            if (!string.IsNullOrEmpty(plan))
            {
                HttpContext.Session.SetObjectAsJson("RegisterPlan", plan);
            }
            var googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/plus.media.upload+https://www.googleapis.com/auth/plus.stream.write&response_type=code&access_type=offline";
            return Content(googleurl);
        }


        [HttpGet]
        public async Task<ActionResult> AddGoogleAccount(string Op)
        {
            int count = 0;
            string profileCount = "";
            List<Domain.Socioboard.Models.Groups> groups = new List<Domain.Socioboard.Models.Groups>();
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            HttpResponseMessage response = await WebApiReq.GetReq("/api/Groups/GetUserGroups?userId=" + user.Id, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                    groups = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groups>>();
                }
                catch { }
            }
            string sessionSelectedGroupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            if (!string.IsNullOrEmpty(sessionSelectedGroupId))
            {
                HttpResponseMessage groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetGroupProfiles?groupId=" + sessionSelectedGroupId, "", "", _appSettings.ApiDomain);
                if (groupProfilesResponse.IsSuccessStatusCode)
                {
                    List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groupprofiles>>();
                    profileCount = groupProfiles.Count.ToString();
                }
            }
            else
            {
                long selectedGroupId = groups.FirstOrDefault(t => t.groupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName).id;
                HttpContext.Session.SetObjectAsJson("selectedGroupId", selectedGroupId);
                ViewBag.selectedGroupId = selectedGroupId;
                HttpResponseMessage groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetGroupProfiles?groupId=" + selectedGroupId, "", "", _appSettings.ApiDomain);
                if (groupProfilesResponse.IsSuccessStatusCode)
                {
                    List<Domain.Socioboard.Models.Groupprofiles> groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groupprofiles>>();
                    profileCount = groupProfiles.Count.ToString();
                }
            }
            //string profileCount = await ProfilesHelper.GetUserProfileCount(user.Id, _appSettings, _logger);
            try
            {
                count = Convert.ToInt32(profileCount);
            }
            catch (Exception ex)
            {
                TempData["Error"] = "Error while getting profile count.";
                return RedirectToAction("Index", "Home");
            }

            int MaxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(user.AccountType);
            if (count >= MaxCount)
            {
                TempData["Error"] = "Max profile Count reached.";
                return RedirectToAction("Index", "Home");
            }
            else
            {
                if (string.IsNullOrEmpty(Op))
                {
                    HttpContext.Session.SetObjectAsJson("Google", "Gplus_Account");
                    string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/plus.media.upload+https://www.googleapis.com/auth/plus.stream.write+https://www.googleapis.com/auth/plus.stream.read+https://www.googleapis.com/auth/plus.circles.read&response_type=code&access_type=offline&approval_prompt=force&access.domainRestricted=true";
                    return Redirect(googleurl);
                }
                else if (Op == "page")
                {
                    HttpContext.Session.SetObjectAsJson("Google", "Ganalytics_Account");
                    string googleurl = "https://accounts.google.com/o/oauth2/auth?approval_prompt=force&access_type=offline&client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/analytics+https://www.googleapis.com/auth/analytics.edit+https://www.googleapis.com/auth/analytics.readonly&response_type=code";
                    return Redirect(googleurl);
                }
                else
                {
                    HttpContext.Session.SetObjectAsJson("Google", "Youtube_Account");
                    string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/youtube.force-ssl&response_type=code&access_type=offline&approval_prompt=force";
                    return Redirect(googleurl);
                }
            }

        }


        [HttpGet]
        public async Task<ActionResult> AddGoogleAcc(string code)
        {
            string res = string.Empty;
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("code", code));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/Google/AddGoogleAccount", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                TempData["Success"] = await response.Content.ReadAsStringAsync();
                return RedirectToAction("Index", "Home");
            }
            else
            {
                TempData["Error"] = await response.Content.ReadAsStringAsync();
                return RedirectToAction("Index", "Home");
            }
        }


        [HttpGet]
        public async Task<ActionResult> AddGanalyticsAcc(string code)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("code", code));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/Google/GetGanalyticsAccount", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles> lstpages = await response.Content.ReadAsAsync<List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles>>();
                if (lstpages.Count > 0)
                {
                    TempData["Ganalytics"] = Newtonsoft.Json.JsonConvert.SerializeObject(lstpages);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    TempData["Error"] = "Access token not found";
                    return RedirectToAction("Index", "Home");
                }
            }
            else
            {
                TempData["Error"] = "Error while hitting api.";
                return RedirectToAction("Index", "Home");
            }
        }


        [HttpGet]
        public async Task<ActionResult> AddYoutubeAcc(string code)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("code", code));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/Google/GetYoutubeAccount", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                List<Domain.Socioboard.ViewModels.YoutubeProfiles> lstpages = await response.Content.ReadAsAsync<List<Domain.Socioboard.ViewModels.YoutubeProfiles>>();
                if (lstpages.Count > 0)
                {
                    TempData["Youtube"] = Newtonsoft.Json.JsonConvert.SerializeObject(lstpages);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    TempData["Error"] = "Access Token Not Found";
                    return RedirectToAction("Index", "Home");
                }
            }
            else
            {
                TempData["Error"] = "Error while hitting api.";
                return RedirectToAction("Index", "Home");
            }
        }


        [Route("socioboard/ReconnGoacc/")]
        [HttpGet("ReconnGoacc")]
        public ActionResult ReconnGoacc(string option)
        {
            return RedirectToAction("ReconnectGoogle", "GoogleManager", new { option = option });

            // return Content(Socioboard.Facebook.Auth.Authentication.GetFacebookRedirectLink(_appSettings.FacebookAuthUrl, _appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl));
        }

        [HttpGet]
        public async Task<ActionResult> ReconnectGoogle(string option)
        {
            int count = 0;
            string profileCount = "";
            // List<Domain.Socioboard.Models.Groups> groups = new List<Domain.Socioboard.Models.Groups>();
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");


            if (option == "recgplus")
            {
                HttpContext.Session.SetObjectAsJson("Google", "ReconGplusAccount");
                string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/plus.media.upload+https://www.googleapis.com/auth/plus.stream.write+https://www.googleapis.com/auth/plus.stream.read+https://www.googleapis.com/auth/plus.circles.read&response_type=code&access_type=offline&approval_prompt=force&access.domainRestricted=true";
                // string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/plus.media.upload+https://www.googleapis.com/auth/plus.stream.write+https://www.googleapis.com/auth/plus.stream.read+https://www.googleapis.com/auth/plus.circles.read+https://www.googleapis.com/auth/plus.circles.write&response_type=code&access_type=offline&approval_prompt=force&access.domainRestricted=true";
                return Content(googleurl);
            }

            else
            {
                HttpContext.Session.SetObjectAsJson("Google", "ReconnectYTAcc");
                string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/youtube.force-ssl&response_type=code&access_type=offline&approval_prompt=force";
                return Content(googleurl);
            }
        }

        public async Task<ActionResult> ReconnectGplusAcc(string code)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            // string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("code", code));
            //Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/Google/RecGoogleAccount", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                TempData["Success"] = await response.Content.ReadAsStringAsync();
                return RedirectToAction("Index", "Home");
            }
            else
            {
                TempData["Error"] = "Error while hitting api.";
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpGet]
        public async Task<ActionResult> ReconnectYTAcc(string code)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("code", code));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));

            HttpResponseMessage response = await WebApiReq.PostReq("/api/Google/GetReconnYtAccDetail", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                List<Domain.Socioboard.ViewModels.YoutubeProfiles> lstpages = await response.Content.ReadAsAsync<List<Domain.Socioboard.ViewModels.YoutubeProfiles>>();
                if (lstpages.Count > 0)
                {
                    TempData["ReconnectYoutube"] = Newtonsoft.Json.JsonConvert.SerializeObject(lstpages);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    TempData["Error"] = "Access Token Not Found";
                    return RedirectToAction("Index", "Home");
                }
            }
            else
            {
                TempData["Error"] = "Error while hitting api.";
                return RedirectToAction("Index", "Home");
            }
        }

    }
}
