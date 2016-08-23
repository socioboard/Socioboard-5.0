using Socioboard.LinkedIn.Authentication;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml;

namespace Socioboard.LinkedIn.LinkedIn.Core.CompanyMethods
{
    public class Company
    {
        private XmlDocument XmlResult;

        public Company()
        {
            XmlResult = new XmlDocument();
        }

        public XmlDocument Get_CompanyProfileById(oAuthLinkedIn OAuth, string CoampanyPageId)
        {
            //string url = "https://api.linkedin.com/v1/companies/" + CoampanyPageId + ":(id,name,email-domains,description,founded-year,end-year,locations,Specialties,website-url,status,employee-count-range,industries,company-type,logo-url,square-logo-url,blog-rss-url,num-followers,universal-name,locations:(description),locations:(is-headquarters),locations:(is-active),locations:(address),locations:(address:(street1)),locations:(address:(street2)),locations:(address:(city)),locations:(address:(state)),locations:(address:(postal-code)),locations:(address:(country-code)),locations:(address:(region-code)),locations:(contact-info),locations:(contact-info:(phone1)),locations:(contact-info:(phone2)),locations:(contact-info:(fax)))";
            string url = "https://api.linkedin.com/v1/companies/" + CoampanyPageId + ":(id,name,email-domains,description,founded-year,end-year,locations,Specialties,website-url,status,employee-count-range,industries,company-type,logo-url,square-logo-url,blog-rss-url,num-followers,universal-name)";


            string response = OAuth.APIWebRequest("GET", url, null);
            XmlResult.Load(new StringReader(response));
            return XmlResult;
        }


        public string GetLinkedIN_CompanyProfileById(oAuthLinkedIn OAuth, string CoampanyPageId)
        {
            string url = "https://api.linkedin.com/v1/companies/" + CoampanyPageId + ":(id,name,email-domains,description,founded-year,end-year,locations,Specialties,website-url,status,employee-count-range,industries,company-type,logo-url,square-logo-url,blog-rss-url,num-followers,universal-name)?format=json";
            string response = OAuth.APIWebRequest("GET",url,null);
            return response;
        }
        public XmlDocument Get_CompanyUpdateById(oAuthLinkedIn OAuth, string CoampanyPageId)
        {
            string url = "https://api.linkedin.com/v1/companies/" + CoampanyPageId + "/updates";
            string response = OAuth.APIWebRequest("GET", url, null);
            XmlResult.Load(new StringReader(response));
            return XmlResult;
        }

        public string GetLinkedIN_CompanyUpdateById(oAuthLinkedIn OAuth, string CoampanyPageId)
        {
            string url = "https://api.linkedin.com/v1/companies/" + CoampanyPageId + "/updates?format=json";
            string response = OAuth.APIWebRequest("GET", url, null);
            return response;
        }
        public string SetCommentOnPagePost(oAuthLinkedIn oauth, string PageId, string Updatekey, string comment)
        {
            string url = "https://api.linkedin.com/v1/companies/" + PageId + "/updates/key=" + Updatekey + "/update-comments-as-company";
            string response = oauth.LinkedCompanyPagePostWebRequest("POST", url, comment);
            return response;
        }


        public XmlDocument GetCommentOnPagePost(oAuthLinkedIn oauth, string Updatekey)
        {
            string url = "https://api.linkedin.com/v1/people/~/network/updates/key=" + Updatekey + "/update-comments/";
            string response = oauth.APIWebRequest("GET", url, null);
            XmlResult.Load(new StringReader(response));
            return XmlResult;
        }

        public string GetLinkedINCommentOnPagePost(oAuthLinkedIn oauth, string Updatekey,string PageId)
        {
            string url = "https://api.linkedin.com/v1/companies/" + PageId + "/updates/key=" + Updatekey +"?format=json";
            string response = oauth.APIWebRequest("GET", url, null);
            return response;
        }

        public XmlDocument GetLikeorNotOnPagePost(oAuthLinkedIn oauth, string Updatekey, string PageId)
        {
            string url = "https://api.linkedin.com/v1/companies/" + PageId + "/updates/key=" + Updatekey + "/is-liked/";
            //string url = "https://api.linkedin.com/v1/people/~/network/updates/key=" + Updatekey + "/is-liked/";
            string response = oauth.APIWebRequest("GET", url, null);
            XmlResult.Load(new StringReader(response));
            return XmlResult;
        }

        public string SetPostOnPage(oAuthLinkedIn oauth, string PageId, string post)
        {

         
            string url = "https://api.linkedin.com/v1/companies/"+PageId+"/shares?format=json";
            string response = oauth.LinkedProfilePostWebRequest("POST", url, post);
            return response;

        }
        public string SetPostOnPageWithImage(oAuthLinkedIn oauth, string PageId, string imageurl, string post)
        {
          

            string url = "https://api.linkedin.com/v1/companies/" + PageId + "/shares?format=json";
            string response = oauth.LinkedProfilePostWebRequestWithImage("POST", url, post, imageurl);
            return response;

        }
        public string SetLikeUpdateOnPagePost(oAuthLinkedIn OAuth, string postid, string msg)
        {
            string xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
            xml += " <is-liked>" + msg + "</is-liked>";

            string url = "https://api.linkedin.com/v1/people/~/network/updates/key=" + postid + "/is-liked";

            string response = OAuth.APIWebRequest("PUT", url, xml);
            return response;
        }

    }
}
