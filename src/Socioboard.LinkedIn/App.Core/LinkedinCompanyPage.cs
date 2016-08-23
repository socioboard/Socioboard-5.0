using Socioboard.LinkedIn.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.LinkedIn.Core.CompanyMethods;
using System.IO;
using System.Xml.Linq;
using Newtonsoft.Json.Linq;
namespace Socioboard.LinkedIn.App.Core
{
    public  class LinkedinCompanyPage
    {
        private XmlDocument xmlResult;
        public LinkedinCompanyPage()
        {
            xmlResult = new XmlDocument();
        }
        //string url = "https://api.linkedin.com/v1/companies/" + UserProfile.id + ":(id,name,ticker,description,founded-year,end-year,locations,Specialties,website-url,status,employee-count-range,industries,company-type,logo-url,square-logo-url,blog-rss-url,num-followers,locations:(description),locations:(is-headquarters),locations:(is-active),locations:(address),locations:(address:(street1)),locations:(address:(street2)),locations:(address:(postal-code)),locations:(address:(country-code)),locations:(address:(region-code)),locations:(contact-info),locations:(contact-info:(phone1)),locations:(contact-info:(phone2)),locations:(contact-info:(fax)))";


        public struct CompanyProfile
        {
            public string Pageid { get; set; }
            public string name { get; set; }
            public string EmailDomains { get; set; }
            public string description { get; set; }
            public string founded_year { get; set; }
            public string end_year { get; set; }
            public string locations { get; set; }
            public string Specialties { get; set; }
            public string website_url { get; set; }
            public string status { get; set; }
            public string employee_count_range { get; set; }
            public string industries { get; set; }
            public int num_followers { get; set; }
            public string company_type { get; set; }
            public string logo_url { get; set; }
            public string square_logo_url { get; set; }
            public string blog_rss_url { get; set; }
            public string universal_name { get; set; }





            //universal-name
        }

        /// <summary>
        /// Get The Linkedin Company Page Profile by Id
        /// </summary>
        /// <param name="OAuth"></param>
        /// <returns></returns>
        /// 
        //id,name,email-domains,description,founded-year,end-year,locations,Specialties,website-url,status,employee-count-range,industries,company-type,logo-url,square-logo-url,blog-rss-url,num-followers,universal-name
        public static CompanyProfile GetCompanyPageProfile(oAuthLinkedIn oAuth, string CompanyPageId)
        {
            CompanyProfile CompanyProfile = new CompanyProfile();
            Company companyConnection = new Company();
            //xmlResult = companyConnection.Get_CompanyProfileById(oAuth, CompanyPageId);
            //XmlElement root = xmlResult.DocumentElement;
            string linkedincmpydata = companyConnection.GetLinkedIN_CompanyProfileById(oAuth,CompanyPageId);
            var company_data = JObject.Parse(linkedincmpydata);

            try
            {
                //CompanyProfile.Pageid = xmlResult.GetElementsByTagName("id")[0].InnerText;
                CompanyProfile.Pageid = company_data["id"].ToString();
            }
            catch { }

            try
            {
                //CompanyProfile.name = xmlResult.GetElementsByTagName("name")[0].InnerText;
                CompanyProfile.name = company_data["name"].ToString();
            }
            catch { }
            try
            {

               // CompanyProfile.EmailDomains = xmlResult.GetElementsByTagName("email-domains")[0].InnerText;
                CompanyProfile.EmailDomains = company_data["emailDomains"]["values"][0].ToString();

            }
            catch
            { }

            try
            {
                //CompanyProfile.description = xmlResult.GetElementsByTagName("description")[0].InnerText;
                CompanyProfile.description = company_data["description"].ToString();
            }
            catch { }

            try
            {
                //CompanyProfile.founded_year = xmlResult.GetElementsByTagName("founded-year")[0].InnerText;
                CompanyProfile.founded_year = company_data["foundedYear"].ToString();
            }
            catch { }


            try
            {
                //CompanyProfile.end_year = xmlResult.GetElementsByTagName("end-year")[0].InnerText;
            }
            catch { }

            try
            {
                string location = string.Empty;
                //string street1 = xmlResult.GetElementsByTagName("street1")[0].InnerText;
                //string city = xmlResult.GetElementsByTagName("city")[0].InnerText;
                //string postalcode = xmlResult.GetElementsByTagName("postal-code")[0].InnerText;
                //string phone1 = xmlResult.GetElementsByTagName("phone1")[0].InnerText;
                //string fax = xmlResult.GetElementsByTagName("fax")[0].InnerText;
                string street1 = company_data["locations"]["values"][0]["address"]["street1"].ToString();
                string city = company_data["locations"]["values"][0]["address"]["city"].ToString();
                string postalCode = company_data["locations"]["values"][0]["address"]["postalCode"].ToString();
                string phone1 = company_data["locations"]["values"][0]["contactInfo"]["phone1"].ToString();
                string fax = company_data["locations"]["values"][0]["contactInfo"]["fax"].ToString();
                location += street1 + " " + city + " postal Code: " + postalCode + " Phone: " + phone1 + " Fax: " + fax;
                CompanyProfile.locations = location;
            }
            catch { }
            try
            {
                string Speciality = string.Empty;
                //XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("specialties");
                //foreach (XmlNode xn in xmlNodeList)
                //{

                //    try
                //    {
                //        XmlElement Element = (XmlElement)xn;
                //        Speciality = Element.GetElementsByTagName("specialty")[0].InnerText;
                //        Speciality += ",";
                //    }
                //    catch { }

                //}
                foreach (var item in company_data["specialties"]["values"])
                {
                    try
                    {
                        Speciality = item.ToString();
                        Speciality += ",";
                    }
                    catch { }
                }

                Speciality = Speciality.Substring(0, Speciality.Length - 1);
                CompanyProfile.Specialties = Speciality;
            }
            catch { }

            try
            {
                //CompanyProfile.website_url = xmlResult.GetElementsByTagName("website-url")[0].InnerText;
                CompanyProfile.website_url = company_data["websiteUrl"].ToString();
            }
            catch { }
            try
            {

                CompanyProfile.status = company_data["status"]["name"].ToString();
               
                //XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("status");
                //foreach (XmlNode xn in xmlNodeList)
                //{

                //    try
                //    {
                //        XmlElement Element = (XmlElement)xn;
                //        CompanyProfile.status = Element.GetElementsByTagName("name")[0].InnerText;
                //    }
                //    catch { }
                //}
            }
            catch { }

            try
            {

                CompanyProfile.employee_count_range = company_data["employeeCountRange"]["name"].ToString();
               
                //XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("employee-count-range");
                //foreach (XmlNode xn in xmlNodeList)
                //{

                //    try
                //    {
                //        XmlElement Element = (XmlElement)xn;
                //        CompanyProfile.employee_count_range = Element.GetElementsByTagName("name")[0].InnerText;
                //    }
                //    catch { }
                //}
            }
            catch { }
            try
            {
                foreach (var item in company_data["industries"]["values"])
                {
                    CompanyProfile.industries = item["name"].ToString();
                }
                //XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("industry");
                //foreach (XmlNode xn in xmlNodeList)
                //{

                //    try
                //    {
                //        XmlElement Element = (XmlElement)xn;
                //        CompanyProfile.industries = Element.GetElementsByTagName("name")[0].InnerText;
                //    }
                //    catch { }
                //}
            }
            catch { }
            try
            {


                CompanyProfile.company_type = company_data["companyType"]["name"].ToString();
              
                //XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("company-type");
                //foreach (XmlNode xn in xmlNodeList)
                //{

                //    try
                //    {
                //        XmlElement Element = (XmlElement)xn;
                //        CompanyProfile.company_type = Element.GetElementsByTagName("name")[0].InnerText;
                //    }
                //    catch { }
                //}

            }
            catch { }
            try
            {
               // CompanyProfile.logo_url = xmlResult.GetElementsByTagName("logo-url")[0].InnerText;
                CompanyProfile.logo_url = company_data["logoUrl"]. ToString();
            }
            catch { }
            try
            {
               // CompanyProfile.square_logo_url = xmlResult.GetElementsByTagName("square-logo-url")[0].InnerText;
                CompanyProfile.square_logo_url = company_data["square-logo-url"].ToString();
            }
            catch { }
            try
            {
                //CompanyProfile.blog_rss_url = xmlResult.GetElementsByTagName("blog-rss-url")[0].InnerText;
                CompanyProfile.blog_rss_url = company_data["blog-rss-url"].ToString();
            }
            catch { }
            try
            {
                //CompanyProfile.num_followers = Convert.ToInt16(xmlResult.GetElementsByTagName("num-followers")[0].InnerText);
                CompanyProfile.num_followers = Convert.ToInt16(company_data["numFollowers"].ToString());
            }
            catch { }
            try
            {
               // CompanyProfile.universal_name = xmlResult.GetElementsByTagName("universal-name")[0].InnerText;
                CompanyProfile.universal_name = company_data["universalName"].ToString();
            }
            catch { }







            return CompanyProfile;

        }
    }
}
