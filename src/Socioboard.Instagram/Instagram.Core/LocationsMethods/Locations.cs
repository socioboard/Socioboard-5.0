using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.App.Core;
using Socioboard.Instagram.Authentication;


namespace Socioboard.Instagram.Instagram.Core.LocationsMethods
{
    class Locations
    {
        oAuthInstagram oAuthIns = new oAuthInstagram();
        /// <summary>
        /// Get information about a location. 
        /// </summary>
        /// <param name="locationid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public Location LocationDetails(string locationid, string accessToken)
        {
            string url = oAuthIns.Configuration.ApiBaseUrl + "locations/" + locationid + "?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "locations/" + locationid + "?client_id=" + oAuthIns.Configuration.ClientId;

            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<Location> res = Base.DeserializeObject<InstagramResponse<Location>>(json);
            return res.data;
        }

        /// <summary>
        /// Get a list of recent media objects from a given location.
        /// </summary>
        /// <param name="locationid"></param>
        /// <param name="min_id"> 	Return media before this min_id.</param>
        /// <param name="max_id"> 	Return media after this max_id.</param>
        /// <param name="min_timestamp">Return media after this UNIX timestamp</param>
        /// <param name="max_timestamp">Return media before this UNIX timestamp</param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramMedia[] LocationMedia(string locationid, string min_id, string max_id, string min_timestamp, string max_timestamp, string accessToken)
        {
            string url = oAuthIns.Configuration.ApiBaseUrl + "locations/" + locationid + "/media/recent?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "locations/" + locationid + "/media/recent?client_id=" + oAuthIns.Configuration.ClientId;

            if (!string.IsNullOrEmpty(min_id)) url = url + "&min_id=" + min_id;
            if (!string.IsNullOrEmpty(max_id)) url = url + "&max_id=" + max_id;
            if (!string.IsNullOrEmpty(min_timestamp)) url = url + "&min_timestamp=" + min_timestamp;
            if (!string.IsNullOrEmpty(max_timestamp)) url = url + "&max_timestamp=" + max_timestamp;
            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return new InstagramMedia[0];

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);
            return res.data;
        }

        /// <summary>
        /// Search for a location by geographic coordinate. 
        /// </summary>
        /// <param name="lat">Latitude of the center search coordinate. If used, lng is required.</param>
        /// <param name="lng">Longitude of the center search coordinate. If used, lat is required.</param>
        /// <param name="foursquare_id">Returns a location mapped off of a foursquare v1 api location id. If used, you are not required to use lat and lng.</param>
        /// <param name="foursquare_v2_id">Returns a location mapped off of a foursquare v2 api location id. If used, you are not required to use lat and lng.</param>
        /// <param name="distance">Default is 1000m (distance=1000), max distance is 5000.</param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public Location[] LocationSearch(string lat, string lng, string foursquare_id, string foursquare_v2_id, string distance, string accessToken)
        {
            if (!string.IsNullOrEmpty(lat) && string.IsNullOrEmpty(lng) || !string.IsNullOrEmpty(lng) && string.IsNullOrEmpty(lat))
                throw new ArgumentException("if lat or lng are specified, both are required.");

            string url = oAuthIns.Configuration.ApiBaseUrl + "locations/search?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "locations/search?client_id=" + oAuthIns.Configuration.ClientId;

            if (!string.IsNullOrEmpty(lat)) url = url + "&lat=" + lat;
            if (!string.IsNullOrEmpty(lng)) url = url + "&lng=" + lng;
            if (!string.IsNullOrEmpty(foursquare_id)) url = url + "&foursquare_id=" + foursquare_id;
            if (!string.IsNullOrEmpty(foursquare_v2_id)) url = url + "&foursquare_v2_id=" + foursquare_v2_id;
            if (!string.IsNullOrEmpty(distance)) url = url + "&distance=" + distance;

            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return new Location[0];


            InstagramResponse<Location[]> res = Base.DeserializeObject<InstagramResponse<Location[]>>(json);
            return res.data;
        }
    }
}
