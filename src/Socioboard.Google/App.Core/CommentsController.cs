using System;
using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Gplus.Core.CommentsMethod;

namespace Socioboard.GoogleLib.App.Core
{
    public class CommentsController
    {
        public CommentsController(string clientId, string clientSecret, string redirectUrl)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;
        JArray objArr;
        public CommentsController()
        {
            objArr = new JArray();
        }

        /// <summary>
        /// List all of the comments for an activity
        /// </summary>
        /// <param name="ActivityId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray GetCommentListByActivityId(string ActivityId, string access)
        {
            Comments objComment = new Comments(_clientId, _clientSecret, _redirectUrl);
            try
            {
                objArr = objComment.Get_CommentList_By_ActivityId(ActivityId, access);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return objArr;
        }

        /// <summary>
        /// Get a comment By Comment Id.
        /// </summary>
        /// <param name="CommentId"></param>
        /// <param name="access"></param>
        /// <returns></returns>
        public JArray GetCommentsByCommentId(string CommentId, string access)
        {
            Comments objComment = new Comments(_clientId, _clientSecret, _redirectUrl);
            try
            {
                objArr = objComment.Get_Comments_By_CommentId(CommentId, access);
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return objArr;
        }
    }
}
