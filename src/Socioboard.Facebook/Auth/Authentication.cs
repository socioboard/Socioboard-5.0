using Facebook;
using System.Collections.Generic;

namespace Socioboard.Facebook.Auth
{
    public static class Authentication
    {
        public static string GetAccessToken(string clientId, string redirectUri, string clientSecret, string code)
        {
            var fb = new FacebookClient();
         
            var parameters = new Dictionary<string, object>
            {
                {"client_id", clientId},
                {"redirect_uri", redirectUri},
                {"client_secret", clientSecret},
                {"code", code}
            };

            JsonObject fbaccessToken;
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            fbaccessToken = (JsonObject)fb.Get("/oauth/access_token", parameters);
            return fbaccessToken["access_token"].ToString();

        }

        public static string GetFacebookRedirectLink(string facebookAuthUrl, string clientId, string redirectUrl)
            =>  $"{facebookAuthUrl}&client_id={clientId}&redirect_uri={redirectUrl}&response_type=code";
        
    }
}
