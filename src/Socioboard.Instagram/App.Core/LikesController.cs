using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Instagram.Core.LikesMethods;
using Socioboard.Instagram.Instagram.Core.MediaMethods;
using Socioboard.Instagram.Authentication;

namespace Socioboard.Instagram.App.Core
{
    public class LikesController
    {
         /// <summary>
        /// Get a list of users who have liked this media. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<User[]> GetUserLikes(string mediaid, string accessToken)
        {
            Likes objLikes = new Likes();
            return objLikes.GetLikes(mediaid, accessToken);
        }

        /// <summary>
        /// Set a like on this media array by the currently authenticated user. 
        /// </summary>
        /// <param name="mediaids"></param>
        /// <param name="accessToken"></param>
        public void PostLikesArray(string[] mediaids, string accessToken)
        {
            Likes objLikes = new Likes();
            foreach (var mediaid in mediaids)
            {
                objLikes.PostLike(mediaid, accessToken);
            }
        }

             /// <summary>
        /// Set a like on this media by the currently authenticated user. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public bool PostUserLike(string mediaid, string accessToken)
        {
            Likes objLikes = new Likes();
            return objLikes.PostLike(mediaid, accessToken);
        }

        /// <summary>
        /// Remove a like on this media array by the currently authenticated user. 
        /// </summary>
        /// <param name="mediaids"></param>
        /// <param name="accessToken"></param>
        public void DeleteArrayLike(string[] mediaids, string accessToken)
        {
            Likes objLikes = new Likes();
            foreach (var mediaid in mediaids)
            {
                objLikes.LikeDelete(mediaid,accessToken);
            }
        }

            /// <summary>
        /// Remove a like on this media by the currently authenticated user. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public bool DeleteLike(string mediaid, string accessToken)
        {
            Likes objLikes = new Likes();
            return objLikes.LikeDelete(mediaid, accessToken);
        }

        /// <summary>
        /// Like or Unlike the Media
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="userid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public bool LikeToggle(string mediaid,string userid, string accessToken)
        {
            Media objMedia = new Media();
            InstagramMedia media = objMedia.MediaDetails(mediaid, accessToken).data;

            if (media.user_has_liked)
                return DeleteLike(mediaid, accessToken);
            else
                return PostUserLike(mediaid,accessToken);

        }
    }
}
