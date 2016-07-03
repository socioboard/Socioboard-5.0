using System;
using Socioboard.Instagram.App.Core;

namespace Socioboard.Instagram.Authentication
{

    [Serializable]
    public class InstagramMedia : InstagramBaseObject
    {

        public CommentList comments;
        public Caption caption;
        public LikesList likes;
        public string link;
        public User user;
        public double created_time;
        public ImagesList images;
        public VideoList videos;
        public string type;
        public string filter;
        public string[] tags;
        public string id;
        public Location location;
        public bool user_has_liked;

    }
}