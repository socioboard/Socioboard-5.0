using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.CompanyMethods;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;

namespace Socioboard.LinkedIn.App.Core
{
    public class LinkedinPageUpdate
    {
        private XmlDocument xmlResult;
        public LinkedinPageUpdate()
        {
            xmlResult = new XmlDocument();
        }

        public List<CompanyPagePosts> CompanyPagePostsList = new List<CompanyPagePosts>();

        public struct CompanyPagePosts
        {
            public string Posts { get; set; }
            public string PostDate { get; set; }
            public string Type { get; set; }
            public string PostId { get; set; }
            public string PostImageUrl { get; set; }
            public string UpdateKey { get; set; }
            public int Likes { get; set; }
            public int Comments { get; set; }
            public int isLiked { get; set; }
        }
        public List<CompanyPagePosts> GetPagePosts(oAuthLinkedIn OAuth, string CompanyPageId)
        {
            var companypagePost = new CompanyPagePosts();
            var companyConnection = new Company();

            var companyPageData = companyConnection.GetLinkedIN_CompanyUpdateById(OAuth, CompanyPageId);
            var companyData = JObject.Parse(companyPageData);

            if(companyData["values"]==null)
              return CompanyPagePostsList;

            foreach (var item in companyData["values"])
            {
                try
                {
                    companypagePost.Type = item["updateType"].ToString();                   
                }
                catch
                { }
                try
                {
                    companypagePost.UpdateKey = item["updateKey"].ToString();
                }
                catch
                { }
                try
                {
                    companypagePost.PostId = item["updateContent"]["companyStatusUpdate"]["share"]["id"].ToString();
                }
                catch
                { }
                try
                {
                    companypagePost.Posts = item["updateContent"]["companyStatusUpdate"]["share"]["comment"].ToString();
                }
                catch
                { }
                try
                {
                    string datetime=item["updateContent"]["companyStatusUpdate"]["share"]["timestamp"].ToString();
                    companypagePost.PostDate = JavaTimeStampToDateTime(double.Parse(datetime));
               }
                catch
                { }
                try
                {
                    companypagePost.PostImageUrl = item["updateContent"]["companyStatusUpdate"]["share"]["content"]["thumbnailUrl"].ToString();

                }
                catch
                {
                    companypagePost.PostImageUrl = "";
                }
                try
                {
                    string likes = item["numLikes"].ToString();
                    companypagePost.Likes = Convert.ToInt16(likes);
                }
                catch
                {
                }
                try
                {
                    string url = "https://api.linkedin.com/v1/companies/" + CompanyPageId + "/updates/key=" + companypagePost.UpdateKey + "/update-comments?format=json";
                    string response = OAuth.APIWebRequest("GET", url, null);
                    var comment = JObject.Parse(response);
                    string Comments = comment["_total"].ToString();
                    companypagePost.Comments = Convert.ToInt16(Comments);
                }
                catch
                {
                }
                CompanyPagePostsList.Add(companypagePost);
            }
            return CompanyPagePostsList;

        }

        public static string JavaTimeStampToDateTime(double javaTimeStamp)
        {
            // Java timestamp is millisecods past epoch
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            dtDateTime = dtDateTime.AddSeconds(Math.Round(javaTimeStamp / 1000)).ToLocalTime();
            string date = dtDateTime.ToString("MMMM dd, yy H:mm:ss tt");
            return date;
        }

        public CompanyPagePosts GetPostLike(oAuthLinkedIn OAuth, string UpdateKey, string PageId)
        {
            CompanyPagePosts objLicmpnypost = new CompanyPagePosts();
            Company companyConnection = new Company();
            xmlResult = companyConnection.GetLikeorNotOnPagePost(OAuth, UpdateKey, PageId);
            try
            {

                string like = xmlResult.GetElementsByTagName("is-liked")[0].InnerText;
                if (like == "true")
                {
                    objLicmpnypost.isLiked = 1;
                }
                else { objLicmpnypost.isLiked = 0; }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
            }
            return objLicmpnypost;
        }


       
    }
}
