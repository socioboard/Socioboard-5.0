using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using Socioboard.Helpers;

namespace Socioboard.Controllers
{
    public class FacebookManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;

        public FacebookManagerController(ILogger<FacebookManagerController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }

        [HttpGet]
        public ActionResult getFbLoginUrl()
        {
            HttpContext.Session.SetObjectAsJson("fblogin", "Fb_Login");
            return Content(Socioboard.Facebook.Auth.Authentication.GetFacebookRedirectLink(_appSettings.FacebookAuthUrl, _appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl));
        }

        [HttpGet]
        public async Task<ActionResult> Facebook(string code)
        {
            string fbLogin = HttpContext.Session.GetObjectFromJson<string>("fblogin");
            string fbSocial = HttpContext.Session.GetObjectFromJson<string>("fbSocial");
            if (!string.IsNullOrEmpty(fbLogin) && fbLogin.Equals("Fb_Login"))
            {
                HttpContext.Session.SetObjectAsJson("fblogin", null);
                string accessToken = string.Empty;
                try
                {
                    accessToken = Socioboard.Facebook.Auth.Authentication.getAccessToken(_appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl, _appSettings.FacebookClientSecretKey, code);
                 }
                catch (Exception ex)
                {
                    _logger.LogInformation(ex.Message);
                    _logger.LogError(ex.StackTrace);
                    return Content("Issue with Token");
                }

                 Domain.Socioboard.Models.User user = null;
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("AccessToken", accessToken));
                HttpResponseMessage response = await WebApiReq.PostReq("/api/User/FacebookLogin", Parameters, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                        HttpContext.Session.SetObjectAsJson("User", user);
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            TempData["Error"] = await response.Content.ReadAsStringAsync();
                            return RedirectToAction("Index", "Index");
                        }
                        catch (Exception exe) { }
                    }

                }
                return RedirectToAction("Index", "Home");
            }
            else if (fbSocial.Equals("Fb_Account"))
            {
                HttpContext.Session.SetObjectAsJson("fbSocial", null);
                return RedirectToAction("AddFbAcc", "FacebookManager", new { code = code });
            }
            else if (fbSocial.Equals("Fb_Page"))
            {
                HttpContext.Session.SetObjectAsJson("fbSocial", null);
                return RedirectToAction("AddFbPage", "FacebookManager", new { code = code });
            }




            return RedirectToAction("Index", "Index");
        }


        [HttpGet]
        public async Task<ActionResult> AddFacebookAcc(string Op)
        {
            int count = 0;
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            string profileCount = await ProfilesHelper.GetUserProfileCount(user.Id, _appSettings, _logger);
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
                    HttpContext.Session.SetObjectAsJson("fbSocial", "Fb_Account");
                }
                else
                {
                    HttpContext.Session.SetObjectAsJson("fbSocial", "Fb_Page");
                 
                }
                return Redirect(Socioboard.Facebook.Auth.Authentication.GetFacebookRedirectLink(_appSettings.FacebookAuthUrl, _appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl));
            }
           

        }



        public async Task<ActionResult> AddFbAcc(string code)
        {
            string accessToken = string.Empty;
            try
            {
                accessToken = Socioboard.Facebook.Auth.Authentication.getAccessToken(_appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl, _appSettings.FacebookClientSecretKey, code);
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                TempData["Error"] = "Issue with Token";
                return RedirectToAction("Index", "Home");
            }
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("accessToken", accessToken));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/Facebook/AddFacebookAccount", Parameters, "", "", _appSettings.ApiDomain);
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


        public async Task<ActionResult> AddFbPage(string code)
        {
            string accessToken = string.Empty;
            try
            {
                accessToken = Socioboard.Facebook.Auth.Authentication.getAccessToken(_appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl, _appSettings.FacebookClientSecretKey, code);
            }
            catch (Exception ex)
            {
                _logger.LogInformation(ex.Message);
                _logger.LogError(ex.StackTrace);
                TempData["Error"] = "Issue with Token";
                return RedirectToAction("Index", "Home");
            }
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("accesstoken", accessToken));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/Facebook/GetFacebookPages", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                List<Domain.Socioboard.Models.Facebookpage>lstpages = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Facebookpage>>();
                if (lstpages.Count > 0)
                {
                    TempData["fbPages"] = Newtonsoft.Json.JsonConvert.SerializeObject(lstpages);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    TempData["Error"] = "No page linked with this account";
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
