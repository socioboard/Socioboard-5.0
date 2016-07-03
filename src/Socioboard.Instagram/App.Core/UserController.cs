using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Instagram.Core.UsersMethods;
using Socioboard.Instagram.Authentication;

namespace Socioboard.Instagram.App.Core
{
    public class UserController
    {
        /// <summary>
        /// Get basic information about a user. 
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User> GetUserDetails(string userid, string accessToken)
        {
            Users objUser=new Users();
            InstagramResponse<User> res = objUser.Get_UserDetails(userid, accessToken);
            return res;
        }

        /// <summary>
        /// Search for a user by name. 
        /// </summary>
        /// <param name="query"></param>
        /// <param name="count"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public string GetUsersSearch(string query, string count, string accessToken, string clientid)
        {
            Users objUsers=new Users();
            string res = objUsers.UsersSearch(query, count, accessToken, clientid);
            return res;
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
        public InstagramResponse<InstagramMedia[]> GetUserRecentMedia(string userid, string min_id, string max_id, string count, string min_timestamp, string max_timestamp, string accessToken)
        {
            Users objUers=new Users();
            InstagramResponse<InstagramMedia[]> res= objUers.UserRecentMedia(userid,min_id,max_id,count,min_timestamp,max_timestamp,accessToken);
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
        public InstagramResponse<InstagramMedia[]> GetCurrentUserFeed(string min_id, string max_id, string count, string accessToken)
        {
            Users objUser=new Users();
            InstagramResponse<InstagramMedia[]> res=objUser.CurrentUserFeed(min_id,max_id,count,accessToken);
            return res;
        }

        /// <summary>
        /// Get details of the Authenticated User.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User> GetCurrentUserDetails(string accessToken)
        {
            Users objUser = new Users();
            return objUser.CurrentUserDetails(accessToken);
        }

        /// <summary>
        /// Get Media published by the authenticated User.
        /// </summary>
        /// <param name="min_id"></param>
        /// <param name="max_id"></param>
        /// <param name="count">Count of records to return.</param>
        /// <param name="min_timestamp"></param>
        /// <param name="max_timestamp"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> GetCurrentUserRecentMedia(string min_id, string max_id, string count, string min_timestamp, string max_timestamp, string accessToken)
        {
            Users objUser = new Users();
            return objUser.UserRecentMedia("self", min_id, max_id, count, min_timestamp, max_timestamp, accessToken);
        }

         /// <summary>
        /// See the authenticated user's list of media they've liked. 
        /// </summary>
        /// <param name="max_like_id"> 	Return media liked before this id.</param>
        /// <param name="count">Count of media to return.</param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<InstagramMedia[]> GetCurrentUserLikedMedia(string max_like_id, string count, string accessToken)
        {
            Users objUser = new Users();
            return objUser.CurrentUserLikedMedia(max_like_id,count,accessToken);
        }
    }
}
