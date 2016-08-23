using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.LinkedIn.Authentication;
using Socioboard.LinkedIn.App.Core;
using System.IO;

namespace Socioboard.LinkedIn.LinkedIn.Core.PeopleAndConnectionMethods
{
    public class PeopleAndConnection
    {
         private XmlDocument xmlResult;


         public PeopleAndConnection()
         {
             xmlResult = new XmlDocument();
         }

         public XmlDocument Get_UserProfile(oAuthLinkedIn OAuth)
         {
             string response = OAuth.APIWebRequest("GET", "http://api.linkedin.com/v1/people/~:(id,first-name,headline,last-name,industry,site-standard-profile-request,api-standard-profile-request,member-url-resources,picture-url,current-status,summary,positions,main-address,location,distance,specialties,proposal-comments,associations,honors,interests,educations,phone-numbers,im-accounts,twitter-accounts,date-of-birth,email-address)", null);
             xmlResult.Load(new StringReader(response));
             return xmlResult;
         }
         public XmlDocument SearchPeople(oAuthLinkedIn OAuth,string keyword)
         {
             string response = string.Empty;
             try
             {
                 response = OAuth.APIWebRequest("GET", "http://api.linkedin.com/v1/people-search?keyword="+keyword+"sort=distance", null);
             }
             catch { }
                 xmlResult.Load(new StringReader(response));
             return xmlResult;
         }
    }
}
