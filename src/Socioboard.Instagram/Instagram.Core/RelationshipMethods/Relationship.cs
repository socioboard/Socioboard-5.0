using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.App.Core;
using Socioboard.Instagram.Authentication;

using System.Collections.Specialized;

namespace Socioboard.Instagram.Instagram.Core.RelationshipMethods
{
    public class Relationship
    {
        oAuthInstagram objoAuthIns = new oAuthInstagram();
        #region relationships
        /// <summary>
        /// Get the list of users this user follows.
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> UserFollows(string userid, string accessToken, string max_user_id)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/follows?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/follows?client_id=" + objoAuthIns.Configuration.ClientId;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);
            //https://api.instagram.com/v1/users/530914/follows?access_token=530914.0c0b99a.56e7a173b9af43eba8a60759904f6fc4&cursor=32754039"
            //if (_cache != null)
            //    _cache.Add(userid + "/follows", res);

            return res;
        }
        /// <summary>
        /// Get the list of users this user is followed by. 
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> UserFollowedBy(string userid, string accessToken, string max_user_id)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/followed-by?access_token=" + accessToken;
            if (string.IsNullOrEmpty(accessToken))
                url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + userid + "/followed-by?client_id=" + objoAuthIns.Configuration.ClientId;


            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);


            return res;
        }

        /// <summary>
        /// Get the list of users authenticated user follows.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> CurrentUserFollows(string accessToken, string max_user_id)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/self/follows?access_token=" + accessToken;

            //  if (!string.IsNullOrEmpty(max_user_id)) url = url + "&cursor=" + max_user_id;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);



            return res;
        }
        /// <summary>
        /// Get the list of users authenticated user is followed by.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> CurrentUserFollowedBy(string accessToken, string max_user_id)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/self/followed-by?access_token=" + accessToken;

            // if (!string.IsNullOrEmpty(max_user_id)) url = url + "&cursor=" + max_user_id;

            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);


            return res;
        }
        /// <summary>
        /// List the users who have requested the authenticated user's permission to follow. 
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> CurrentUserRequestedBy(string accessToken)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/self/requested-by?access_token=" + accessToken;



            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<User[]> res = Base.DeserializeObject<InstagramResponse<User[]>>(json);



            return res;
        }

        /// <summary>
        /// Get information about a relationship to another user. 
        /// </summary>
        /// <param name="recipient_userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Relation> CurrentUserRelationshipWith(string recipient_userid, string accessToken)
        {
            string url = objoAuthIns.Configuration.ApiBaseUrl + "users/" + recipient_userid + "/relationship?access_token=" + accessToken;
            string json = objoAuthIns.RequestGetToUrl(url, objoAuthIns.Configuration.Proxy);
            if (string.IsNullOrEmpty(json))
                return null;

            InstagramResponse<Relation> res = Base.DeserializeObject<InstagramResponse<Relation>>(json);
            return res;
        }

        public string FollowPost(string followingid, string accessToken)
        {
            string url = "https://api.instagram.com/v1/users/" + followingid + "/relationship?access_token=" + accessToken;
            NameValueCollection post = new NameValueCollection
                                       {
                                               {"action","follow"},
                                               {"access_token", accessToken}
                                       };
            string json = objoAuthIns.RequestPostToUrl(url, post, null);
            if (string.IsNullOrEmpty(json))
                return "";
            return json;
        }
        public string UnfollowPost(string followingid, string accessToken)
        {
            string url = "https://api.instagram.com/v1/users/" + followingid + "/relationship?access_token=" + accessToken;
            NameValueCollection post = new NameValueCollection
                                       {
                                               {"action","unfollow"},
                                               {"access_token", accessToken}
                                       };
            string json = objoAuthIns.RequestPostToUrl(url, post, null);
            if (string.IsNullOrEmpty(json))
                return "";

            return json;
        }
        public string BlockUserPost(string followingid, string accessToken)
        {
            string url = "https://api.instagram.com/v1/users/" + followingid + "/relationship?access_token=" + accessToken;
            NameValueCollection post = new NameValueCollection
                                       {
                                               {"action","block"},
                                               {"access_token", accessToken}
                                       };
            string json = objoAuthIns.RequestPostToUrl(url, post, null);
            if (string.IsNullOrEmpty(json))
                return "";
                       
            return json;
        }


        #endregion

    }
}
