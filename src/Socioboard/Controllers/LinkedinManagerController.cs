using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Socioboard.Controllers
{
    public class LinkedinManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;
        public LinkedinManagerController(ILogger<LinkedinManagerController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
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
        public async Task<ActionResult> AuthenticateLinkedin(string Op)
        {
            int count = 0;
            Random ran = new Random();
            int x = ran.Next(8976557);
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string profileCount = "";
            List<Domain.Socioboard.Models.Groups> groups = new List<Domain.Socioboard.Models.Groups>();
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
            // string profileCount = await ProfilesHelper.GetUserProfileCount(user.Id, _appSettings, _logger);
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
                    HttpContext.Session.SetObjectAsJson("linSocial", "lin_Account");
                    return Redirect("https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=" + _appSettings.LinkedinApiKey + "&redirect_uri=" + _appSettings.LinkedinCallBackURL + "&state=" + x.ToString() + "&?scope=r_basicprofile+w_share");
                }
                else
                {
                    HttpContext.Session.SetObjectAsJson("linSocial", "lin_Page");
                    return Redirect("https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=" + _appSettings.LinkedinApiKey + "&redirect_uri=" + _appSettings.LinkedinCallBackURL + "&state=" + x.ToString() + "&?scope=r_basicprofile+w_share+rw_company_admin");
                }

            }


        }

        [HttpGet]
        public async Task<ActionResult> LinkedinRedirect(string code)
        {
            string linSocial = HttpContext.Session.GetObjectFromJson<string>("linSocial");
             if (linSocial.Equals("lin_Account"))
            {
                HttpContext.Session.SetObjectAsJson("linSocial", null);
                return RedirectToAction("AddLinAcc", "LinkedinManager", new { code = code });
            }
            else if (linSocial.Equals("lin_Page"))
            {
                HttpContext.Session.SetObjectAsJson("linSocial", null);
                return RedirectToAction("AddLinPage", "LinkedinManager", new { code = code });
            }
            return RedirectToAction("Index", "Index");
        }

        public async Task<ActionResult> AddLinAcc(string code)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("Code", code));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/LinkedIn/AddLinkedInAccount", Parameters, "", "", _appSettings.ApiDomain);
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


       public async Task<ActionResult> AddLinPage(string code)
       {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("Code", code));
            Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
            Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
            HttpResponseMessage response = await WebApiReq.PostReq("/api/LinkedIn/GetLinkedInCompanyPages", Parameters, "", "", _appSettings.ApiDomain);
            if (response.IsSuccessStatusCode)
            {
                List<Domain.Socioboard.Models.AddlinkedinCompanyPage> lstlinkedinpages = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.AddlinkedinCompanyPage>>();
                if (lstlinkedinpages.Count > 0)
                {
                    TempData["linPages"] = Newtonsoft.Json.JsonConvert.SerializeObject(lstlinkedinpages);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    //TempData["Error"] = "No page linked with this account";
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
    }
}