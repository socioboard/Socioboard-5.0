using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.LocationsMethods;

namespace Socioboard.Instagram.App.Core
{
    class LocationController
    {
           /// <summary>
        /// Get information about a location. 
        /// </summary>
        /// <param name="locationid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public Location GetLocationDetails(string locationid, string accessToken)
        {
            Locations objLocation = new Locations();
            return objLocation.LocationDetails(locationid, accessToken);
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
        public InstagramMedia[] GetLocationMedia(string locationid, string min_id, string max_id, string min_timestamp, string max_timestamp, string accessToken)
        {
             Locations objLocation = new Locations();
             return objLocation.LocationMedia(locationid, min_id, max_id, min_timestamp, max_timestamp, accessToken);
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
        public Location[] GetLocationSearch(string lat, string lng, string foursquare_id, string foursquare_v2_id, string distance, string accessToken)
        {
             Locations objLocation = new Locations();
             return objLocation.LocationSearch(lat, lng, foursquare_id, foursquare_v2_id, distance, accessToken);
        }
    }
}
