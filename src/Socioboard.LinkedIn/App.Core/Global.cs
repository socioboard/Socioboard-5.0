using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Socioboard.LinkedIn.App.Core
{
    public class Global
    {
       #region oldurls
		
		 //public static string GetNetworkUserUpdates = "https://api.linkedin.com/v1/people/id=";
        //public static string GetNetworkUpdates = "https://api.linkedin.com/v1/people/~/network/updates";
        //public static string GetGroupUpdates = "https://api.linkedin.com/v1/people/~/group-memberships?membership-state=member&count=100";

        //public static string GetJobSearchTitle = "https://api.linkedin.com/v1/job-search?job-title=";
        //public static string GetJobSearchKeyword = "https://api.linkedin.com/v1/job-search?keywords=";
        //public static string GetUserProfile = "https://api.linkedin.com/v1/people/~:(id,first-name,last-name,headline,picture_url,educations,location,date_of_birth)";
        //public static string StatusUpdate = "https://api.linkedin.com/v1/people/~/current-status";
        //public static string StatusUpdateImage = "https://api.linkedin.com/v1/people/~/shares";
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //public static string GetUserProfileUrl = "https://api.linkedin.com/v1/people/~:(id,first-name,headline,last-name,industry,site-standard-profile-request,api-standard-profile-request,member-url-resources,picture-url,current-status,summary,positions,main-address,location,distance,specialties,proposal-comments,associations,honors,interests,educations,phone-numbers,im-accounts,twitter-accounts,date-of-birth,email-address)";
        //public static string GetPeopleSearchUrl = "https://api.linkedin.com/v1/people-search?keyword=";
        //public static string GetPeopleConnectionUrl = "https://api.linkedin.com/v1/people/~/connections";
        //public static string GetCompanyUrl = "https://api.linkedin.com/v1/companies?is-company-admin=true";  
	#endregion 
	
        
        
        
        
        public static string GetNetworkUserUpdates = "https://api.linkedin.com/v1/people/id=";
        public static string GetNetworkUpdates = "https://api.linkedin.com/v1/people/~/network/updates?type=CONN&count=50&start=0";//"https://api.linkedin.com/v1/people/~/network/updates";
        public static string GetGroupUpdates = "https://api.linkedin.com/v1/people/~/group-memberships?membership-state=member&count=100";

        public static string GetJobSearchTitle = "https://api.linkedin.com/v1/job-search?job-title=";
        public static string GetJobSearchKeyword = "https://api.linkedin.com/v1/job-search?keywords=";
        public static string GetUserProfile = "https://api.linkedin.com/v1/people/~:(id,first-name,last-name,headline,picture_url,educations,location,date_of_birth)";
        public static string StatusUpdate = "https://api.linkedin.com/v1/people/~/current-status";
        public static string StatusUpdateImage = "https://api.linkedin.com/v1/people/~/shares";
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public static string GetUserProfileUrl = "https://api.linkedin.com/v1/people/~:(id,first-name,headline,last-name,industry,site-standard-profile-request,api-standard-profile-request,member-url-resources,picture-url,current-status,summary,positions,main-address,location,distance,specialties,proposal-comments,associations,honors,interests,educations,phone-numbers,im-accounts,twitter-accounts,date-of-birth,email-address)?format=json";
        public static string GetPeopleSearchUrl = "https://api.linkedin.com/v1/people-search?keyword=";
        public static string GetPeopleConnectionUrl = "https://api.linkedin.com/v1/people/~:(id,num-connections,picture-url)?format=json";
        public static string GetCompanyUrl = "https://api.linkedin.com/v1/companies?is-company-admin=true";

        public static string GetLinkedInCompanyPageUrl="https://api.linkedin.com/v1/companies?format=json&is-company-admin=true";
        public static string GetCompanyPageDetailUrl = "https://api.linkedin.com/v1/companies/{id}:(id,name,ticker,description)?format=json";






    }
}
