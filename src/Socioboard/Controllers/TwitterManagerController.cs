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
        public async Task<IActionResult> AddTwitterAccount(bool follow)
        {
            try
            {
                var count = 0;
                var profileCount = string.Empty;
                var groups = new List<Domain.Socioboard.Models.Groups>();
                var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
                var response = await WebApiReq.GetReq("/api/Groups/GetUserGroups?userId=" + user.Id, "", "", _appSettings.ApiDomain);

                if (response.IsSuccessStatusCode)
                {
                    try
                    {
                        groups = await response.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groups>>();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }

                var sessionSelectedGroupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");

                if (!string.IsNullOrEmpty(sessionSelectedGroupId))
                {
                    var groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetAllGroupProfiles?groupId=" + sessionSelectedGroupId, "", "", _appSettings.ApiDomain);
                    if (groupProfilesResponse.IsSuccessStatusCode)
                    {
                        var groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groupprofiles>>();
                        profileCount = groupProfiles.Count.ToString();
                    }
                }
                else
                {
                    var selectedGroupId = groups.FirstOrDefault(t => t.groupName == Domain.Socioboard.Consatants.SocioboardConsts.DefaultGroupName).id;
                    HttpContext.Session.SetObjectAsJson("selectedGroupId", selectedGroupId);
                    ViewBag.selectedGroupId = selectedGroupId;
                    var groupProfilesResponse = await WebApiReq.GetReq("/api/GroupProfiles/GetAllGroupProfiles?groupId=" + selectedGroupId, "", "", _appSettings.ApiDomain);
                    if (groupProfilesResponse.IsSuccessStatusCode)
                    {
                        var groupProfiles = await groupProfilesResponse.Content.ReadAsAsync<List<Domain.Socioboard.Models.Groupprofiles>>();
                        profileCount = groupProfiles.Count.ToString();
                    }
                }

                // string profileCount = await ProfilesHelper.GetUserProfileCount(user.Id, _appSettings, _logger);
                try
                {
                    count = Convert.ToInt32(profileCount);
                }
                catch (Exception)
                {
                    TempData["Error"] = "Error while getting profile count.";
                    return RedirectToAction("Index", "Home");
                }

                var MaxCount = Domain.Socioboard.Helpers.SBHelper.GetMaxProfileCount(user.AccountType);

                if (count >= MaxCount)
                {
                    TempData["Error"] = "Max profile Count reached.";
                    return RedirectToAction("Index", "Home");
                }

                HttpContext.Session.SetObjectAsJson("Twitter", follow ? "Twitter_Account_Follow" : "Twitter_Account");

                var credentials = new OAuthCredentials
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

                string rest = "https://api.twitter.com/oauth/authorize?oauth_token=" + collection[0];
                HttpContext.Session.SetObjectAsJson("requestSecret", collection[1]);

                return Redirect(rest);
            }

            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Ok(e.Message);
            }

        }


        [HttpGet]
        public async Task<IActionResult> Twitter(string oauth_token, string oauth_verifier)
        {
            var groupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");
            var requestSecret = HttpContext.Session.GetObjectFromJson<string>("requestSecret");
            var twitterSession = HttpContext.Session.GetObjectFromJson<string>("Twitter");

            if (!twitterSession.Equals("Twitter_Account") && !twitterSession.Equals("Twitter_Account_Follow"))
                return View();

            var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            var parameters = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("requestToken", oauth_token),
                new KeyValuePair<string, string>("requestSecret", requestSecret),
                new KeyValuePair<string, string>("requestVerifier", oauth_verifier),
                new KeyValuePair<string, string>("groupId", groupId),
                new KeyValuePair<string, string>("userId", user.Id.ToString())
            };

            if (twitterSession.Equals("Twitter_Account_Follow"))
            {
                parameters.Add(new KeyValuePair<string, string>("follow", "true"));
            }

            HttpContext.Session.SetObjectAsJson("Twitter", null);


            var response = await WebApiReq.PostReq("/api/Twitter/AddTwitterAccount", parameters, "", "", _appSettings.ApiDomain);

            var action = response.IsSuccessStatusCode ? "Success" : "Error";
            TempData[action] = await response.Content.ReadAsStringAsync();
            return RedirectToAction("Index", "Home");
        }


        [Route("socioboard/Reconntwtacc/")]
        [HttpGet("Reconntwtacc")]
        public ActionResult Reconntwtacc(bool code)
        {



            return RedirectToAction("ReconnectTwitter", "TwitterManager", new { code = true });


            // return Content(Socioboard.Facebook.Auth.Authentication.GetFacebookRedirectLink(_appSettings.FacebookAuthUrl, _appSettings.FacebookClientId, _appSettings.FacebookRedirectUrl));
        }


        [HttpGet]
        public async Task<IActionResult> ReconnectTwitter(bool code)
        {
            int count = 0;
            string profileCount = "";
            List<Domain.Socioboard.Models.Groups> groups = new List<Domain.Socioboard.Models.Groups>();
            Domain.Socioboard.Models.User user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");

            string sessionSelectedGroupId = HttpContext.Session.GetObjectFromJson<string>("selectedGroupId");




            if (code)
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
                CallbackUrl = "https://www.socioboard.com/TwitterManager/RecTwitter"
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
            string rest = "https://api.twitter.com/oauth/authorize?oauth_token=" + collection[0];
            HttpContext.Session.SetObjectAsJson("requestSecret", collection[1]);

            return Content(rest);


        }

        [HttpGet]
        public async Task<IActionResult> RecTwitter(string oauth_token, string oauth_verifier)
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
                // Parameters.Add(new KeyValuePair<string, string>("groupId", groupId));
                Parameters.Add(new KeyValuePair<string, string>("userId", user.Id.ToString()));
                if (twitterSession.Equals("Twitter_Account_Follow"))
                {
                    Parameters.Add(new KeyValuePair<string, string>("follow", "true"));

                }
                HttpContext.Session.SetObjectAsJson("Twitter", null);


                HttpResponseMessage response = await WebApiReq.PostReq("/api/Twitter/ReconnectTwtAcc", Parameters, "", "", _appSettings.ApiDomain);
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
