using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.App.Core;
using Socioboard.Instagram.Authentication;


namespace Socioboard.Instagram.Instagram.Core.MediaMethods
{
    public class Media
    {
        oAuthInstagram oAuthIns = new oAuthInstagram();
        /// <summary>
        /// Get information about a media object. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia> MediaDetails(string mediaid, string accessToken)
        {
            string url = oAuthIns.Configuration.ApiBaseUrl + "media/" + mediaid + "?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "media/" + mediaid + "?client_id=" + oAuthIns.Configuration.ClientId;


            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia> res = Base.DeserializeObject<InstagramResponse<InstagramMedia>>(json);
            return res;
        }

        /// <summary>
        /// Search for media in a given area.
        /// </summary>
        /// <param name="lat"> 	Latitude of the center search coordinate. If used, lng is required.</param>
        /// <param name="lng">Longitude of the center search coordinate. If used, lat is required.</param>
        /// <param name="distance">Default is 1km (distance=1000), max distance is 5km.</param>
        /// <param name="min_timestamp">A unix timestamp. All media returned will be taken later than this timestamp.</param>
        /// <param name="max_timestamp">A unix timestamp. All media returned will be taken earlier than this timestamp.</param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> MediaSearch(string lat, string lng, string distance, string min_timestamp, string max_timestamp, string accessToken)
        {
            if (!string.IsNullOrEmpty(lat) && string.IsNullOrEmpty(lng) || !string.IsNullOrEmpty(lng) && string.IsNullOrEmpty(lat))
                throw new ArgumentException("if lat or lng are specified, both are required.");

            string url = oAuthIns.Configuration.ApiBaseUrl + "media/search?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "media/search?client_id=" + oAuthIns.Configuration.ClientId;

            if (!string.IsNullOrEmpty(lat)) url = url + "&lat=" + lat;
            if (!string.IsNullOrEmpty(lng)) url = url + "&lng=" + lng;
            if (!string.IsNullOrEmpty(distance)) url = url + "&distance=" + distance;
            if (!string.IsNullOrEmpty(min_timestamp)) url = url + "&min_timestamp=" + min_timestamp;
            if (!string.IsNullOrEmpty(max_timestamp)) url = url + "&max_timestamp=" + max_timestamp;

            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);
            return res;
        }

        /// <summary>
        /// Get a list of what media is most popular at the moment. 
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> MediaPopular(string accessToken)
        {
            string url = oAuthIns.Configuration.ApiBaseUrl + "media/popular?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "media/popular?client_id=" + oAuthIns.Configuration.ClientId;

            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);
            return res;
        }

        public string ActivitySearchByTag(string Keyword,string accessToken, string clientid)
        {
            string url = "https://api.instagram.com/v1/tags/" + Keyword.TrimStart() + "/media/recent?access_token=" + accessToken;
            if(string.IsNullOrEmpty(accessToken))
                url = "https://api.instagram.com/v1/tags/" + Keyword.TrimStart() + "/media/recent?client_id=" + clientid;
            string json = oAuthIns.RequestGetToUrl(url, null);
            if (string.IsNullOrEmpty(json))
                return null;

            return json;
        }

        public string UserResentFeeds(string userId, string accessToken)
        {
           // string url = "https://api.instagram.com/v1/users/" + userId + "/media/recent?access_token=" + accessToken;
            string url = "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + accessToken;
            string json = oAuthIns.RequestGetToUrl(url, null);
            if (string.IsNullOrEmpty(json))
                return null;
            return json;
        }

    }
}
