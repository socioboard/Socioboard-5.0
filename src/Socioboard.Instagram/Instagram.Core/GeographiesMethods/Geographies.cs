using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.App.Core;


namespace Socioboard.Instagram.Instagram.Core.GeographiesMethods
{
    class Geographies
    {
        public InstagramMedia[] GeographyMedia(string geographyid, string accessToken)
        {
            oAuthInstagram oAuthIn = new oAuthInstagram();
            string url = oAuthIn.Configuration.ApiBaseUrl + "geographies/" + geographyid + "/media/recent?access_token=" + accessToken;
            string json = oAuthIn.RequestGetToUrl(url, oAuthIn.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return new InstagramMedia[0];

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);
            return res.data;
        }
    }
}
