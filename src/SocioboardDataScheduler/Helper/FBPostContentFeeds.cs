using Facebook;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocioboardDataScheduler.Helper
{


    public class FBPostContentFeeds
    {
        public static string FacebookComposeMessageRss(string message, string accessToken, string FbUserId, string title, string link, string postId)
        {
            string ret = "";
            FacebookClient fb = new FacebookClient();
            MongoRepository contentFeeds = new MongoRepository("ContentFeedsShareathon");
            try
            {
                fb.AccessToken = accessToken;
                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls;
                var args = new Dictionary<string, object>();
                args["message"] = message;
                args["link"] = link;
                ret = fb.Post("v2.7/" + FbUserId + "/feed", args).ToString();
                return ret = "Messages Posted Successfully";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return ret = "Message Could Not Posted";
            }
        }

    }
}
