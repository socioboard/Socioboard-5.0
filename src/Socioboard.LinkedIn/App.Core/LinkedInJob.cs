using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.LinkedIn.Core.JobsMethods;

namespace Socioboard.LinkedIn.App.Core
{
    public class LinkedInJob
    {
        private XmlDocument xmlResult;

        public LinkedInJob()
        {
            xmlResult = new XmlDocument();
        }

        public List<Jobdetail> JobDetailList = new List<Jobdetail>();

        public struct Jobdetail
        {
            public string Company { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }            
            public string Location { get; set; }            
            public string Description { get; set; }
            public string Headline { get; set; }
        }

        /// <summary>
        /// The Job Search API enables search across LinkedIn's job postings Title Wise.
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="Title"></param>
        /// <param name="Count"></param>
        /// <returns></returns>
        public List<Jobdetail> GetJobSearchTitle(oAuthLinkedIn OAuth, string Title, int Count)
        {
            Jobdetail job_result = new Jobdetail();

            Jobs jobsearch = new Jobs();

            xmlResult = jobsearch.Get_JobSearchTitle(OAuth, Title, Count);

            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("job");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement Element = (XmlElement)xn;


                try
                {
                    job_result.Company = Element.GetElementsByTagName("name")[0].InnerText;
                }
                catch  { }

                try
                {
                    job_result.Headline = Element.GetElementsByTagName("headline")[0].InnerText;
                }
                catch { }
               

                try
                {
                    job_result.FirstName = Element.GetElementsByTagName("first-name")[0].InnerText;
                }
                catch { }

                try
                {
                    job_result.LastName = Element.GetElementsByTagName("last-name")[0].InnerText;
                }
                catch { }
               

                try
                {
                    job_result.Description = Element.GetElementsByTagName("description-snippet")[0].InnerText;
                }
                catch { }

                try
                {
                    job_result.Location = Element.GetElementsByTagName("location-description")[0].InnerText;
                }
                catch { }

                JobDetailList.Add(job_result);
            }

            

            return JobDetailList;
        }
        
        /// <summary>
        /// The Job Search API enables search across LinkedIn's job postings Keyword Wise.
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="KeyWord"></param>
        /// <param name="Count"></param>
        /// <returns></returns>
        public List<Jobdetail> GetJobSearchKeyWord(oAuthLinkedIn OAuth, string KeyWord, int Count)
        {
            Jobdetail job_result = new Jobdetail();

            JobSearch jobsearch = new JobSearch();

            xmlResult = jobsearch.Get_JobSearchKeyword(OAuth, KeyWord, Count);

            XmlNodeList xmlNodeList = xmlResult.GetElementsByTagName("job");

            foreach (XmlNode xn in xmlNodeList)
            {
                XmlElement Element = (XmlElement)xn;

               

                try
                {
                    job_result.Company = Element.GetElementsByTagName("name")[0].InnerText;
                }
                catch { }

                try
                {
                    job_result.FirstName = Element.GetElementsByTagName("first-name")[0].InnerText;
                }
                catch { }                


                try
                {
                    job_result.LastName = Element.GetElementsByTagName("last-name")[0].InnerText;
                }
                catch { }

                try
                {
                    job_result.Description = Element.GetElementsByTagName("description-snippet")[0].InnerText;
                }
                catch { }
               
                try
                {
                    job_result.Location = Element.GetElementsByTagName("location-description")[0].InnerText;
                }
                catch { }

                JobDetailList.Add(job_result);
            }

            

            return JobDetailList;
        }

    }
}
