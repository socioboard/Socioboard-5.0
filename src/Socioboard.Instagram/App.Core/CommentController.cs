using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.Instagram.Core.CommentsMethods;

namespace Socioboard.Instagram.App.Core
{
    public class CommentController
    {
         /// <summary>
        /// Get a full list of comments on a media.
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public InstagramResponse<Comment[]> GetComment(string mediaid, string accessToken)
        {
            Comments objComments = new Comments();
            return objComments.GetComments(mediaid, accessToken);
        }
        /// <summary>
        /// Create a comment on a media. Please email apidevelopers[at]instagram.com for access. 
        /// </summary>
        /// <param name="mediaids"></param>
        /// <param name="text"></param>
        /// <param name="accessToken"></param>
        public void CommentAdd(string[] mediaids, string text, string accessToken)
        {
            Comments objComments = new Comments();
            foreach (var mediaid in mediaids)
            {
                objComments.CommentAdd(mediaid, text, accessToken);
            }
        }

          /// <summary>
        /// Create a comment on a media. Please email apidevelopers[at]instagram.com for access. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="text"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public string PostCommentAdd(string mediaid, string text, string accessToken)
        {
            Comments objComments = new Comments();
            return objComments.CommentAdd(mediaid, text, accessToken);
        }

           /// <summary>
        /// Remove a comment either on the authenticated user's media or authored by the authenticated user. 
        /// </summary>
        /// <param name="mediaid"></param>
        /// <param name="commentid"></param>
        /// <param name="accessToken"></param>
        /// <returns></returns>
        public bool DelCommentDelete(string mediaid, string commentid, string accessToken)
        {
            Comments objComments = new Comments();
            return objComments.CommentDelete(mediaid, commentid, accessToken);
        }
    }
}
