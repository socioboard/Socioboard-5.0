using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Socioboard.Extensions;
using Socioboard.Helper;
using Socioboard.Helpers;

namespace Socioboard.Controllers
{
    public class SocioboardController : Controller
    {
        private readonly AppSettings _appSettings;

        public SocioboardController(Microsoft.Extensions.Options.IOptions<AppSettings> settings)
        {
            _appSettings = settings.Value;
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var user = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.User>("User");
            var session = HttpContext.Session.GetObjectFromJson<Domain.Socioboard.Models.SessionHistory>("revokedata");

            if (session != null)
            {
                var requestParameters = new SortedDictionary<string, string> { { "systemId", session.systemId } };
                var httpWebRequest = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/checksociorevtoken", requestParameters, _appSettings.ApiDomain);

                if (httpWebRequest != "false")
                    SetSession(user);
                else
                {
                    HttpContext.Session.Remove("User");
                    HttpContext.Session.Remove("selectedGroupId");
                    HttpContext.Session.Clear();
                    HttpContext.Session.Remove("revokedata");
                }
            }
            else
            {
                if (Request.Cookies["sociorevtoken"] != null)
                {
                    var socioRevToken = PluginHelper.Base64Decode(Request.Cookies["sociorevtoken"]);
                    var requestParameters = new SortedDictionary<string, string> { { "systemId", socioRevToken } };
                    var httpWebRequest = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/checksociorevtoken", requestParameters, _appSettings.ApiDomain);

                    if (httpWebRequest != "false")
                        SetSession(user);
                }
            }

            base.OnActionExecuting(filterContext);
        }

        private void SetSession(Domain.Socioboard.Models.User currentLoggedInUser)
        {
            if (currentLoggedInUser != null)
                return;

            var emailId = string.Empty;
            var password = string.Empty;

            if (Request.Cookies["socioboardemailId"] != null)
                emailId = PluginHelper.Base64Decode(Request.Cookies["socioboardemailId"]);

            if (string.IsNullOrEmpty(emailId))
                return;

            if (Request.Cookies["socioboardToken"] != null)
                password = PluginHelper.Base64Decode(Request.Cookies["socioboardToken"]);

            var requestParameters = new SortedDictionary<string, string>
            {
                {"UserName", emailId}, {"Password", string.IsNullOrEmpty(password) ? "sociallogin" : password}
            };

            var response = CustomHttpWebRequest.HttpWebRequest("POST", "/api/User/CheckUserLogin", requestParameters, _appSettings.ApiDomain);

            if (string.IsNullOrEmpty(response))
                return;

            var user = Newtonsoft.Json.JsonConvert.DeserializeObject<Domain.Socioboard.Models.User>(response);

            HttpContext.Session.SetObjectAsJson("User", user);

        }


        public IActionResult ReconnGoacc(string options)
        {

            if (string.IsNullOrEmpty(options))
            {
                HttpContext.Session.SetObjectAsJson("Google", "Gplus_Account");
                string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/plus.media.upload+https://www.googleapis.com/auth/plus.stream.write+https://www.googleapis.com/auth/plus.stream.read+https://www.googleapis.com/auth/plus.circles.read&response_type=code&access_type=offline&approval_prompt=force&access.domainRestricted=true";
                return Content(googleurl);
            }
            else if (options == "page")
            {
                HttpContext.Session.SetObjectAsJson("Google", "Ganalytics_Account");
                string googleurl = "https://accounts.google.com/o/oauth2/auth?approval_prompt=force&access_type=offline&client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/analytics+https://www.googleapis.com/auth/analytics.edit+https://www.googleapis.com/auth/analytics.readonly&response_type=code";
                return Content(googleurl);
            }
            else if (options == "recgplus")
            {
                HttpContext.Session.SetObjectAsJson("Google", "Ganalytics_Account");
                string googleurl = "https://accounts.google.com/o/oauth2/auth?approval_prompt=force&access_type=offline&client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/analytics+https://www.googleapis.com/auth/analytics.edit+https://www.googleapis.com/auth/analytics.readonly&response_type=code";
                return Content(googleurl);
            }
            else
            {
                HttpContext.Session.SetObjectAsJson("Google", "Youtube_Account");
                string googleurl = "https://accounts.google.com/o/oauth2/auth?client_id=" + _appSettings.GoogleConsumerKey + "&redirect_uri=" + _appSettings.GoogleRedirectUri + "&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/youtubepartner+https://www.googleapis.com/auth/youtubepartner-channel-audit+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/plus.me+https://www.googleapis.com/auth/youtube.force-ssl&response_type=code&access_type=offline&approval_prompt=force";
                return Content(googleurl);
            }

        }
    }
}