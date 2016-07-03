using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.App.Core;
using Socioboard.Instagram.Authentication;


namespace Socioboard.Instagram.Instagram.Core.UsersMethods
{
    public class Users : oAuthBase
    {
        oAuthInstagram objoAuthIns = new oAuthInstagram();
        #region user

        /// <summary>
        /// Get basic information about a user. 
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User> Get_UserDetails(string userid, string accessToken)
        {

            if (userid == "self")
                return CurrentUserDetails(accessToken);

            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/?client_id=" + objoAuthIns.Configuration.ClientId;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User> res = Base.DeserializeObject<InstagramResponse<User>>(json);

            if (!string.IsNullOrEmpty(accessToken))
            {
                //CurrentUserIsFollowing(userid, accessToken);

                //  res.data.isFollowed =  CurrentUserIsFollowing(res.data.id, accessToken);
            }

            return res;
        }

        /// <summary>
        /// Search for a user by name. 
        /// </summary>
        /// <param name="query"></param>
        /// <param name="count"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public string UsersSearch(string query, string count, string accessToken, string clientid)
        {
            string url = "https://api.instagram.com/v1/users/search?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = "https://api.instagram.com/v1/users/search?client_id=" + clientid;

            if (!string.IsNullOrEmpty(query)) url = url + "&q=" + query;
            if (!string.IsNullOrEmpty(count)) url = url + "&count=" + count;
            string json = objoAuthIns.RequestGetToUrl(url, null);
            if (string.IsNullOrEmpty(json))
                return null;

            //InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);

            return json;
        }

        /// <summary>
        /// Get the most recent media published by a user. 
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="min_id"></param>
        /// <param name="max_id"></param>
        /// <param name="count">Count of records to return.</param>
        /// <param name="min_timestamp"></param>
        /// <param name="max_timestamp"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> UserRecentMedia(string userid, string min_id, string max_id, string count, string min_timestamp, string max_timestamp, string accessToken)
        {
            string url = string.Empty;

            try
            {
                url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/media/recent?access_token=" + accessToken;
            }
            catch (Exception ex)
            {

                throw;
            }
            if (string.IsNullOrEmpty(accessToken))
                url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/media/recent?client_id=" + objoAuthIns.Configuration.ClientId;

            if (!string.IsNullOrEmpty(min_id)) url = url + "&min_id=" + min_id;
            if (!string.IsNullOrEmpty(max_id)) url = url + "&max_id=" + max_id;
            if (!string.IsNullOrEmpty(count)) url = url + "&count=" + count;
            if (!string.IsNullOrEmpty(min_timestamp)) url = url + "&min_timestamp=" + min_timestamp;
            if (!string.IsNullOrEmpty(max_timestamp)) url = url + "&max_timestamp=" + max_timestamp;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);


            return res;
        }

        /// <summary>
        ///  Get the Feeds of an authenticated user
        /// </summary>
        /// <param name="min_id"></param>
        /// <param name="max_id"></param>
        /// <param name="count">Count of records to return.</param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> CurrentUserFeed(string min_id, string max_id, string count, string accessToken)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/self/feed?access_token=" + accessToken;

            if (!string.IsNullOrEmpty(min_id)) url = url + "&min_id=" + min_id;
            if (!string.IsNullOrEmpty(max_id)) url = url + "&max_id=" + max_id;
            if (!string.IsNullOrEmpty(count)) url = url + "&count=" + count;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);

            return res;
        }

        /// <summary>
        /// Get details of the Authenticated User.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User> CurrentUserDetails(string accessToken)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/self?access_token=" + accessToken;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User> res = Base.DeserializeObject<InstagramResponse<User>>(json);
            res.data.isSelf = true;
            return res;
        }

        /// <summary>
        /// See the authenticated user's list of media they've liked. 
        /// </summary>
        /// <param name="max_like_id"> 	Return media liked before this id.</param>
        /// <param name="count">Count of media to return.</param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> CurrentUserLikedMedia(string max_like_id, string count, string accessToken)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/self/media/liked?access_token=" + accessToken;
            if (!string.IsNullOrEmpty(max_like_id)) url = url + "&max_like_id=" + max_like_id;
            if (!string.IsNullOrEmpty(count)) url = url + "&count=" + count;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<InstagramMedia[]> res = Base.DeserializeObject<InstagramResponse<InstagramMedia[]>>(json);

            return res;
        }





        #endregion

    }
}
