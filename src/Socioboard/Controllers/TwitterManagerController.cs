using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Socioboard.Extensions;
using Microsoft.Extensions.Logging;
using Socioboard.Helpers;
using Hammock.Authentication.OAuth;
using Hammock;
using System.Compat.Web;
using System.Collections.Generic;
using System.Net.Http;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Socioboard.Controllers
{
    public class TwitterManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;

        public TwitterManagerController(ILogger<TwitterManagerController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            if (user != null)
            {
                SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
                strdic.Add("UserName", user.EmailId);
                if (string.IsNullOrEmpty(user.Password))
                {
                    strdic.Add("Password", "sociallogin");
                }
                else
                {
                    strdic.Add("Password", user.Password);
                }

                string response = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/CheckUserLogin", strdic, _appSettings.ApiDomain);

                if (!string.IsNullOrEmpty(response))
                {

                }
                else
                {
                    HttpContext.Session.Remove("User");
                    HttpContext.Session.Remove("selectedGroupId");
                    HttpContext.Session.Clear();
                }
            }
            base.OnActionExecuting(filterContext);
        }


        [HttpGet]
        public async Task<IActionResult> AddTwitterAccount(bool follow)
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
                if (follow)
                {
                    HttpContext.Session.SetObjectAsJson("Twitter", "Twitter_Account_Follow");
                }
                else
                {
                    HttpContext.Session.SetObjectAsJson("Twitter", "Twitter_Account");
                }
                OAuthCredentials credentials = new OAuthCredentials()
                {
                    Type = OAuthType.RequestToken,
                    SignatureMethod = OAuthSignatureMethod.HmacSha1,
                    ParameterHandling = OAuthParameterHandling.HttpAuthorizationHeader,
                    ConsumerKey = _appSettings.twitterConsumerKey,
                    ConsumerSecret = _appSettings.twitterConsumerScreatKey,
                    CallbackUrl = _appSettings.twitterRedirectionUrl
                };
                // Use Hammock to create a rest client
                var client = new RestClient
                {
                    Authority = "https://api.twitter.com/oauth",
                    Credentials = credentials,
                };
                // Use Hammock to create a request
                var request = new RestRequest
                {
                    Path = "request_token"
                };
                // Get the response from the request
                var _response = client.Request(request);
                var collection = HttpUtility.ParseQueryString(_response.Content);
                //string str = collection[1].ToString();
                //HttpContext.Current.Session["requestSecret"] = collection[1];
                string rest = "https://api.twitter.com/oauth/authorize?oauth_token=" + collection[0] ;
                HttpContext.Session.SetObjectAsJson("requestSecret", collection[1]);

                return Redirect(rest);
            }
        }


        [HttpGet]
        public async Task<IActionResult> Twitter(string oauth_token, string oauth_verifier)
        {
            string groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            string requestSecret = HttpContext.Session.GetObjectFromJson<string>("requestSecret");
            string twitterSession = HttpContext.Session.GetObjectFromJson<string>("Twitter");
            if (twitterSession.Equals("Twitter_Account") || twitterSession.Equals("Twitter_Account_Follow"))
            {
                Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("requestToken", oauth_token));
                Parameters.Add(new KeyValuePair<string, string>("requestSecret", requestSecret));
                Parameters.Add(new KeyValuePair<string, string>("requestVerifier", oauth_verifier));
                Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                if (twitterSession.Equals("Twitter_Account_Follow"))
                {
                    Parameters.Add(new KeyValuePair<string, string>("follow","true"));

                }
                HttpContext.Session.SetObjectAsJson("Twitter", null);
               

                HttpResponseMessage response = await WebApiReq.PostReq("/api/Twitter/AddTwitterAccount", Parameters, "", "", _appSettings.ApiDomain);
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
