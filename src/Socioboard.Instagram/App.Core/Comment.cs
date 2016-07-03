using System;
using Socioboard.Instagram.App.Core;

namespace Socioboard.Instagram.Authentication
{


    [Serializable]
    public class Comment : InstagramBaseObject
    {
        public double created_time;
        public string text;
        public string id;
        public User from;
        public bool owncomment = false;
    }
}