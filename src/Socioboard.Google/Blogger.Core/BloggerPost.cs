using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Socioboard.GoogleLib.Blogger.Core
{
    public class BloggerPost
    {
        public static string PostBloggerBlogs(string Title, string Content, string BlogId) 
        {

            string str = "{\"kind\": \"blogger#post\",\"blog\": {\"id\": \""+BlogId+"\"},\"title\": \""+Title+"\",\"content\": \""+Content+"\"}";

            return str;
        }

    }
}
