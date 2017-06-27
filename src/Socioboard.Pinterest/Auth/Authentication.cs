using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Socioboard.Pinterest.Auth
{
    public class Authentication
    {
        public static string GetPinterestRedirectLink(string PinterestAuthUrl, string ClientId, string RedirectUrl)
        {
            return PinterestAuthUrl + "&redirect_uri=" + RedirectUrl + "&client_id=" + ClientId + "&scope=read_public,write_public,read_relationships,write_relationships";
        }
        public static string getAccessToken(string client_id, string redirect_uri, string client_secret, string code)
        {
            try
            {
                string output = string.Empty;
                string authtokenurl = Global.AuthTokenUrl;
                string postData = "grant_type=authorization_code&client_id=" + client_id + "&client_secret=" + client_secret+ "&code="+code;
                output = Global.HttpWebPostRequest(new Uri(authtokenurl), postData);
                return output;
            }
            catch (Exception ex)
            {
                return ex.InnerException.ToString();
            }
        }
    }
}
