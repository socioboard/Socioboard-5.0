using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Socioboard.Extensions;
using Socioboard.Helpers;
using System.Net.Http;

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


        [HttpGet]
        public async Task<ActionResult> AuthenticateLinkedin(string Op)
        {
            int count = 0;
            Random ran = new Random();
            int x = ran.Next(8976557);
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