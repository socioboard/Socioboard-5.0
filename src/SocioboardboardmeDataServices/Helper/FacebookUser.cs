using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BaseLib;

namespace FaceDominator
{
    public class FacebookUser
    {
        public Guid Id { get; set; }
        public string username;
        public string password;
        public string proxyip;
        public string proxyport;
        public string proxyusername;
        public string proxypassword;
        public string proxytype; // http or socks

        public GlobusHttpHelper globusHttpHelper;

        public enum AccountStatus { 
        AccountCreated,AccountEmailVerified,AccountPhoneVerified,AccountIncorrectEmail,AccountPhoneEmailVerified,
            AccountTempLocked,AccountUndefinedError,Account30DaysBlock,AccountUnverified,AccountPVARequired,AccountDisabled
        };

        public string familyname;
        public string currentcity;
        public string hometown;
        public string sex;
        public bool sexvisibility;
        public string birthdaymonth;
        public string birthdayday;
        public string birthdayyear;
        public bool birthdayvisibility;
        public string interestedin;
        public string aboutme;
        public string employer;
        public string college;
        public string highschool;
        public string sexselectprofile;
        public string language;
        public string message;
        public string activities;
        public string movies;
        public string music;
        public string books;
        public string favoritesports;
        public string favoriteteams;
        public string localimagepath;
        public bool isloggedin;
        public string targetlocation;
        public string religion;
        public string profilepic;
        public string role;
        public string quotations;
        public string dateOfBirth;
        public string securityAnswer;
        public string dbcUsername;
        public string dbcPassword;
        

        public FacebookUser()
        {

        }


    }
}
