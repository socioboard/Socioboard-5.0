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
    public class LinkedinPageComment
    {
        private XmlDocument xmlResult;
        public LinkedinPageComment()
        {
            xmlResult = new XmlDocument();
        }

        public List<CompanyPageComment> CompanyPagePostsList = new List<CompanyPageComment>();

        public struct CompanyPageComment
        {
            public string Comment { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string CommentTime { get; set; }
            public string PictureUrl { get; set; }
        }


        public List<CompanyPageComment> GetPagePostscomment(oAuthLinkedIn OAuth, string updatekey,string PageId)
        {
            CompanyPageComment companypage_postcmnt = new CompanyPageComment();

            Company companyConnection = new Company();
            string CommentPageData = companyConnection.GetLinkedINCommentOnPagePost(OAuth, updatekey, PageId);
            var commentpost_data = JObject.Parse(CommentPageData);
            
            foreach (var item in commentpost_data["updateComments"]["values"])
            {
                  try
                    {
                        companypage_postcmnt.Comment = item["comment"].ToString();
                     }
                    catch
                    { }
                  try
                  {
                      companypage_postcmnt.FirstName = item["company"]["name"].ToString();
                  }
                  catch
                  { }
                  try
                  {
                      double timestamp = Convert.ToDouble(item["timestamp"].ToString());
                      companypage_postcmnt.CommentTime = JavaTimeStampToDateTime(timestamp);
                  }
                  catch
                  {

                  }
                  try
                  {
                      companypage_postcmnt.PictureUrl = commentpost_data["updateContent"]["companyStatusUpdate"]["share"]["content"]["thumbnailUrl"].ToString();
                  }
                  catch
                  {
                      companypage_postcmnt.PictureUrl = null;
                  }
                  CompanyPagePostsList.Add(companypage_postcmnt);
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

    }
}
