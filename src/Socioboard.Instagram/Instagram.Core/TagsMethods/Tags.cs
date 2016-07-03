using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.App.Core;


namespace Socioboard.Instagram.Instagram.Core.TagsMethods
{
    class Tags
    {
        oAuthInstagram objAuthIns = new oAuthInstagram();
        #region tags
        /// <summary>
        /// Get information about a tag object. 
        /// </summary>
        /// <param name="tagname"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Tag> TagDetails(string tagname, string accessToken)
        {
            if (tagname.Contains("#"))
                tagname = tagname.Replace("#", "");

            string url = objAuthIns.Configuration.ApiBaseUrl + "tags/" + tagname + "?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = objAuthIns.Configuration.ApiBaseUrl + "tags/" + tagname + "?client_id=" + objAuthIns.Configuration.ClientId;

            string json = objAuthIns.RequestGetToUrl(url, objAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<Tag> res = Base.DeserializeObject<InstagramResponse<Tag>>(json);
            return res;
        }

        /// <summary>
        /// Search for tags by name. Results are ordered first as an exact match, then by popularity.
        /// </summary>
        /// <param name="query"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Tag[]> TagSearch(string query, string accessToken)
        {
            if (query.Contains("#"))
                query = query.Replace("#", "");

            string url = objAuthIns.Configuration.ApiBaseUrl + "tags/search?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = objAuthIns.Configuration.ApiBaseUrl + "tags/search?client_id=" + objAuthIns.Configuration.ClientId;

            if (!string.IsNullOrEmpty(query)) url = url + "&q=" + query;

            string json = objAuthIns.RequestGetToUrl(url, objAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<Tag[]> res = Base.DeserializeObject<InstagramResponse<Tag[]>>(json);
            return res;
        }


        //public Tag[] TagPopular(string accessToken)
        //{
        //    InstagramMedia[] pop = MediaPopular(accessToken, true).data;
        //    return TagsInMediaList(pop);
        //}
        /// <summary>
        /// Get a list of recently tagged media. 
        /// </summary>
        /// <param name="tagname"></param>
        /// <param name="min_id"></param>
        /// <param name="max_id"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> TagMedia(string tagname, string min_id, string max_id, string accessToken)
        {
            if (tagname.Contains("#"))
                tagname = tagname.Replace("#", "");

            string url = objAuthIns.Configuration.ApiBaseUrl + "tags/" + tagname + "/media/recent?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = objAuthIns.Configuration.ApiBaseUrl + "tags/" + tagname + "/media/recent?client_id=" + objAuthIns.Configuration.ClientId;


            if (!string.IsNullOrEmpty(min_id)) url = url + "&min_id=" + min_id;
            if (!string.IsNullOrEmpty(max_id)) url = url + "&max_id=" + max_id;

            string json = objAuthIns.RequestGetToUrl(url, objAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);

            return res;
        }
      
     
        #endregion

    }
}
