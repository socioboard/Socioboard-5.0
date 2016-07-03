using System;
using Socioboard.Instagram.App.Core;

namespace Socioboard.Instagram.Authentication
{
    [Serializable]
    public class LikesList : InstagramBaseObject
    {
        public int count;
        public User[] data;
    }
}