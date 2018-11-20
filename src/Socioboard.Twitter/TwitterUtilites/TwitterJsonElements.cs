using Newtonsoft.Json;
using Socioboard.Twitter.Twitter.Core;

namespace Socioboard.Twitter.TwitterUtilites
{
    public class TwitterJsonElements
    {
        [JsonProperty(PropertyName = "event")]
        public TwitterEvent Events { get; set; }
    }
}