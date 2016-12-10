using Newtonsoft.Json.Linq;
using Socioboard.GoogleLib.Authentication;
using Socioboard.GoogleLib.GAnalytics.Core.Accounts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public static class GoogleHelper
    {
        public static List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles> GetGanalyticsAccount(string code, Helper.AppSettings _appSettings)
        {
            Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles _GoogleAnalyticsProfiles;
            List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles> lstGoogleAnalyticsProfiles = new List<Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles>();
            string access_token = string.Empty;
            string refresh_token = string.Empty;
            Accounts _Accounts = new Accounts(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);

            try
            {
                oAuthTokenGa objToken = new oAuthTokenGa(_appSettings.GoogleConsumerKey, _appSettings.GoogleConsumerSecret, _appSettings.GoogleRedirectUri);


                string accessToken = objToken.GetRefreshToken(code);
                JObject JData = JObject.Parse(accessToken);

                try
                {
                    refresh_token = JData["refresh_token"].ToString();
                }
                catch (Exception ex)
                {
                    access_token = JData["access_token"].ToString();
                    objToken.RevokeToken(access_token);
                    return null;
                }

                access_token = JData["access_token"].ToString();

                string accountsdata = _Accounts.getGaAccounts(access_token);

                JObject JAccountdata = JObject.Parse(accountsdata);
                string EmailId = JAccountdata["username"].ToString();

                foreach (var item in JAccountdata["items"])
                {
                    try
                    {
                        string accountId = item["id"].ToString();
                        string accountName = item["name"].ToString();
                        string profileData = _Accounts.getGaProfiles(access_token, accountId);
                        JObject JProfileData = JObject.Parse(profileData);
                        foreach (var item_profile in JProfileData["items"])
                        {
                            try
                            {
                                _GoogleAnalyticsProfiles = new Domain.Socioboard.ViewModels.GoogleAnalyticsProfiles();
                                _GoogleAnalyticsProfiles.AccessToken = access_token;
                                _GoogleAnalyticsProfiles.RefreshToken = refresh_token;
                                _GoogleAnalyticsProfiles.AccountId = accountId;
                                _GoogleAnalyticsProfiles.AccountName = accountName;
                                _GoogleAnalyticsProfiles.EmailId = EmailId;
                                _GoogleAnalyticsProfiles.ProfileId = item_profile["id"].ToString();
                                _GoogleAnalyticsProfiles.ProfileName = item_profile["name"].ToString();
                                _GoogleAnalyticsProfiles.WebPropertyId = item_profile["webPropertyId"].ToString();
                                _GoogleAnalyticsProfiles.WebsiteUrl = item_profile["websiteUrl"].ToString();
                                _GoogleAnalyticsProfiles.internalWebPropertyId = item_profile["internalWebPropertyId"].ToString();
                                lstGoogleAnalyticsProfiles.Add(_GoogleAnalyticsProfiles);
                            }
                            catch (Exception ex)
                            {

                            }
                        }
                    }
                    catch (Exception e)
                    {
                    }
                }
            }
            catch
            {

            }
            return lstGoogleAnalyticsProfiles;
        }
    }
}
