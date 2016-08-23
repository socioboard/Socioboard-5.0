using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.LinkedIn.Core.ShareAndSocialStreamMethods;
using Socioboard.LinkedIn.Authentication;

namespace Socioboard.LinkedIn.App.Core
{
    public class LinkedInUser
    {
        private XmlDocument xmlResult;

        public LinkedInUser()
        {
            xmlResult = new XmlDocument();
        }

        public List<User_Updates> UserUpdatesList = new List<User_Updates>();

        public struct User_Updates
        {
            public string DateTime { get; set; }
            public string UpdateType { get; set; }
            public string PersonId { get; set; }
            public string PersonFirstName { get; set; }
            public string PersonLastName { get; set; }
            public string PersonHeadLine { get; set; }
            public string PictureUrl { get; set; }
            public string Message { get; set; }
            public string Comment { get; set; }

        }

        /// <summary>
        /// To retrieve updates from 1st degree connections of the authenticated user
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="LinkedInId"></param>
        /// <param name="Count"></param>
        /// <returns></returns>
        //public List<Domain.Socioboard.Domain.LinkedInUser.User_Updates> GetUserUpdates(oAuthLinkedIn OAuth, string LinkedInId, int Count)
        //{
        //    Domain.Socioboard.Domain.LinkedInUser.User_Updates user_Updates = new Domain.Socioboard.Domain.LinkedInUser.User_Updates();
        //    List<Domain.Socioboard.Domain.LinkedInUser.User_Updates> UserUpdatesList = new List<Domain.Socioboard.Domain.LinkedInUser.User_Updates>();
        //    // SocialStream socialStream = new SocialStream();
        //    ShareAndSocialStream socialStream = new ShareAndSocialStream();
        //    xmlResult = socialStream.Get_UserUpdates(OAuth, LinkedInId, Count);

        //    XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("update");

        //    foreach (XmlNode xn in xmlNodeList)
        //    {

        //        try
        //        {
        //            XmlElement Element = (XmlElement)xn;
        //            double timestamp = Convert.ToDouble(Element.GetElementsByTagName("timestamp")[0].InnerText);
        //            user_Updates.DateTime = JavaTimeStampToDateTime(timestamp);


        //            try
        //            {
        //                user_Updates.UpdateType = Element.GetElementsByTagName("update-type")[0].InnerText;
        //            }
        //            catch
        //            { }




        //            try
        //            {
        //                user_Updates.PersonId = Element.GetElementsByTagName("id")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.PersonFirstName = Element.GetElementsByTagName("first-name")[0].InnerText;
        //            }
        //            catch
        //            { }




        //            try
        //            {
        //                user_Updates.PersonLastName = Element.GetElementsByTagName("last-name")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.PersonHeadLine = Element.GetElementsByTagName("headline")[0].InnerText;
        //            }
        //            catch
        //            { }


        //            try
        //            {
        //                user_Updates.Comment = Element.GetElementsByTagName("comment")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.PictureUrl = Element.GetElementsByTagName("picture-url")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            string MessageType = "";

        //            try
        //            {
        //                MessageType = Element.GetElementsByTagName("update-type")[0].InnerText;
        //            }
        //            catch
        //            { }


        //            if (MessageType == "CONN")
        //            {

        //                XmlElement innerElement = (XmlElement)xn;

        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }

        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " is now connected to  " + personFirstName + " " + personLastName;

        //            }
        //            else if (MessageType == "NCON")
        //            {
        //                XmlElement innerElement = (XmlElement)xn;
        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " is now connected with  " + personFirstName + " " + personLastName;
        //            }
        //            else if (MessageType == "CCEM")
        //            {
        //                XmlElement innerElement = (XmlElement)xn;
        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " is now connected with  " + personFirstName + " " + personLastName;
        //            }
        //            else if (MessageType == "SHAR")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";

        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " " + "Updated as" + " " + user_Updates.Comment;


        //            }
        //            else if (MessageType == "STAT")
        //            {
        //                user_Updates.Message = Element.GetElementsByTagName("current-status")[0].InnerText;
        //            }
        //            else if (MessageType == "VIRL")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "JGRP")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "QSTN")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "ANSW")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "APPM")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "APPS")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PRFU")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PRFX")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PREC")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "SVPR")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "JOBP")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "CMPY")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "MSFC")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PICU")
        //            {
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " Updated their profile picture";
        //            }
        //            else if (MessageType == "PROF")
        //            {
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " Updated their profile";
        //            }


        //            UserUpdatesList.Add(user_Updates);
        //        }
        //        catch
        //        {

        //        }
        //    }
        //    return UserUpdatesList;

        //}


        //public List<Domain.Socioboard.Domain.LinkedInUser.User_Updates> GetUserUpdate(oAuthLinkedIn OAuth, string LinkedInId, int Count)
        //{
        //    Domain.Socioboard.Domain.LinkedInUser.User_Updates user_Updates = new Domain.Socioboard.Domain.LinkedInUser.User_Updates();
        //    List<Domain.Socioboard.Domain.LinkedInUser.User_Updates> UserUpdatesList = new List<Domain.Socioboard.Domain.LinkedInUser.User_Updates>();
        //    // SocialStream socialStream = new SocialStream();
        //    ShareAndSocialStream socialStream = new ShareAndSocialStream();

        //    string streamdata = socialStream.GetLinkedIn_UserUpdates(OAuth, LinkedInId, Count);
        //    xmlResult = socialStream.Get_UserUpdates(OAuth, LinkedInId, Count);

        //    XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("update");

        //    foreach (XmlNode xn in xmlNodeList)
        //    {

        //        try
        //        {
        //            XmlElement Element = (XmlElement)xn;
        //            double timestamp = Convert.ToDouble(Element.GetElementsByTagName("timestamp")[0].InnerText);
        //            user_Updates.DateTime = JavaTimeStampToDateTime(timestamp);


        //            try
        //            {
        //                user_Updates.UpdateType = Element.GetElementsByTagName("update-type")[0].InnerText;
        //            }
        //            catch
        //            { }




        //            try
        //            {
        //                user_Updates.PersonId = Element.GetElementsByTagName("id")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.PersonFirstName = Element.GetElementsByTagName("first-name")[0].InnerText;
        //            }
        //            catch
        //            { }




        //            try
        //            {
        //                user_Updates.PersonLastName = Element.GetElementsByTagName("last-name")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.PersonHeadLine = Element.GetElementsByTagName("headline")[0].InnerText;
        //            }
        //            catch
        //            { }


        //            try
        //            {
        //                user_Updates.Comment = Element.GetElementsByTagName("comment")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.PictureUrl = Element.GetElementsByTagName("picture-url")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            string MessageType = "";

        //            try
        //            {
        //                MessageType = Element.GetElementsByTagName("update-type")[0].InnerText;
        //            }
        //            catch
        //            { }


        //            if (MessageType == "CONN")
        //            {

        //                XmlElement innerElement = (XmlElement)xn;

        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }

        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " is now connected to  " + personFirstName + " " + personLastName;

        //            }
        //            else if (MessageType == "NCON")
        //            {
        //                XmlElement innerElement = (XmlElement)xn;
        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " is now connected with  " + personFirstName + " " + personLastName;
        //            }
        //            else if (MessageType == "CCEM")
        //            {
        //                XmlElement innerElement = (XmlElement)xn;
        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " is now connected with  " + personFirstName + " " + personLastName;
        //            }
        //            else if (MessageType == "SHAR")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";

        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " " + "Updated as" + " " + user_Updates.Comment;


        //            }
        //            else if (MessageType == "STAT")
        //            {
        //                user_Updates.Message = Element.GetElementsByTagName("current-status")[0].InnerText;
        //            }
        //            else if (MessageType == "VIRL")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "JGRP")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "QSTN")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "ANSW")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "APPM")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "APPS")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PRFU")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PRFX")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PREC")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "SVPR")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "JOBP")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "CMPY")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "MSFC")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PICU")
        //            {
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " Updated their profile picture";
        //            }
        //            else if (MessageType == "PROF")
        //            {
        //                user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + " Updated their profile";
        //            }


        //            UserUpdatesList.Add(user_Updates);
        //        }
        //        catch
        //        {

        //        }
        //    }
        //    return UserUpdatesList;

        //}

        public static string JavaTimeStampToDateTime(double javaTimeStamp)
        {
            // Java timestamp is millisecods past epoch
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            dtDateTime = dtDateTime.AddSeconds(Math.Round(javaTimeStamp / 1000)).ToLocalTime();
            string date = dtDateTime.ToString("MMMM dd, yy H:mm:ss tt");
            return date;
        }

        public string SetStatusUpdate(oAuthLinkedIn OAuth, string message)
        {
            ShareAndSocialStream socialStream = new ShareAndSocialStream();
            string responce = socialStream.SetStatusUpdate(OAuth, message);
            return responce;
        }

        //public List<Domain.Socioboard.Domain.LinkedIn_Update_Messages> GetUserUpdateNew(oAuthLinkedIn OAuth, string LinkedInId, int Count)
        //{

        //    List<Domain.Socioboard.Domain.LinkedIn_Update_Messages> UserUpdatesList = new List<Domain.Socioboard.Domain.LinkedIn_Update_Messages>();
        //    // SocialStream socialStream = new SocialStream();
        //    ShareAndSocialStream socialStream = new ShareAndSocialStream();
        //    xmlResult = socialStream.Get_UserUpdates(OAuth, LinkedInId, Count);

        //    XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("update");

        //    foreach (XmlNode xn in xmlNodeList)
        //    {
        //        Domain.Socioboard.Domain.LinkedIn_Update_Messages user_Updates = new Domain.Socioboard.Domain.LinkedIn_Update_Messages();
        //        try
        //        {
        //            XmlElement Element = (XmlElement)xn;
        //            double timestamp = Convert.ToDouble(Element.GetElementsByTagName("timestamp")[0].InnerText);
        //            user_Updates.CreatedDate = JavaTimeStampToDateTime(timestamp);
        //            try
        //            {
        //                user_Updates.Type = Element.GetElementsByTagName("update-type")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.ProfileId = Element.GetElementsByTagName("id")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            string PersonFirstName = string.Empty;
        //            string PersonLastName = string.Empty;
        //            try
        //            {
        //                PersonFirstName = Element.GetElementsByTagName("first-name")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                PersonLastName = Element.GetElementsByTagName("last-name")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            user_Updates.ProfileName = PersonFirstName + " " + PersonLastName;
        //            try
        //            {
        //                //user_Updates.PersonHeadLine = Element.GetElementsByTagName("headline")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.Message = Element.GetElementsByTagName("comment")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                user_Updates.ImageUrl = Element.GetElementsByTagName("submitted-image-url")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            string MessageType = "";

        //            try
        //            {
        //                MessageType = Element.GetElementsByTagName("update-type")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.FeedId = Element.GetElementsByTagName("id")[1].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.Comments = Element.GetElementsByTagName("update-comments")[0].Attributes["total"].Value;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.Likes = Element.GetElementsByTagName("num-likes")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.ProfileUrl = Element.GetElementsByTagName("url")[1].InnerText;
        //            }
        //            catch
        //            { }
        //            try
        //            {
        //                user_Updates.ProfileImageUrl = Element.GetElementsByTagName("picture-url")[0].InnerText;
        //            }
        //            catch
        //            { }
        //            if (MessageType == "CONN")
        //            {

        //                XmlElement innerElement = (XmlElement)xn;

        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }

        //                user_Updates.Message = user_Updates.ProfileName + " is now connected to  " + personFirstName + " " + personLastName;

        //            }
        //            else if (MessageType == "NCON")
        //            {
        //                XmlElement innerElement = (XmlElement)xn;
        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }
        //                user_Updates.Message = user_Updates.ProfileName + " is now connected with  " + personFirstName + " " + personLastName;
        //            }
        //            else if (MessageType == "CCEM")
        //            {
        //                XmlElement innerElement = (XmlElement)xn;
        //                string personFirstName = "";
        //                string personLastName = "";
        //                string Personheadline = "";

        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
        //                }
        //                if (innerElement.SelectSingleNode("picture-url") == null)
        //                {
        //                    Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
        //                }
        //                user_Updates.Message = user_Updates.ProfileName + " is now connected with  " + personFirstName + " " + personLastName;
        //            }
        //            else if (MessageType == "SHAR")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";

        //                user_Updates.Message = user_Updates.ProfileName + " " + "Updated as" + " " + user_Updates.Message;


        //            }
        //            else if (MessageType == "STAT")
        //            {
        //                user_Updates.Message = Element.GetElementsByTagName("current-status")[0].InnerText;
        //            }
        //            else if (MessageType == "VIRL")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "JGRP")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "QSTN")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "ANSW")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "APPM")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "APPS")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PRFU")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PRFX")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PREC")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "SVPR")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "JOBP")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "CMPY")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "MSFC")
        //            {
        //                //user_Updates.Message = user_Updates.PersonFirstName + " " + user_Updates.PersonLastName + "Updated their profile picture";
        //            }
        //            else if (MessageType == "PICU")
        //            {
        //                user_Updates.Message = user_Updates.ProfileName + " Updated their profile picture";
        //            }
        //            else if (MessageType == "PROF")
        //            {
        //                user_Updates.Message = user_Updates.ProfileName + " Updated their profile";
        //            }
        //            UserUpdatesList.Add(user_Updates);
        //        }
        //        catch
        //        {

        //        }
        //    }
        //    return UserUpdatesList;

        //}
    }
}
