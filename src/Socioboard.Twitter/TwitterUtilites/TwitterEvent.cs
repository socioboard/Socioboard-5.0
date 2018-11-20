using Newtonsoft.Json;

namespace Socioboard.Twitter.TwitterUtilites
{
    public class TwitterEvent
    {
        [JsonProperty(PropertyName = "type")]
        public string Type;

        [JsonProperty(PropertyName = "message_create")]
        public CreateMessage CreateMessage;
    }


    #region DirectMessage

    public class CreateMessage
    {
        [JsonProperty(PropertyName = "target")]
        public Target Target;

        [JsonProperty(PropertyName = "message_data")]
        public MessageData MessageData;
    }

    public class Target
    {
        [JsonProperty(PropertyName = "recipient_id")]
        public string RecipientId;
    }

    public class MessageData
    {
        [JsonProperty(PropertyName = "text")]
        public string TextMessage;
    }

    #endregion
}