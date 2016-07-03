using System;

namespace Socioboard.Instagram.Authentication
{
    [Serializable]
    public class Relation : InstagramBaseObject
    {
        public string outgoing_status;
        public string incoming_status;
    }
}