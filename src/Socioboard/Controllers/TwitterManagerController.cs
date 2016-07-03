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

namespace Socioboard.Controllers
{
    public class TwitterManagerController : Controller
    {
        private Helpers.AppSettings _appSettings;
        private readonly ILogger _logger;

        public TwitterManagerController(ILogger<FacebookManagerController> logger, Microsoft.Extensions.Options.IOptions<Helpers.AppSettings> settings)
        {
            _appSettings = settings.Value;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> AddTwitterAccount()
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
                HttpContext.Session.SetObjectAsJson("Twitter", "Twitter_Account");
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
                var response = client.Request(request);
                var collection = HttpUtility.ParseQueryString(response.Content);
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
            if (twitterSession.Equals("Twitter_Account"))
            {
                HttpContext.Session.SetObjectAsJson("Twitter", null);
                Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
                Parameters.Add(new KeyValuePair<string, string>("requestToken", oauth_token));
                Parameters.Add(new KeyValuePair<string, string>("requestSecret", requestSecret));
                Parameters.Add(new KeyValuePair<string, string>("requestVerifier", oauth_verifier));
                Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
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
