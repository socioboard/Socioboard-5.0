using Socioboard.Twitter.App.Core;

namespace Socioboard.Twitter.Authentication
{
    interface IAuthentication
    {
        /// <summary>
        /// Checks whether an user is authenticated or not
        /// </summary>
        /// <returns>true if authentication successful,else false</returns>
       bool Authenticated(TwitterUser twitterUser,string goodProxy);
    }

}