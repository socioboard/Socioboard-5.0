using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Instagram.Core.RelationshipMethods;
using Socioboard.Instagram.Authentication;

namespace Socioboard.Instagram.App.Core
{
    class RelationShipsController
    {
        /// <summary>
        /// Get the list of users this user follows.
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetUserFollows(string userid, string accessToken, string max_user_id)
        {
            Relationship objRelation = new Relationship();
            return objRelation.UserFollows(userid, accessToken, max_user_id);
        }

           /// <summary>
        /// Get the list of users this user is followed by. 
        /// </summary>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetUserFollowedBy(string userid, string accessToken, string max_user_id)
        {
            Relationship objRelation = new Relationship();
            return objRelation.UserFollowedBy(userid, accessToken, max_user_id);
        }

          /// <summary>
        /// Get the list of users authenticated user follows.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetCurrentUserFollows(string accessToken, string max_user_id)
        {
            Relationship objRelation = new Relationship();
            return objRelation.CurrentUserFollows(accessToken, max_user_id);
        }

           /// <summary>
        /// Get the list of users authenticated user is followed by.
        /// </summary>
        /// <param name="accessToken"></param>
        /// <param name="max_user_id"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetCurrentUserFollowedBy(string accessToken, string max_user_id)
        {
            Relationship objRelation = new Relationship();
            return objRelation.CurrentUserFollowedBy(accessToken, max_user_id);
        }

          /// <summary>
        /// List the users who have requested the authenticated user's permission to follow. 
        /// </summary>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetCurrentUserRequestedBy(string accessToken)
        {
            Relationship objRelation = new Relationship();
            return objRelation.CurrentUserRequestedBy(accessToken);
        }

          /// <summary>
        /// Get information about a relationship to another user. 
        /// </summary>
        /// <param name="recipient_userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Relation> GetCurrentUserRelationshipWith(string recipient_userid, string accessToken)
        {
            Relationship objRelation = new Relationship();
            return objRelation.CurrentUserRelationshipWith(recipient_userid, accessToken);
        }
    }
}
