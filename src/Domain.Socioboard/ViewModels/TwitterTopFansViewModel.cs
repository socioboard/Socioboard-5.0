using Domain.Socioboard.Enum;
using Domain.Socioboard.Models.Mongo;
using System.Collections.Generic;
using System.Linq;

namespace Domain.Socioboard.ViewModels
{
    public class TwitterFan
    {
        public string screenName { get; set; }
        public string name { get; set; }
        public int mentionsCount { get; set; }
        public int retweetsCount { get; set; }
        public int totalCount { get; set; }
        public TwitterFan()
        { }
        public TwitterFan(List<MongoMessageModel> lstMongoTwitterMessage)
        {
            screenName = lstMongoTwitterMessage.First().fromScreenName;
            name = lstMongoTwitterMessage.First().fromName;
            mentionsCount = lstMongoTwitterMessage.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterMention);
            retweetsCount = lstMongoTwitterMessage.Count(t => t.type == Domain.Socioboard.Enum.MessageType.TwitterRetweet);
            totalCount = lstMongoTwitterMessage.Count();
        }
    }
}
