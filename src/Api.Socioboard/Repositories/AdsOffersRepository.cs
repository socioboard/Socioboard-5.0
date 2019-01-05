using System;

namespace Api.Socioboard.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class AdsOffersRepository
    {
        /// <summary>
        /// Check whether the socioboard url still present in their website 
        /// </summary>
        /// <param name="url">source url</param>
        /// <returns></returns>
        public static string FindUrlForAds(string url)
        {
            try
            {
                var keywords = "https://www.socioboard.com";

                var objRequest = new Domain.Socioboard.Helpers.UrlRSSfeedsNews();
               
                var httpResponse = objRequest.getHtmlfromUrl(new Uri(url));

                return httpResponse.Contains(keywords) ? "Ads found on website" : "Ads not found on website";
            }
            catch (Exception)
            {
                return "Something went wrong please try after sometime";
            }
        }
    }
}
