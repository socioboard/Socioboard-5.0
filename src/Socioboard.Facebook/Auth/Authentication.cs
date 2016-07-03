using Facebook;
using System.Collections.Generic;

namespace Socioboard.Facebook.Auth
{
    public static class Authentication
    {
        public static string getAccessToken(string client_id, string redirect_uri, string client_secret, string code)
        {
            FacebookClient fb = new FacebookClient();
            string profileId = string.Empty;
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("client_id", client_id);
            parameters.Add("redirect_uri", redirect_uri);
            parameters.Add("client_secret", client_secret);
            parameters.Add("code", code);
            JsonObject fbaccess_token = null;
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
            fbaccess_token = (JsonObject)fb.Get("/oauth/access_token", parameters);
            return fbaccess_token["access_token"].ToString();
        }

        public static string GetFacebookRedirectLink(string FacebookAuthUrl, string ClientId, string RedirectUrl)
        {
            return FacebookAuthUrl + "&client_id=" + ClientId + "&redirect_uri=" + RedirectUrl + "&response_type=code";
        }



    }
}
