using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using Socioboard.GoogleLib.App.Core;
using Socioboard.GoogleLib.Authentication;

namespace Socioboard.GoogleLib.GAnalytics.Core.AnalyticsMethod
{
    public class Analytics
    {
        public Analytics(string clientId, string clientSecret, string redirectUrl)
        {

            _clientId = clientId;
            _clientSecret = clientSecret;
            _redirectUrl = redirectUrl;
        }


        private string _clientId;
        private string _clientSecret;
        private string _redirectUrl;

        public string getAnalyticsData(string strProfileId,string metricDimension,string strdtFrom,string strdtTo,string strToken)
        {
            string strData = string.Empty;
            oAuthToken objToken = new oAuthToken(_clientId,_clientSecret, _redirectUrl);
            try
            {
                string strDataUrl = Globals.strGetGaAnalytics + strProfileId + "&metrics=" + metricDimension + "&start-date=" + strdtFrom + "&end-date=" + strdtTo + "&access_token=" + strToken;
                strData=objToken.WebRequest(Socioboard.GoogleLib.Authentication.oAuthToken.Method.GET, strDataUrl, "");
            }
            catch (Exception Err)
            {
                Console.Write(Err.StackTrace);
            }
            return strData;
        }
    }
}
