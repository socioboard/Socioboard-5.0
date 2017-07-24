using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Helpers;
using Socioboard.Extensions;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Socioboard.Pinterest.Auth;
using Microsoft.AspNetCore.Mvc.Filters;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Socioboard.Controllers
{
    public class PinterestManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;

        public PinterestManagerController(ILogger<PinterestManagerController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }
        //public override void OnActionExecuting(ActionExecutingContext filterContext)
        //{
        //    Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
        //    Domain.Socioboard.Models.SessionHistory session = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.SessionHistory>("revokedata");
        //    if (session != null)
        //    {
        //        SortedDictionary<string, string> strdi = new SortedDictionary<string, string>();
        //        strdi.Add("systemId", session.systemId);
        //        string respo = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/checksociorevtoken", strdi, _appSettings.ApiDomain);
        //        if (respo != "false")
        //        {
        //            if (user != null)
        //            {
        //                SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
        //                strdic.Add("UserName", user.EmailId);
        //                if (string.IsNullOrEmpty(user.Password))
        //                {
        //                    strdic.Add("Password", "sociallogin");
        //                }
        //                else
        //                {
        //                    strdic.Add("Password", user.Password);
        //                }


        //                string response = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/CheckUserLogin", strdic, _appSettings.ApiDomain);

        //                if (!string.IsNullOrEmpty(response))
        //                {
        //                    Domain.Socioboard.Models.User _user = Newtonsoft.Json.JsonConvert.DeserializeObject<Domain.Socioboard.Models.User>(response);
        //                    HttpContext.Session.SetObjectAsJson("User", _user);
        //                }
        //                else
        //                {
        //                    HttpContext.Session.Remove("User");
        //                    HttpContext.Session.Remove("selectedGroupId");
        //                    HttpContext.Session.Clear();
        //                    HttpContext.Session.Remove("revokedata");
        //                }
        //            }
        //        }
        //        else
        //        {
        //            HttpContext.Session.Remove("User");
        //            HttpContext.Session.Remove("selectedGroupId");
        //            HttpContext.Session.Clear();
        //            HttpContext.Session.Remove("revokedata");
        //        }

        //    }
        //    base.OnActionExecuting(filterContext);
        //}
        [HttpGet]
        public async Task<ActionResult> AuthenticatePinterest()
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
                HttpContext.Session.SetObjectAsJson("Pinterest", "Pinterest_Account");
                string authUrl = Authentication.GetPinterestRedirectLink(_appSettings.PinterestAuthUrl, _appSettings.pinterestConsumerKey, _appSettings.pinterestRedirectionUrl);
                return Redirect(authUrl);
            }
        }


        [HttpGet]
        public async Task<ActionResult> Pinterest(string code)
        {
            string pinterestSession = HttpContext.Session.GetObjectFromJson<string>("Pinterest");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            if (pinterestSession.Equals("Pinterest_Account"))
            {
                HttpContext.Session.SetObjectAsJson("Pinterest", null);
                Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("code", code));
                Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                HttpResponseMessage response = await WebApiReq.PostReq("/api/Pinterest/AddPinterestAccount", Parameters, "", "", _appSettings.ApiDomain);
                if (response.IsSuccessStatusCode)
                {
                    TempData["Success"] = await response.Content.ReadAsStringAsync();
                    if(TempData["Success"].ToString() == "Something went wrong while fetching accessToken Please try again")
                    {
                        HttpContext.Session.SetObjectAsJson("Pinterest", "Pinterest_Account");
                        string authUrl = Authentication.GetPinterestRedirectLink(_appSettings.PinterestAuthUrl, _appSettings.pinterestConsumerKey, _appSettings.pinterestRedirectionUrl);
                        return Redirect(authUrl);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                        
                }
                else
                {
                    TempData["Error"] = "Error while hitting api.";
                    return RedirectToAction("Index", "Home");
                }
            }
            return View();
        }
    }
}
