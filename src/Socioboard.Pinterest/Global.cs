using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Socioboard.Pinterest
{
    public static class Global
    {
        public static HttpWebRequest gRequest;
        public static HttpWebResponse gResponse;
        #region PinterestUserMethods
        public static string AuthTokenUrl = "https://api.pinterest.com/v1/oauth/token?";
        public static string UserInfo = "https://api.pinterest.com/v1/me/?access_token=";
        public static string UseruserInfo = "https://api.pinterest.com/v1/users/";
        public static string UserBoardInfo = "https://api.pinterest.com/v1/me/boards/?access_token=";
        public static string UserSuggestedBoardInfo = "https://api.pinterest.com/v1/me/boards/suggested/?access_token=";
        public static string UserBoardFollower = "https://api.pinterest.com/v1/me/followers/?access_token=";
        public static string UserBoardfollowing = "https://api.pinterest.com/v1/me/following/boards/?access_token=";
        public static string FollowBoard = "https://api.pinterest.com/v1/me/following/boards/?access_token=";
        public static string UnfollowBoard = "https://api.pinterest.com/v1/me/following/boards/";
        public static string UserFollower = "https://api.pinterest.com/v1/me/following/users/?access_token=";
        public static string InterestsFollower = "https://api.pinterest.com/v1/me/following/interests/?access_token=";
        public static string FollowUser = "https://api.pinterest.com/v1/me/following/users/?access_token=";
        public static string Unfollowuser = "https://api.pinterest.com/v1/me/following/users/";
        public static string Userlikes = "https://api.pinterest.com/v1/me/likes/?access_token=";
        public static string UserPins = "https://api.pinterest.com/v1/me/pins/?access_token=";
        public static string SearchUserBoard = "https://api.pinterest.com/v1/me/search/boards/?query=20&access_token=";
        public static string SearchUserPins = "https://api.pinterest.com/v1/me/search/pins/?query=20&access_token=";
        #endregion
        #region PinterestBoardMethods
        public static string BoardCreationUrl = "https://api.pinterest.com/v1/boards/?access_token=";
        public static string BoardUrl = "https://api.pinterest.com/v1/boards/";
        #endregion
        #region PinterestPinMethods
        public static string PinCreationUrl = "https://api.pinterest.com/v1/pins/?access_token=";
        public static string PinUrl = "https://api.pinterest.com/v1/pins/";
        #endregion


        public static string HttpWebGetRequest(string Url)
        {
            try
            {
                string output = string.Empty;
                var Pinterestrequest = (HttpWebRequest)WebRequest.Create(Url);
                Pinterestrequest.Method = "GET";
                Pinterestrequest.Credentials = CredentialCache.DefaultCredentials;
                Pinterestrequest.AllowWriteStreamBuffering = true;
                Pinterestrequest.ServicePoint.Expect100Continue = false;
                Pinterestrequest.PreAuthenticate = false;
                try
                {
                    using (var response = Pinterestrequest.GetResponse())
                    {
                        using (var stream = new StreamReader(response.GetResponseStream(), Encoding.GetEncoding(1252)))
                        {
                            output = stream.ReadToEnd();
                        }
                    }
                }
                catch (Exception ex)
                {
                    return "SomeThing Went Wrong";
                }
                return output;
            }
            catch (Exception)
            {
                return "SomeThing Went Wrong";
            }
        }
        public static string HttpWebDeleteRequest(Uri formActionUrl, string postData)
        {
            try
            {
                gRequest = (HttpWebRequest)WebRequest.Create(formActionUrl);
                gRequest.Host = "api.pinterest.com";
                gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
                gRequest.Method = "DELETE";
                gRequest.Accept = "text/html, */*; q=0.01";
                gRequest.KeepAlive = true;
                gRequest.ContentType = @"application/x-www-form-urlencoded; charset=UTF-8";
                gRequest.Headers.Add("Accept-Language", "en-US,en;q=0.8");
                gRequest.Headers.Add("Accept-Encoding", "gzip, deflate, br");
                gRequest.Headers.Add("Origin", "https://developers.pinterest.com");
                try
                {
                    string postdata = string.Format(postData);
                    byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
                    gRequest.ContentLength = postBuffer.Length;
                    Stream postDataStream = gRequest.GetRequestStream();
                    postDataStream.Write(postBuffer, 0, postBuffer.Length);
                    postDataStream.Close();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);

                }
                //Get Response for this request url
                try
                {
                    gResponse = (HttpWebResponse)gRequest.GetResponse();
                }
                catch (WebException ex)
                {
                    Console.WriteLine(ex);
                }
                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                string responseString = reader.ReadToEnd();
                reader.Close();
                return responseString;
            }
            catch (Exception ex)
            {
                return "";
            }
        }
        public static string HttpWebPatchRequest(Uri formActionUrl, string postData)
        {
            try
            {
                gRequest = (HttpWebRequest)WebRequest.Create(formActionUrl);
                gRequest.Host = "api.pinterest.com";
                gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
                gRequest.Method = "PATCH";
                gRequest.Accept = "text/html, */*; q=0.01";
                gRequest.KeepAlive = true;
                gRequest.ContentType = @"application/x-www-form-urlencoded; charset=UTF-8";
                gRequest.Headers.Add("Accept-Language", "en-US,en;q=0.8");
                gRequest.Headers.Add("Accept-Encoding", "gzip, deflate, br");
                gRequest.Headers.Add("Origin", "https://developers.pinterest.com");
                try
                {
                    string postdata = string.Format(postData);
                    byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
                    gRequest.ContentLength = postBuffer.Length;
                    Stream postDataStream = gRequest.GetRequestStream();
                    postDataStream.Write(postBuffer, 0, postBuffer.Length);
                    postDataStream.Close();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);

                }
                //Get Response for this request url
                try
                {
                    gResponse = (HttpWebResponse)gRequest.GetResponse();
                }
                catch (WebException ex)
                {
                    Console.WriteLine(ex);
                }
                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                string responseString = reader.ReadToEnd();
                reader.Close();
                return responseString;
            }
            catch (Exception ex)
            {
                return "";
            }
        }
        public static string HttpWebPostRequest(Uri formActionUrl, string postData)
        {
            try
            {
                gRequest = (HttpWebRequest)WebRequest.Create(formActionUrl);
                gRequest.Host = "api.pinterest.com";
                gRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
                gRequest.Method = "POST";
                gRequest.Accept = "text/html, */*; q=0.01";
                gRequest.KeepAlive = true;
                gRequest.ContentType = @"application/x-www-form-urlencoded; charset=UTF-8";
                gRequest.Headers.Add("Accept-Language", "en-US,en;q=0.8");
                gRequest.Headers.Add("Accept-Encoding", "gzip, deflate, br");
               // gRequest.Headers.Add("Origin", "https://developers.pinterest.com");
                try
                {
                    string postdata = string.Format(postData);
                    byte[] postBuffer = System.Text.Encoding.GetEncoding(1252).GetBytes(postData);
                    gRequest.ContentLength = postBuffer.Length;
                    Stream postDataStream = gRequest.GetRequestStream();
                    postDataStream.Write(postBuffer, 0, postBuffer.Length);
                    postDataStream.Close();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);

                }
                //Get Response for this request url
                try
                {
                    gResponse = (HttpWebResponse)gRequest.GetResponse();
                }
                catch (WebException ex)
                {
                    Console.WriteLine(ex);
                }
                StreamReader reader = new StreamReader(gResponse.GetResponseStream());
                string responseString = reader.ReadToEnd();
                reader.Close();
                return responseString;
            }
            catch (Exception ex)
            {
                return "";
            }
        }
        
    }
}
