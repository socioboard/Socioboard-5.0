using Google.Apis.Analytics.v3;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using System.Threading;

namespace Api.Socioboard.Helper
{
    public static class GoogleAnalyticsAuthenticationHelper
    {
        /// <summary>
        /// Authenticate to Google Using Oauth2
        /// Documentation https://developers.google.com/accounts/docs/OAuth2
        /// </summary>
        /// <param name="clientId">From Google Developer console https://console.developers.google.com</param>
        /// <param name="clientSecret">From Google Developer console https://console.developers.google.com</param>
        /// <param name="userName">A string used to identify a user.</param>
        /// <returns></returns>
        public static AnalyticsService AuthenticateOauth(string clientId, string clientSecret, string userName)
        {

            string[] scopes = new string[] { AnalyticsService.Scope.Analytics,  // view and manage your analytics data
                                             AnalyticsService.Scope.AnalyticsEdit,  // edit management actives
                                             AnalyticsService.Scope.AnalyticsManageUsers,   // manage users
                                             AnalyticsService.Scope.AnalyticsReadonly};     // View analytics data

            try
            {
                // here is where we Request the user to give us access, or use the Refresh Token that was previously stored in %AppData%
                UserCredential credential = GoogleWebAuthorizationBroker.AuthorizeAsync(new ClientSecrets { ClientId = clientId, ClientSecret = clientSecret }
                                                                                             , scopes
                                                                                             , userName
                                                                                             , CancellationToken.None
                                                                                             , new FileDataStore("Daimto.GoogleAnalytics.Auth.Store")).Result;

                AnalyticsService service = new AnalyticsService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "BoardMe",
                });
                return service;
            }
            catch (Exception ex)
            {

                Console.WriteLine(ex.InnerException);
                return null;

            }

        }

        /// <summary>
        /// Authenticating to Google using a Service account
        /// Documentation: https://developers.google.com/accounts/docs/OAuth2#serviceaccount
        /// </summary>
        /// <param name="serviceAccountEmail">From Google Developer console https://console.developers.google.com</param>
        /// <param name="keyFilePath">Location of the Service account key file downloaded from Google Developer console https://console.developers.google.com</param>
        /// <returns></returns>
        public static AnalyticsService AuthenticateServiceAccount(string serviceAccountEmail, string keyFilePath)
        {
            //  keyFilePath = keyFilePath.Replace("\\", @"\");
            // check the file exists
            if (!File.Exists(keyFilePath))
            {
                Console.WriteLine("An Error occurred - Key file does not exist");
                return null;
            }

            string[] scopes = new string[] { AnalyticsService.Scope.Analytics,  // view and manage your analytics data
                                             AnalyticsService.Scope.AnalyticsEdit,  // edit management actives
                                             AnalyticsService.Scope.AnalyticsManageUsers,   // manage users
                                             AnalyticsService.Scope.AnalyticsReadonly};     // View analytics data            

            var certificate = new X509Certificate2(keyFilePath, "notasecret", X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
            try
            {
                ServiceAccountCredential credential = new ServiceAccountCredential(
                     new ServiceAccountCredential.Initializer(serviceAccountEmail)
                     {
                         //User = "362325210508-eddhefim3ni47hd5f88c6ip8h863idp0@developer.gserviceaccount.com",
                         //User = "244513724654-0th6146rg1cqvr0hmqhv1r5gjgm3rbg3@developer.gserviceaccount.com",
                         Scopes = scopes,
                     }.FromCertificate(certificate));

                // Create the service.
                AnalyticsService service = new AnalyticsService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "SocioboardBoardMe",
                    // ApiKey = "AIzaSyCOq-bU7EyOGIklwJzMBRExIzL152wJFC0",
                });
                return service;
            }
            catch (Exception ex)
            {

                Console.WriteLine(ex.InnerException);
                return null;

            }
        }


    }
}
