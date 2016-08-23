using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using System.IO;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.App.Core;

namespace Socioboard.LinkedIn.LinkedIn.Core.JobsMethods
{
    class Jobs
    {
        private XmlDocument xmlResult;
        /// <summary>
        /// The Job Search API enables search across LinkedIn's job postings Title Wise.
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="keyword"></param>
        /// <param name="Count"></param>
        /// <returns></returns>
        public XmlDocument Get_JobSearchTitle(oAuthLinkedIn OAuth, string keyword, int Count)
        {
            string response = OAuth.APIWebRequest("GET", Global.GetJobSearchTitle + keyword + "&count=" + Count, null);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }

        /// <summary>
        /// The Job Search API enables search across LinkedIn's job postings Keyword Wise.
        /// </summary>
        /// <param name="OAuth"></param>
        /// <param name="keyword"></param>
        /// <param name="Count"></param>
        /// <returns></returns>
        public XmlDocument Get_JobSearchKeyword(oAuthLinkedIn OAuth, string keyword, int Count)
        {
            string response = OAuth.APIWebRequest("GET", Global.GetJobSearchKeyword + keyword + "&count=" + Count, null);
            xmlResult.Load(new StringReader(response));
            return xmlResult;
        }
    }
}
