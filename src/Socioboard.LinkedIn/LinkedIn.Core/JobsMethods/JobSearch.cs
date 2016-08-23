using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.App.Core;
using System.IO;

namespace Socioboard.LinkedIn.LinkedIn.Core.JobsMethods
{
    public class JobSearch
    {
         private XmlDocument xmlResult;


         public JobSearch()
         {
             xmlResult = new XmlDocument();
         }

        

         public XmlDocument Get_JobSearchTitle(oAuthLinkedIn OAuth, string keyword, int Count)
         {
             string response = OAuth.APIWebRequest("GET", Global.GetJobSearchTitle + keyword + "&count=" + Count, null);
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }

         public XmlDocument Get_JobSearchKeyword(oAuthLinkedIn OAuth, string keyword, int Count)
         {
             string response = OAuth.APIWebRequest("GET", Global.GetJobSearchKeyword + keyword + "&count=" + Count, null);
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }

    }
}
