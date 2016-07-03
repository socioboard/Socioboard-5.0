using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Socioboard.Helpers
{
    public static class Facebook
    {
        public static async Task<Domain.Socioboard.Models.User> FbLogin(string accessToken,string BaseUrl)
        {
            Domain.Socioboard.Models.User user = null;
            List<KeyValuePair<string, string>> Parameters = new List<KeyValuePair<string, string>>();
            Parameters.Add(new KeyValuePair<string, string>("AccessToken", accessToken));
            HttpResponseMessage response = await  WebApiReq.PostReq("/api/User/FacebookLogin", Parameters, "", "", BaseUrl);
            if (response.IsSuccessStatusCode)
            {
                try
                {
                     user = await response.Content.ReadAsAsync<Domain.Socioboard.Models.User>();
                }
                catch 
                {
                   
                }

            }
            return user;
        }
    }
}
