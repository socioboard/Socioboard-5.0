using System.Collections.Generic;
using System.Threading.Tasks;
using Socioboard.Twitter.Twitter.Core;

namespace Socioboard.Twitter.TwitterUtilites
{
    public class TwitterApiHelper : TwitterApiBase
    {
        public TwitterApiHelper(string consumerKey, string consumerKeySecret, string accessToken, string accessTokenSecret)
            : base(consumerKey, consumerKeySecret, accessToken, accessTokenSecret) { }

        public Task<string> DirectMessage(string text, string recipientID)
        {
            TwitterJsonElements jsonobject = new TwitterJsonElements
            {
                Events = new TwitterEvent
                {
                    Type = "message_create",
                    CreateMessage = new CreateMessage
                    {
                        Target = new Target { RecipientId = recipientID },
                        MessageData = new MessageData { TextMessage = text }
                    },
                }
            };

            var JsonString = GetJsonString(jsonobject);

            var data4Auth = new Dictionary<string, string> { };

            return PrepareAuth("direct_messages/events/new.json", data4Auth, JsonString);
        }


        public Task<string> Tweet(string text)
        {
            var data = new Dictionary<string, string> {
                { "status", text },
                { "trim_user", "1" }
            };

            return PrepareAuth("statuses/update.json", data);
        }
    }
}