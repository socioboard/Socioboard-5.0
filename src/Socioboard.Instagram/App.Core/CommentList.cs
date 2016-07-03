using System;

namespace Socioboard.Instagram.Authentication
{
    [Serializable]
    public class CommentList : InstagramBaseObject
    {
        public int count;
        public Comment[] data;
    }
}