using System;
using Socioboard.Instagram.Authentication;


namespace Socioboard.Instagram.App.Core
{
    [Serializable]
    public class User : InstagramBaseObject, IEquatable<User>
    {
        public string id;
        public string username;
        public string full_name;
        public string profile_picture;

        public string first_name;
        public string last_name;
        public string bio;
        public string website;
        public string type;
        public string follows;
        public string followed_by;
        public count counts;

        public bool isFollowing;
        public bool isFollowed;
        public bool isSelf;

        public struct count
        {
            public int follows;
            public int followed_by;
            public int media;
        }
        public bool Equals(User other)
        {
            if (ReferenceEquals(other, null)) return false;
            if (ReferenceEquals(this, other)) return true;

            return id.Equals(other.id);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(obj, null)) return false;
            if (ReferenceEquals(this, obj)) return true;

            if (obj is User) {
                return id.Equals(((User) obj).id);
            }

            return false;
        }

        public override int GetHashCode()
        {
            int hashProductName = id == null ? 0 : int.Parse(id);
            return hashProductName;
        }
    }
}
