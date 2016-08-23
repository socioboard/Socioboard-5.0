using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.ShareAndSocialStreamMethods;

namespace Socioboard.LinkedIn.App.Core
{
    public class LinkedInGroup
    {

        private XmlDocument xmlResult;

        public LinkedInGroup()
        {
            xmlResult = new XmlDocument();
        }

        public List<Group_Updates> GroupUpdatesList = new List<Group_Updates>();

        public struct Group_Updates
        {
            public string id { get; set; }
            public string LinkedInProfileId { get; set; }
            public string GroupName { get; set; }
            public string GpPostid { get; set; }
            public string firstname { get; set; }
            public string lastname { get; set; }
            public string headline { get; set; }
            public string pictureurl { get; set; }
            public string title { get; set; }
            public string likes_total { get; set; }
            public string comments_total { get; set; }
            public string summary { get; set; }
            public int isFollowing { get; set; }
            public int isLiked { get; set; }

        }


        //public List<Domain.Socioboard.Domain.LinkedInGroup.Group_Updates> GetGroupUpdates(oAuthLinkedIn OAuth, int Count)
        //{
        //    Domain.Socioboard.Domain.LinkedInGroup.Group_Updates group_Updates = new Domain.Socioboard.Domain.LinkedInGroup.Group_Updates();
        //    List<Domain.Socioboard.Domain.LinkedInGroup.Group_Updates> GroupUpdatesList = new List<Domain.Socioboard.Domain.LinkedInGroup.Group_Updates>();
        //    ShareAndSocialStream socialStream = new ShareAndSocialStream();
        //    xmlResult = socialStream.Get_GroupUpdates(OAuth, Count);

        //    XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("group-membership");

        //    foreach (XmlNode xn in xmlNodeList)
        //    {

        //        try
        //        {
        //            XmlElement Element = (XmlElement)xn;
        //            //double timestamp = Convert.ToDouble(Element.GetElementsByTagName("timestamp")[0].InnerText);
        //            //network_Updates.DateTime = JavaTimeStampToDateTime(timestamp);


        //            try
        //            {
        //                group_Updates.id = Element.GetElementsByTagName("id")[0].InnerText;
        //            }
        //            catch
        //            { }

        //            try
        //            {
        //                group_Updates.GroupName = Element.GetElementsByTagName("name")[0].InnerText;
        //            }
        //            catch
        //            { }


        //            GroupUpdatesList.Add(group_Updates);
        //        }
        //        catch
        //        {

        //        }
        //    }
        //    return GroupUpdatesList;

        //}

        //public List<Domain.Socioboard.Domain.LinkedInGroup.Group_Updates> GetGroupPostData(oAuthLinkedIn OAuth, int Count, string groupid,string linkedinId)
        //{
        //    Domain.Socioboard.Domain.LinkedInGroup.Group_Updates group_Updates = new Domain.Socioboard.Domain.LinkedInGroup.Group_Updates();
        //    List<Domain.Socioboard.Domain.LinkedInGroup.Group_Updates> GroupUpdatesList = new List<Domain.Socioboard.Domain.LinkedInGroup.Group_Updates>();
        //    ShareAndSocialStream socialStream = new ShareAndSocialStream();
        //    xmlResult = socialStream.Get_GroupPostData(OAuth, Count, groupid);

        //    XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("post");


        //    foreach (XmlNode xn in xmlNodeList)
        //    {

        //        try
        //        {
                    
        //            XmlElement Element = (XmlElement)xn;

        //            try
        //            {

        //                group_Updates.LinkedInProfileId = linkedinId;


        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }

        //            try
        //            {

        //                group_Updates.id = groupid;

        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }
        //            try
        //            {
                       
        //                group_Updates.GpPostid = Element.GetElementsByTagName("id")[0].InnerText;


        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }

        //            try
        //            {
        //                group_Updates.firstname = Element.GetElementsByTagName("first-name")[0].InnerText;
        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }



        //            try
        //            {
        //                string following = Element.GetElementsByTagName("is-following")[0].InnerText;
        //                if (following == "true")
        //                {
        //                    group_Updates.isFollowing = 1;
        //                }
        //                else { group_Updates.isFollowing = 0; }

        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }
        //            try
        //            {
        //                string like = Element.GetElementsByTagName("is-liked")[0].InnerText;
        //                if (like == "true")
        //                {
        //                    group_Updates.isLiked = 1;
        //                }
        //                else { group_Updates.isLiked = 0; }


        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }

        //            try
        //            {

        //                group_Updates.likes_total = Element.GetElementsByTagName("likes")[0].Attributes["total"].Value;
        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine(ex.StackTrace);
        //            }
        //            try
        //            {
        //                group_Updates.comments_total = Element.GetElementsByTagName("comments")[0].Attributes["total"].Value;
        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine(ex.StackTrace);
        //            }

        //            try
        //            {
        //                group_Updates.summary = Element.GetElementsByTagName("summary")[0].InnerText;
        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine(ex.StackTrace);
        //            }

        //            try
        //            {
        //                group_Updates.lastname = Element.GetElementsByTagName("last-name")[0].InnerText;
        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }
        //            try
        //            {
        //                group_Updates.headline = Element.GetElementsByTagName("headline")[0].InnerText;
        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }
        //            try
        //            {

        //                group_Updates.pictureurl = Element.GetElementsByTagName("picture-url")[0].InnerText;

        //            }
        //            catch (Exception ex)
        //            {
        //                Console.WriteLine(ex.StackTrace);
        //                group_Updates.pictureurl = "www.socioboard.com/Themes/" + System.Configuration.ConfigurationManager.AppSettings["domain"] + "/Contents/img/blank_img.png";//"../../Contents/img/blank_img.png";
                       
        //            }
                    
        //            try
        //            {
        //                group_Updates.title = Element.GetElementsByTagName("title")[0].InnerText;
        //            }
        //            catch (Exception ex)
        //            { Console.WriteLine(ex.StackTrace); }

        //            GroupUpdatesList.Add(group_Updates);
        //        }
        //        catch (Exception ex)
        //        { Console.WriteLine(ex.StackTrace); }

        //    }
        //    return GroupUpdatesList;

        //}

        


    }
}
