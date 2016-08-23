using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.PeopleMethods;
using Newtonsoft.Json.Linq;

namespace Socioboard.LinkedIn.App.Core
{
    public class LinkedInProfile
    {
        private XmlDocument xmlResult;

        public LinkedInProfile()
        {
            xmlResult = new XmlDocument();
        }

        public List<UserProfile> NetworkUpdatesList = new List<UserProfile>();

        //id,first-name,last-name,headline,picture_url,educations,location,date_of_birth

        public struct UserProfile
        {
            public string id { get; set; }
            public string first_name { get; set; }
            public string last_name { get; set; }
            public string headline { get; set; }
            public string picture_url { get; set; }
            public string email { get; set; }
            public int connections { get; set; }
            public string currentstatus { get; set; }
            public string profile_url { get; set; }
        }

        /// <summary>
        /// Displays the profile the requestor is allowed to see.
        /// </summary>
        /// <param name="OAuth"></param>
        /// <returns></returns>
        public UserProfile GetUserProfile(oAuthLinkedIn OAuth)
        {
            UserProfile UserProfile = new UserProfile();

            People peopleConnection = new People();
            
            //xmlResult = peopleConnection.Get_UserProfile(OAuth);

            //XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("update");
            string linkedin_data = peopleConnection.GetLinkedIn_UserProfile(OAuth);
            var profileData = JObject.Parse(linkedin_data);
            try
            {
               // UserProfile.id = xmlResult.GetElementsByTagName("id")[0].InnerText;
                UserProfile.id = profileData["id"].ToString();
            }
            catch { }

            try
            {
                //UserProfile.email = xmlResult.GetElementsByTagName("email-address")[0].InnerText;
                UserProfile.email = profileData["emailAddress"].ToString();
            }
            catch { }
            try
            {

               // UserProfile.profile_url = xmlResult.GetElementsByTagName("url")[0].InnerText;
                UserProfile.profile_url = profileData["siteStandardProfileRequest"]["url"].ToString();

            }
            catch 
            { }
          
            try
            {
               // UserProfile.first_name = xmlResult.GetElementsByTagName("first-name")[0].InnerText;
                UserProfile.first_name = profileData["firstName"].ToString();
            }
            catch { }

            try
            {
                //UserProfile.last_name = xmlResult.GetElementsByTagName("last-name")[0].InnerText;
                UserProfile.last_name = profileData["lastName"].ToString();
            }
            catch { }


            try
            {
                //UserProfile.headline = xmlResult.GetElementsByTagName("headline")[0].InnerText;
                UserProfile.headline = profileData["headline"].ToString();
            }
            catch { }

            try
            {
                //UserProfile.picture_url = xmlResult.GetElementsByTagName("picture-url")[0].InnerText;
                //UserProfile.picture_url = profileData["siteStandardProfileRequest"]["url"].ToString();
            }
            catch { }
            try
            {
               // XmlDocument xmlConnection = new XmlDocument();
                //xmlConnection = peopleConnection.Get_People_Connection(OAuth);
               // UserProfile.connections = Convert.ToInt32(xmlConnection.GetElementsByTagName("num-connections")[0].InnerText);
                string ConnectionData = peopleConnection.GetLinkedIn_Get_People_Connection(OAuth);
                var profile_connection = JObject.Parse(ConnectionData);
                UserProfile.connections = Convert.ToInt32(profile_connection["numConnections"].ToString());
                UserProfile.picture_url = profile_connection["pictureUrl"].ToString();
            }
            catch { }    
            
            return UserProfile;

        }

    }
}
