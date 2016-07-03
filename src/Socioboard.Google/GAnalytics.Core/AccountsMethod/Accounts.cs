using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.GAnalytics.Core.Accounts
{
    public class Accounts
    {
        public oAuthToken objToken;
        public Accounts(string clientId, string clientSecret, string redirectUrl)
        {
            objToken = new oAuthToken( clientId,  clientSecret,  redirectUrl);
        }
        /// <summary>
        /// Get the Google Analytics Account
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <returns></returns>
        public string getGaAccounts(string accesstoken)
        {
            //DataSet dsAccount = new DataSet();

            string accountUrl = Globals.strgetGaAccounts + "?access_token=" + accesstoken;
            string data = string.Empty;
            try
            {
                //dsAccount.ReadXml(Globals.strgetGaAccounts + "?access_token=" + accesstoken);
                data = objToken.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET, accountUrl, "");
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return data;
        }

        /// <summary>
        /// Get Profiles added in Google Analytics Account
        /// </summary>
        /// <param name="accesstoken"></param>
        /// <param name="strAccId"></param>
        /// <returns></returns>
        public string getGaProfiles(string accesstoken, string strAccId)
        {
            //DataSet dsAccount = new DataSet();
            string profileUrl = Globals.strgetGaAccounts + strAccId + "/webproperties/~all/profiles?access_token=" + accesstoken;
            string data = string.Empty;
            try
            {
                //dsAccount.ReadXml(Globals.strgetGaAccounts + strAccId + "/webproperties/~all/profiles?access_token=" + accesstoken);
                data = objToken.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET, profileUrl, "");
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return data;
        }


    }
}
