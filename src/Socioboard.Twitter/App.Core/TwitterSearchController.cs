using Socioboard.Twitter.Authentication;
using Newtonsoft.Json.Linq;
using Socioboard.Twitter.Twitter.Core.SearchMethods;
using System.Xml;

namespace Socioboard.Twitter.App.Core
{
    public class TwitterSearchController
    {
        private XmlDocument xmlResult;
        Search objSerach = new Search();

        public TwitterSearchController()
        {
            xmlResult = new XmlDocument();
        }

        public void Trends(TwitterUser User)
        {
            string Trends = null;
            Socioboard.Twitter.Twitter.Core.SearchMethods.Search search = new Socioboard.Twitter.Twitter.Core.SearchMethods.Search();
            Trends = search.Trends(User);
        }

        /// <summary>
        /// Returns a collection of relevant Tweets matching a specified query.
        /// </summary>
        /// <param name="oAuth"></param>
        /// <param name="SearchKeyword"></param>
        /// <returns></returns>
        public JArray SearchTweet(oAuthTwitter oAuth, string SearchKeyword)
        {
            JArray arrSearchTweet = new JArray();
            arrSearchTweet = objSerach.Get_Search_Tweets(oAuth, SearchKeyword);
            return arrSearchTweet;
        }

    }
}
