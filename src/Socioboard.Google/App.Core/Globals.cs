using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Socioboard.GoogleLib.App.Core
{
    public static class Globals
    {
        public static string strAuthentication = "https://accounts.google.com/o/oauth2/auth";
        public static string strRefreshToken = "https://accounts.google.com/o/oauth2/token";
        public static string strRefreshTokenGPlus = "https://www.googleapis.com/oauth2/v4/token";
        public static string strUserInfo = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
        public static string strRevokeToken = "https://accounts.google.com/o/oauth2/revoke?token=";
        public static string strPeopleIf= "https://www.googleapis.com/plus/v1/people/";

        #region People
        public static string strGetPeopleProfile = "https://www.googleapis.com/plus/v1/people/";
        public static string strGetSearchPeople = "https://www.googleapis.com/plus/v1/people?query=";
        public static string strGetPeopleListByActivity = "https://www.googleapis.com/plus/v1/activities/";
        public static string strGetPeopleList = "https://www.googleapis.com/plus/v1/people/[userId]/people/[collection]"; 
        #endregion

        #region Activities
        public static string strGetActivitiesList = "https://www.googleapis.com/plus/v1/people/[ProfileId]/activities/public";
        public static string strGetActivityById = "https://www.googleapis.com/plus/v1/activities/";
        public static string strGetSearchActivity = "https://www.googleapis.com/plus/v1/activities/"; 
        #endregion

        #region Comments
        public static string strGetCommentListByActivityId = "https://www.googleapis.com/plus/v1/activities/[ActivityId]/comments";
        public static string strGetCommentByCommentId = "https://www.googleapis.com/plus/v1/comments/"; 
        #endregion

        #region Moments
        public static string strMoments = "https://www.googleapis.com/plus/v1/people/";
        public static string strRemoveMoments = "https://www.googleapis.com/plus/v1/moments/"; 
        #endregion

        #region Like_reshare
        public static string strLike = "https://www.googleapis.com/plus/v1/activities/[activityId]/people/plusoners";
        public static string strReshare = "https://www.googleapis.com/plus/v1/activities/[activityId]/people/resharers";
        #endregion

        #region Google Analytics
        public static string strgetGaAccounts = "https://www.googleapis.com/analytics/v3/management/accounts/";
        public static string strGetGaAnalytics = "https://www.googleapis.com/analytics/v3/data/ga?ids=ga:";
        #endregion


        #region Blogger
        public static string strUserInfoBlogger = "https://www.googleapis.com/oauth2/v3/userinfo?alt=json";

        public static string strBlogInfo= "https://www.googleapis.com/blogger/v3/users/self";
        public static string strBlogInfoByUserid = "https://www.googleapis.com/blogger/v3/users/[userId]/blogs";
        public static string strGetUserBlogs = "https://www.googleapis.com/blogger/v3/users/self/blogs";
        public static string strGetBlogInfoByBlogId = "https://www.googleapis.com/blogger/v3/blogs/[blogId]";
        public static string strGetBlogsByUrl = "https://www.googleapis.com/blogger/v3/blogs/byurl";
        public static string strGetBlogPosts = "https://www.googleapis.com/blogger/v3/blogs/[blogId]/posts";
        public static string strGetBlogsByPath = "https://www.googleapis.com/blogger/v3/blogs/[blogId]/posts/bypath";
        public static string strGetPostDetailsByPostId = "https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId";
        public static string strGetComments = "https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId/comments";
        public static string strGetCommentsByCommentId = "https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId/comments/commentId";

        //public static string strPostBlog = "https://www.blogger.com/feeds/[blogID]/posts/default";
        public static string strPostBlog = "https://www.googleapis.com/blogger/v3/blogs/[blogID]/posts/";
        #endregion

    }
}
