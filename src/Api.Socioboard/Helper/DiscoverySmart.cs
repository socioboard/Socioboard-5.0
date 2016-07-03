using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Api.Socioboard.Helper
{
    public class DiscoverySmart
    {
       public string tweet_id { get; set; }
       public string text { get; set; }
       public DateTime created_at { get; set; }
       public string twitter_id { get; set; }
       public string screan_name { get; set; }
       public string name { get; set; }
       public string description { get; set; }
       public string followers_count { get; set; }
       public string friends_count { get; set; }
       public string profile_image_url { get; set; }

    }
}
