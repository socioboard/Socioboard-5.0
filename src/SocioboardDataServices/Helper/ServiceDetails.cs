using System.ComponentModel;

namespace SocioboardDataServices.Helper
{
    public enum ServiceDetails
    {
        [Description("Facebook")]
        //Update facebook feeds for all accounts
        FacebookUpdateFeeds,

        [Description("Facebook")]
        //Update facebook account base details (like name,dob, etc) for all accounts
        FacebookUpdatePageDetails,

        [Description("Google")]
        GooglePlusUpdateDetails,

        [Description("Instagram")]
        InstagramUpdateDetails,

        [Description("Youtube")]
        YoutubeUpdateDetails,

        [Description("Twitter")]
        TwitterUpdateFeeds,

        [Description("InstagramReports")]
        InstagramReportUpdateDetails,

        [Description("InstagramReports")]
        YoutubeReportUpdateDetails

    }
}