using System;

using Socioboard.Instagram.Authentication;
using Socioboard.Instagram.App.Core;

namespace Socioboard.Instagram.Authentication
{
    [Serializable]
    public class AccessToken : InstagramBaseObject
    {
        public string access_token;
        public User user;

        public AccessToken()
        {
        }

        public AccessToken(string json) {
            AccessToken tk = Deserialize(json);
            access_token = tk.access_token;
            user = tk.user;
        }

        public string GetJson() {
            return Serialize(this);
        }

        public static string Serialize(AccessToken token) {
            string json =  Base.SerializeObject(token);
            return json;
        }

        public static AccessToken Deserialize(string json) {
            AccessToken token = Base.DeserializeObject<AccessToken>(json);
            return token;
        }
    }
}
