


namespace Socioboard.Instagram.Authentication
{
    [System.Serializable]
    public class InstagramBaseObject {
        protected oAuthInstagram InstagramApi { get { return oAuthInstagram.GetInstance(); } }
    }
}
