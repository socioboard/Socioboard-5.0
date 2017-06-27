using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Socioboard.Pinterest.User
{
    public class User
    {
        public string UserInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestUserInfoUrl = Global.UserInfo + AccessToken + "&fields=first_name%2Cid%2Clast_name%2Curl%2Caccount_type%2Cusername%2Cbio%2Ccounts%2Ccreated_at%2Cimage";
                output = Global.HttpWebGetRequest(PinterestUserInfoUrl);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UserBoardInfo(string AccessToken)
        {

            try
            {
                string output = string.Empty;
                string PinterestUserBoardInfoUrl = Global.UserBoardInfo + AccessToken + "&fields=id%2Cname%2Curl%2Ccounts%2Ccreated_at%2Ccreator%2Cdescription%2Cimage%2Cprivacy%2Creason";
                output = Global.HttpWebGetRequest(PinterestUserBoardInfoUrl);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string SuggestedBoardInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestSuggestedBoardInfoUrl = Global.UserSuggestedBoardInfo + AccessToken + "&fields=id%2Cname%2Curl%2Ccounts%2Ccreated_at%2Ccreator%2Cdescription%2Cimage%2Cprivacy%2Creason";
                output = Global.HttpWebGetRequest(PinterestSuggestedBoardInfoUrl);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UserBoardFollowerInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestUserBoardFollowerInfo = Global.UserBoardFollower + AccessToken + "&fields=first_name%2Cid%2Clast_name%2Curl%2Caccount_type%2Cusername%2Cbio%2Ccounts%2Ccreated_at%2Cimage";
                output = Global.HttpWebGetRequest(PinterestUserBoardFollowerInfo);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UserBoardFollowingInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string pinterestUserBoardFollowingInfo = Global.UserBoardfollowing + AccessToken + "&fields=id%2Cname%2Curl%2Ccreator%2Ccreated_at%2Ccounts%2Cdescription%2Cimage%2Cprivacy%2Creason";
                output = Global.HttpWebGetRequest(pinterestUserBoardFollowingInfo);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string FollowBoard(string AccessToken, string BoardId)
        {
            try
            {
                string output = string.Empty;
                string followBoard = Global.FollowBoard + AccessToken;
                string postData = "board=" + BoardId;
                output = Global.HttpWebPostRequest(new Uri(followBoard), postData);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UnFollowBoard(string AccessToken, string BoardId)
        {
            try
            {
                string output = string.Empty;
                string unfollowBoard = Global.UnfollowBoard + BoardId + "/?access_token =" + AccessToken;
                string postData = "board=" + BoardId;
                output = Global.HttpWebDeleteRequest(new Uri(unfollowBoard), postData);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UserFollowerInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestUserFollowerInfo = Global.UserFollower + AccessToken + "&fields=first_name%2Cid%2Clast_name%2Curl%2Ccreated_at%2Ccounts%2Cbio%2Caccount_type%2Cusername";
                output = Global.HttpWebGetRequest(PinterestUserFollowerInfo);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string InterestsFollowerInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestInterestsFollowerInfo = Global.InterestsFollower + AccessToken + "&fields=id%2Cname";
                output = Global.HttpWebGetRequest(PinterestInterestsFollowerInfo);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string FollowUser(string AccessToken, string UserId)
        {
            try
            {
                string output = string.Empty;
                string followUser = Global.FollowUser + AccessToken;
                string postData = "user=" + UserId;
                output = Global.HttpWebPostRequest(new Uri(followUser), postData);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UnFollowUser(string AccessToken, string UserId)
        {
            try
            {
                string output = string.Empty;
                string UnfollowUser = Global.Unfollowuser + UserId + "/?access_token =" + AccessToken;
                string postData = "user=" + UserId;
                output = Global.HttpWebDeleteRequest(new Uri(UnfollowUser), postData);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UserlikesInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestUserLikesInfo = Global.Userlikes + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cattribution%2Cboard%2Ccolor%2Ccreated_at%2Ccreator%2Ccounts%2Cimage%2Coriginal_link%2Cmetadata%2Cmedia";
                output = Global.HttpWebGetRequest(PinterestUserLikesInfo);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UserpinsInfo(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string PinterestUserPinsInfo = Global.UserPins + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cattribution%2Cmedia%2Cmetadata%2Cboard%2Ccolor%2Coriginal_link%2Ccounts%2Ccreated_at%2Ccreator%2Cimage";
                output = Global.HttpWebGetRequest(PinterestUserPinsInfo);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string SearchUserboard(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string SearchUserboards = Global.SearchUserBoard + AccessToken + "&fields=id%2Cname%2Curl%2Ccounts%2Ccreated_at%2Ccreator%2Cdescription%2Cimage%2Cprivacy%2Creason";
                output = Global.HttpWebGetRequest(SearchUserboards);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string SearchUserpins(string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string SearchUserpins = Global.SearchUserPins + AccessToken + "&fields=id%2Clink%2Cnote%2Curl%2Cboard%2Cattribution%2Cmedia%2Cmetadata%2Ccolor%2Ccounts%2Coriginal_link%2Ccreated_at%2Ccreator%2Cimage";
                output = Global.HttpWebGetRequest(SearchUserpins);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public string UseruserInfo(string UserId, string AccessToken)
        {
            try
            {
                string output = string.Empty;
                string UserInfoUrl = Global.UseruserInfo + UserId + "/?access_token=" + AccessToken + "&fields=first_name%2Cid%2Clast_name%2Curl%2Cbio%2Caccount_type%2Cusername%2Ccounts%2Ccreated_at%2Cimage";
                output = Global.HttpWebGetRequest(UserInfoUrl);
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
    }
}
