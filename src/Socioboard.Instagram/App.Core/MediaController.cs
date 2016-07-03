using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.MediaMethods;

namespace Socioboard.Instagram.App.Core
{
    public class MediaController
    {
             /// <summary>
        /// Get information about a media object. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia> GetMediaDetails(string mediaid, string accessToken)
        {
            Media objMedia = new Media();
            return objMedia.MediaDetails(mediaid, accessToken);
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
        public InstagramResponse<InstagramMedia[]> GetMediaSearch(string lat, string lng, string distance, string min_timestamp, string max_timestamp, string accessToken)
        {
            Media objMedia = new Media();
            return objMedia.MediaSearch(lat, lng, distance, min_timestamp, max_timestamp, accessToken);
        }

           /// <summary>
        /// Get a list of what media is most popular at the moment. 
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> GetMediaPopular(string accessToken)
        {
            Media objMedia = new Media();
            return objMedia.MediaPopular(accessToken);
        }
    }
}
