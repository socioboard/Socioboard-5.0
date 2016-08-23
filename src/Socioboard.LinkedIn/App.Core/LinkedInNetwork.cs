using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.ShareAndSocialStreamMethods;

namespace Socioboard.LinkedIn.App.Core
{
    public class LinkedInNetwork
    {
        private XmlDocument xmlResult;

        public LinkedInNetwork()
        {
            xmlResult = new XmlDocument();
        }

        public List<Network_Updates> NetworkUpdatesList = new List<Network_Updates>();

        public struct Network_Updates
        {
            public string DateTime { get; set; }
            public string UpdateType { get; set; }
            public string PersonId { get; set; }
            public string PersonFirstName { get; set; }
            public string PersonLastName { get; set; }
            public string PersonHeadLine { get; set; }
            public string PictureUrl { get; set; }
            public string Message { get; set; }
            public string GroupName { get; set; }
            public string id { get; set; }
            public string Description { get; set; }
            public string Title { get; set; }
            public string ShortenUrl { get; set; }
            public string url { get; set; }
            public string ImageUrl { get; set; }

        }


        /// <summary>
        /// The Get Network Updates API returns the users network updates, which is the LinkedIn term for the user's feed.
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="Count"></param>
        /// <returns></returns>
        public List<Network_Updates> GetNetworkUpdates(oAuthLinkedIn OAuth, int Count)
        {
            Network_Updates network_Updates;

            //SocialStream socialStream = new SocialStream();
            ShareAndSocialStream socialStream = new ShareAndSocialStream();
            xmlResult = socialStream.Get_NetworkUpdates(OAuth, Count);

            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("update");

            foreach (XmlNode xn in xmlNodeList)
            {
                network_Updates = new Network_Updates();
                try
                {
                    XmlElement Element = (XmlElement)xn;
                    double timestamp = Convert.ToDouble(Element.GetElementsByTagName("timestamp")[0].InnerText);
                    network_Updates.DateTime = JavaTimeStampToDateTime(timestamp);


                    try
                    {
                        network_Updates.UpdateType = Element.GetElementsByTagName("update-type")[0].InnerText;
                    }
                    catch
                    { }

                    try
                    {
                        network_Updates.PersonId = Element.GetElementsByTagName("id")[0].InnerText;
                    }
                    catch
                    { }
                    try
                    {
                        network_Updates.Description = Element.GetElementsByTagName("description")[0].InnerText;
                    }
                    catch
                    { }


                    try
                    {
                        network_Updates.Title = Element.GetElementsByTagName("title")[0].InnerText;
                    }
                    catch
                    { }

                    try
                    {
                        network_Updates.ShortenUrl = Element.GetElementsByTagName("shortened-url")[0].InnerText;
                    }
                    catch
                    { }

                    try
                    {
                        network_Updates.PersonFirstName = Element.GetElementsByTagName("first-name")[0].InnerText;
                    }
                    catch
                    {
                        network_Updates.PersonFirstName = Element.GetElementsByTagName("name")[0].InnerText;
                    }

                    try
                    {
                        network_Updates.PersonLastName = Element.GetElementsByTagName("last-name")[0].InnerText;
                    }
                    catch
                    {
                        network_Updates.PersonLastName = null;
                    }

                    try
                    {
                        network_Updates.PersonHeadLine = Element.GetElementsByTagName("headline")[0].InnerText;
                    }
                    catch
                    { }

                    try
                    {
                        network_Updates.PictureUrl = Element.GetElementsByTagName("picture-url")[0].InnerText;
                    }
                    catch
                    { }

                    try
                    {
                        if (network_Updates.UpdateType == "CMPY")
                        {
                            network_Updates.url = Element.GetElementsByTagName("url")[0].InnerText;
                        }
                        else {
                            network_Updates.url = Element.GetElementsByTagName("url")[1].InnerText;
                        }
                    }
                    catch
                    { }
                    try
                    {
                        network_Updates.ImageUrl = Element.GetElementsByTagName("submitted-image-url")[0].InnerText;
                    }
                    catch
                    { }


                    string MessageType = Element.GetElementsByTagName("update-type")[0].InnerText;

                    if (MessageType == "CONN")
                    {

                        XmlElement innerElement = (XmlElement)xn;
                        string personFirstName = "";
                        string personLastName = "";
                        string Personheadline = "";

                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
                        }
                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
                        }
                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
                        }

                        network_Updates.Message = network_Updates.PersonFirstName + " " + network_Updates.PersonLastName + " is now connected to  " + personFirstName + " " + personLastName;

                    }
                    else if (MessageType == "NCON")
                    {
                        XmlElement innerElement = (XmlElement)xn;
                        string personFirstName = "";
                        string personLastName = "";
                        string Personheadline = "";

                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
                        }
                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
                        }
                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
                        }
                        network_Updates.Message = network_Updates.PersonFirstName + " " + network_Updates.PersonLastName + " is now connected with  " + personFirstName + " " + personLastName;
                    }
                    else if (MessageType == "CCEM")
                    {
                        XmlElement innerElement = (XmlElement)xn;
                        string personFirstName = "";
                        string personLastName = "";
                        string Personheadline = "";

                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            personFirstName = innerElement.GetElementsByTagName("first-name")[1].InnerText;
                        }
                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            personLastName = innerElement.GetElementsByTagName("last-name")[1].InnerText;
                        }
                        if (innerElement.SelectSingleNode("picture-url") == null)
                        {
                            Personheadline = innerElement.GetElementsByTagName("headline")[1].InnerText;
                        }
                        network_Updates.Message = network_Updates.PersonFirstName + " " + network_Updates.PersonLastName + " is now connected with  " + personFirstName + " " + personLastName;
                    }
                    else if (MessageType == "SHAR")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "STAT")
                    {
                        network_Updates.Message = Element.GetElementsByTagName("current-status")[0].InnerText;
                    }
                    else if (MessageType == "VIRL")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "JGRP")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "QSTN")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "ANSW")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "APPM")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "APPS")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "PRFU")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "PRFX")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "PREC")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "SVPR")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "JOBP")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "CMPY")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.url;
                    }
                    else if (MessageType == "MSFC")
                    {
                        network_Updates.Message = network_Updates.Title + " " + network_Updates.Description + "" + network_Updates.ShortenUrl;
                    }
                    else if (MessageType == "PICU")
                    {
                        network_Updates.Message = network_Updates.PersonFirstName + " " + network_Updates.PersonLastName + " Updated their profile picture";
                    }
                    else if (MessageType == "PROF")
                    {
                        network_Updates.Message = network_Updates.PersonFirstName + " " + network_Updates.PersonLastName + " Updated their profile";
                    }

                    NetworkUpdatesList.Add(network_Updates);
                }
                catch
                {

                }
            }
            return NetworkUpdatesList;

        }


        public static string JavaTimeStampToDateTime(double javaTimeStamp)
        {
            // Java timestamp is millisecods past epoch
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            dtDateTime = dtDateTime.AddSeconds(Math.Round(javaTimeStamp / 1000)).ToLocalTime();
            string date = dtDateTime.ToString("MMMM dd, yy H:mm:ss tt");
            return date;
        }


    }
}
