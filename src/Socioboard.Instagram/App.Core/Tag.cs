using System;
using Socioboard.Instagram.Authentication;

namespace Socioboard.Instagram.App.Core
{
    [Serializable]
    public class Tag : InstagramBaseObject
    {
        public string name;
        public int media_count;
    }
}