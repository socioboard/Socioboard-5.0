using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Socioboard.Helpers;
using Socioboard.Extensions;
using System.Net.Http;

namespace Socioboard.Controllers
{
    public class InstagramManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;

        public InstagramManagerController(ILogger<InstagramManagerController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult> AuthenticateInstagram()
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
                HttpContext.Session.SetObjectAsJson("Instagram", "Instagram_Account");
                string authUrl = _appSettings.InsagramAuthUrl + "&client_id=" + _appSettings.InstagramClientKey + "&redirect_uri=" + _appSettings.InstagramCallBackURL;
                return Redirect(authUrl);
            }
        }


        [HttpGet]
        public async Task<ActionResult> Instagram(string code)
        {
            string twitterSession = HttpContext.Session.GetObjectFromJson<string>("Instagram");
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            if (twitterSession.Equals("Instagram_Account"))
            {
                HttpContext.Session.SetObjectAsJson("Instagram", null);
                Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("code", code));
                Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                HttpResponseMessage response = await WebApiReq.PostReq("/api/Instagram/AddInstagramAccount", Parameters, "", "", _appSettings.ApiDomain);
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
            return View();
        }
    }
}