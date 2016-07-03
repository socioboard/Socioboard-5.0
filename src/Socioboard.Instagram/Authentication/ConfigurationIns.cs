
using System.Net;

namespace Socioboard.Instagram.Authentication
{
    public class ConfigurationIns
    {
        public string AuthUrl { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string ReturnUrl { get; set; }
        public string TokenRetrievalUrl { get; set; }
        public string ApiBaseUrl { get; set; }
        public string WebProxy { get; set; }

        public WebProxy Proxy {
            get {
                if (!string.IsNullOrEmpty(WebProxy))
                {
                    string[] pcs = WebProxy.Split(new[] { ':' });
                    return new WebProxy(pcs[0], int.Parse(pcs[1]));
                }
                return null;
            }
        }

        public ConfigurationIns() {
        }

        public ConfigurationIns(string authurl,string clientid,string clientsecret, string returnurl, string tokenretrievalurl,string apibaseurl, string webconfig) {
            AuthUrl = authurl;
            ClientId =clientid;
            ClientSecret=clientsecret;
            ReturnUrl=returnurl;
            TokenRetrievalUrl=tokenretrievalurl;
            ApiBaseUrl=apibaseurl;
            WebProxy = webconfig;
        }
    }
}
