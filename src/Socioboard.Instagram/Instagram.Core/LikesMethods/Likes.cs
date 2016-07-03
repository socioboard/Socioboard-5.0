using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.App.Core;

using Socioboard.Instagram.Authentication;
using System.Collections.Specialized;

namespace Socioboard.Instagram.Instagram.Core.LikesMethods
{
    class Likes
    {
        oAuthInstagram oAuthIns = new oAuthInstagram();

        /// <summary>
        /// Get a list of users who have liked this media. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetLikes(string mediaid, string accessToken)
        {
            string url = oAuthIns.Configuration.ApiBaseUrl + "media/" + mediaid + "/likes?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = oAuthIns.Configuration.ApiBaseUrl + "media/" + mediaid + "/likes?client_id=" + oAuthIns.Configuration.ClientId;

            string json = oAuthIns.RequestGetToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);
            return res;
        }

   

        /// <summary>
        /// Set a like on this media by the currently authenticated user. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public bool PostLike(string mediaid, string accessToken)
        {
            string url = "https://api.instagram.com/v1/media/" + mediaid + "/likes?access_token=" + accessToken;
            NameValueCollection post = new NameValueCollection
                                       {
                                               {"access_token", accessToken}
                                       };
            string json = oAuthIns.RequestPostToUrl(url, post, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return true;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);
            return res.meta.code == "200";
        }

      

        /// <summary>
        /// Remove a like on this media by the currently authenticated user. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public bool LikeDelete(string mediaid,  string accessToken)
        {
            string url = "https://api.instagram.com/v1/media/" + mediaid + "/likes?access_token=" + accessToken;

            string json = oAuthIns.RequestDeleteToUrl(url, oAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return true;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);
            return res.meta.code == "200";
        }

      


        public bool UserIsLiking(string mediaid, string userid, string accessToken)
        {

            User[] userlinking = GetLikes(mediaid, accessToken).data;
            foreach (User user in userlinking)
                if (user.id.ToString().Equals(userid))
                    return true;

            return false;
        }
    }
}
