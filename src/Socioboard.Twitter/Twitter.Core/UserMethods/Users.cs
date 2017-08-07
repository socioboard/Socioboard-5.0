using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Xml;
using Socioboard.Twitter.App.Core;
using Socioboard.Twitter.Authentication;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Collections;
namespace Socioboard.Twitter.Twitter.Core.UserMethods
{
    public class Users
    {
   
        private XmlDocument xmlResult;

        public Users()
        {
            xmlResult = new XmlDocument();
        }

     

     
        public int FollowersCount(oAuthTwitter oAuth, string screenname, SortedDictionary<string, string> strdic)
        {
            string RequestUrl = "https://api.twitter.com/1/users/lookup.xml?screen_name=" + screenname;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            
            
            
            xmlResult.Load(new StringReader(response));
            TwitterUser twtUser = new TwitterUser();
            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("user");
            int count = 0;
            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement idElement = (XmlElement)xn;
                count = Convert.ToInt32(idElement.GetElementsByTagName("followers_count")[0].InnerText);
            }
            return count;
        }

        public int getFollowers(string Screenname)
        {
            string RequestUrl = "http://api.twitter.com/1/followers/ids.json?screen_name=" + Screenname;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(RequestUrl);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
           
            
            
            
            Stream resStream = response.GetResponseStream();
            StreamReader sr = new StreamReader(resStream);
            string line = sr.ReadToEnd();
            JObject jo = JObject.Parse(line);
            var divid = jo["ids"];
            int i = 0;
            foreach (var item in divid)
            {
                i++;
            }
            int length = i;
            return length;   
        }

        public string imageurl(string screenname)
        {
            string RequestUrl = "https://api.twitter.com/1/users/lookup.json?screen_name=" + screenname;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(RequestUrl);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();


            Stream resStream = response.GetResponseStream();
            StreamReader sr = new StreamReader(resStream);
            string line = sr.ReadToEnd();
            JArray jo = JArray.Parse(line);
            JToken job  = null;
            foreach (var item in jo)
            {
                 job = item["profile_image_url"];
               
            }              


            return job.ToString();
        }

		public string TwitterName(string screenname)
        {
            string RequestUrl = "https://api.twitter.com/1/users/lookup.json?screen_name=" + screenname;
              HttpWebRequest request = (HttpWebRequest)WebRequest.Create(RequestUrl);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();


            Stream resStream = response.GetResponseStream();
            StreamReader sr = new StreamReader(resStream);
            string line = sr.ReadToEnd();
            JArray jo = JArray.Parse(line);
            JToken job  = null;
            foreach (var item in jo)
            {
                 job = item["name"];
               
            }              


            return job.ToString();
        }
		

        #region Get_Account_Settings
       /// <summary>
        /// Returns settings (including current trend, geo and sleep time information) for the authenticating user. 
       /// </summary>
       /// <param name="oAuth"></param>
       /// <returns></returns>
        public JArray Get_Account_Settings(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetAccountSettingsUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Account_Verify_Credentials
        /// <summary>
        /// Returns an HTTP 200 OK response code and a representation of the requesting user if authentication was successful; 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Account_Verify_Credentials(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetAccountVerifyCredentialsUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Settings
       /// <summary>
        /// Updates the authenticating user's settings.
       /// </summary>
       /// <param name="oAuth"></param>
        /// <param name="trend_location_woeid">The Yahoo! Where On Earth ID to use as the user's default trend location. Global information is available by using 1 as the WOEID.</param>
        /// <param name="sleep_time_enabled">When set to true, t or 1, will enable sleep time for the user.</param>
        /// <param name="start_sleep_time">The hour that sleep time should begin if it is enabled.</param>
        /// <param name="end_sleep_time">The hour that sleep time should end if it is enabled.</param>
        /// <param name="time_zone">The timezone dates and times should be displayed in for the user.</param>
        /// <param name="lang">The language which Twitter should render in for this user. </param>
       /// <returns></returns>
        public JArray Post_Account_Settings(oAuthTwitter oAuth, string trend_location_woeid, string sleep_time_enabled, string start_sleep_time, string end_sleep_time, string time_zone, string lang)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountSettingsUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            string PostData = "lang=en";
            if (lang != null)
               strdic.Add("lang",lang);
            if (trend_location_woeid != null)
                strdic.Add("trend_location_woeid",trend_location_woeid);
            if (sleep_time_enabled != null)
                strdic.Add("sleep_time_enabled",sleep_time_enabled);
            if (start_sleep_time != null)
                strdic.Add("start_sleep_time",start_sleep_time);
            if (end_sleep_time != null)
                strdic.Add("end_sleep_time",end_sleep_time);
            if (time_zone != null)
                strdic.Add("time_zone" , time_zone);

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Update_Delivery_Device
        /// <summary>
        /// Sets which device Twitter delivers updates to for the authenticating user.
       /// </summary>
       /// <param name="oAuth"></param>
        /// <param name="device">Must be one of: sms, none.</param>
       /// <returns></returns>
        public JArray Post_Account_Update_Delivery_Device(oAuthTwitter oAuth, string device)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountUpdateDeliveryDeviceUrl;

            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("device", device);
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Update_Profile
        /// <summary>
        /// Sets values that users are able to set under the "Account" tab of their settings page. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="name">Full name associated with the profile. Maximum of 20 characters.</param>
        /// <param name="url">URL associated with the profile. Will be prepended with "http://" if not present. </param>
        /// <param name="location">The city or country describing where the user of the account is located.</param>
        /// <param name="description">A description of the user owning the account. Maximum of 160 characters.</param>
        /// <param name="include_entities">The entities node will not be included when set to false.</param>
        /// <param name="skip_status">When set to either true, t or 1 statuses will not be included in the returned user objects.</param>
        /// <returns></returns>
        public JArray Post_Account_Update_Profile(oAuthTwitter oAuth, string name,string url,string location,string description,bool include_entities,bool skip_status)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountUpdateProfileUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("include_entities", include_entities.ToString());
            strdic.Add("skip_status", skip_status.ToString());
            if (name != null)
                strdic.Add("name",name);
            if (url != null)
                strdic.Add("url",url);
            if (location != null)
                strdic.Add("location",location);
            if (description != null)
               strdic.Add("description",description);


            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Update_Profile_Background_Image
        /// <summary>
        /// Updates the authenticating user's profile background image. T
      /// </summary>
      /// <param name="oAuth"></param>
      /// <param name="image">The background image for the profile, base64-encoded. Must be a valid GIF, JPG, or PNG image of less than 800 kilobytes in size.</param>
        /// <param name="tile">Whether or not to tile the background image. </param>
        /// <param name="include_entities">The entities node will not be included when set to false.</param>
        /// <param name="skip_status">When set to either true, t or 1 statuses will not be included in the returned user objects.</param>
      /// <param name="use">Determines whether to display the profile background image or not</param>
      /// <returns></returns>
        public JArray Post_Account_Update_Profile_Background_Image(oAuthTwitter oAuth, string image, string tile, bool include_entities, bool skip_status,bool use)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountUpdateProfileBackgroungImageUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("include_entities", include_entities.ToString());
            strdic.Add("skip_status",skip_status.ToString()); 
             strdic.Add("use",use.ToString());
            if (image != null)
                strdic.Add("image" ,image);
            if (tile != null)
                strdic.Add("tile",tile);

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Update_Profile_Colors
       /// <summary>
        /// Sets one or more hex values that control the color scheme of the authenticating user's profile page on twitter.com.
       /// </summary>
       /// <param name="oAuth"></param>
        /// <param name="profile_background_color">Profile background color.</param>
        /// <param name="profile_link_color">Profile link color.</param>
        /// <param name="profile_sidebar_border_color">Profile sidebar's border color.</param>
        /// <param name="profile_sidebar_fill_color">Profile sidebar's background color.</param>
        /// <param name="profile_text_color">Profile text color.</param>
        /// <param name="include_entities">The entities node will not be included when set to false.</param>
       /// <param name="skip_status">When set to either true, t or 1 statuses will not be included in the returned user objects.</param>
       /// <returns></returns>
        public JArray Post_Account_Update_Profile_Colors(oAuthTwitter oAuth, string profile_background_color, string profile_link_color,string profile_sidebar_border_color,string profile_sidebar_fill_color,string profile_text_color,bool include_entities, bool skip_status, bool use)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountUpdateProfileColorUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("include_entities", include_entities.ToString()); strdic.Add("skip_status", skip_status.ToString());strdic.Add("&use",use.ToString());
            if (profile_background_color != null)
                strdic.Add("profile_background_color" , profile_background_color);
            if (profile_link_color != null)
                strdic.Add( "profile_link_color",profile_link_color);
            if (profile_sidebar_border_color != null)
                strdic.Add("profile_sidebar_border_color" , profile_sidebar_border_color);
            if (profile_sidebar_fill_color != null)
                strdic.Add( "profile_sidebar_fill_color" , profile_sidebar_fill_color);
            if (profile_text_color != null)
                strdic.Add("profile_text_color", profile_text_color);

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Update_Profile_Image
       /// <summary>
       /// The avatar image for the profile, base64-encoded. Must be a valid GIF, JPG, or PNG image of less than 700 kilobytes in size.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="image"></param>
       /// <param name="include_entities"></param>
       /// <param name="skip_status"></param>
       /// <returns></returns>
        public JArray Post_Account_Update_Profile_Image(oAuthTwitter oAuth, string image,bool include_entities, bool skip_status)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountUpdateProfileImageUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("include_entities", include_entities.ToString());strdic.Add("skip_status" , skip_status.ToString());
            if (image != null)
                strdic.Add("image", image);

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion


        #region Suggestions
        public JArray Get_Users_Suggestions(oAuthTwitter oauth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUserSuggestions;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = oauth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }



        public JArray Get_Users_SuggestionsSlug(oAuthTwitter oauth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUserSuggestions;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            string response = oauth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        } 
        
        
        
        
        
        
        
        
        #endregion






        #region Followers
        public JArray Get_Followers_ById(oAuthTwitter oauth, string Userid)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFollowersIdUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("user_id", Userid);
            string response = oauth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region MutualFriends
        public JArray Get_Friends_ById(oAuthTwitter oauth, string Userid)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetFriendsIdUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("user_id", Userid);
            string response = oauth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Blocks_List
        /// <summary>
        ///Returns a collection of user objects that the authenticating user is blocking.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Blocks_List(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetBlocksListUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Blocks_Ids
        /// <summary>
        ///Returns an array of numeric user ids the authenticating user is blocking.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Blocks_Ids(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetBlocksIdUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Blocks_Create
       /// <summary>
        /// Blocks the specified user from following the authenticating user.
       /// </summary>
       /// <param name="oAuth"></param>
       /// <param name="user_id"></param>
       /// <returns></returns>
        public JArray Post_Blocks_Create(oAuthTwitter oAuth, string user_id)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostBlockCreateUrl;
      
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Blocks_Destroy
        /// <summary>
        /// Blocks the specified user from following the authenticating user.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="user_id"></param>
        /// <returns></returns>
        public JArray Post_Blocks_Destroy(oAuthTwitter oAuth, string user_id)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostBlocksDestroyUrl;
    
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Users_LookUp
        /// <summary>
        ///Returns fully-hydrated user objects for up to 100 users per request, as specified by comma-separated values passed to the user_id
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_LookUp(oAuthTwitter oAuth,string user_id)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersLookUpUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Users_LookUp_ByScreenName
        /// <summary>
        ///Returns fully-hydrated user objects for up to 100 users per request, as specified by comma-separated values passed to the screen_name
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_LookUp_ByScreenName(oAuthTwitter oAuth, string screen_name)
        {
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();
            strdic.Add("screen_name", screen_name);
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersLookUpUrl;
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl,strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Users_Show
        /// <summary>
        ///Returns a variety of information about the user specified by the required user_id
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_Show(oAuthTwitter oAuth, string user_id)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersShowUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Users_Search
        /// <summary>
        ///Provides a simple, relevance-based search interface to public user accounts on Twitter. 
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_Search(oAuthTwitter oAuth, string keyword,string count)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersSearchUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("q", keyword);
            strdic.Add("count", count);
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Users_Contributees
        /// <summary>
        ///Returns a collection of users that the specified user can "contribute" to.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_Contributees(oAuthTwitter oAuth, string user_id)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersContributeesUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Get_Users_Contributors
        /// <summary>
        ///Returns a collection of users who can contribute to the specified account.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_Contributors(oAuthTwitter oAuth, string user_id)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersContributorsUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

        #region Post_Account_Remove_Profile_Banner
        /// <summary>
        /// Removes the uploaded profile banner for the authenticating user. Returns HTTP 200 upon success
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="image"></param>
        /// <param name="include_entities"></param>
        /// <param name="skip_status"></param>
        /// <returns></returns>
        public string Post_Account_Remove_Profile_Banner(oAuthTwitter oAuth)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountRemoveProfileBannerUrl;
                        SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            return response;
        }
        #endregion

        #region Post_Account_Remove_Profile_Banner
     /// <summary>
        /// Uploads a profile banner on behalf of the authenticating user.
        /// If providing any one of the height, width, offset_left, or offset_top parameters, you must provide all of the sizing parameters
     /// </summary>
     /// <param name="oAuth"></param>
     /// <param name="banner"></param>
     /// <param name="height"></param>
     /// <param name="width"></param>
     /// <param name="offset_left"></param>
     /// <param name="offset_top"></param>
     /// <returns></returns>
        public string Post_Account_Update_Profile_Banner(oAuthTwitter oAuth, string banner, int height, int width, string offset_left, string offset_top)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.PostAccountUpdateProfileBannerUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("banner", banner);
            
       
            if (height != null)
                strdic.Add("height", height.ToString()); strdic.Add("width", width.ToString()); strdic.Add("offset_left", offset_left);strdic.Add("offset_top", offset_top);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.POST, RequestUrl, strdic);
            return response;
        }
        #endregion

        #region Get_Users_Profile_Banner
        /// <summary>
        ///Returns a map of the available size variations of the specified user's profile banner.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <returns></returns>
        public JArray Get_Users_Profile_Banner(oAuthTwitter oAuth, string user_id)
        {
            string RequestUrl = Socioboard.Twitter.App.Core.Globals.GetUsersProfileBannerUrl;
            SortedDictionary<string, string> strdic = new SortedDictionary<string, string>();

            strdic.Add("user_id", user_id);
            
            string response = oAuth.oAuthWebRequest(oAuthTwitter.Method.GET, RequestUrl, strdic);
            if (!response.StartsWith("["))
                response = "[" + response + "]";
            return JArray.Parse(response);
        }
        #endregion

    }
}


