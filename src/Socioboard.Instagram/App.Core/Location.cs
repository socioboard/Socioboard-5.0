using System;

namespace Socioboard.Instagram.Authentication
{
    [Serializable]
    public class Location : InstagramBaseObject
    {
        public string id;
        public double latitude;
        public double longitude;
        public string name;

    }
}
