let Steps=[];
Steps = [
    {
        intro: 'Welcome to Team Report Page: The team report contains the report of the team schedule and published posts, also have the reports of followers and followings on Twitter and Facebook.'
    },
    {
        element: document.querySelector('.teamSelectDiv'),
        intro: 'From here you can select a team from the dropdown of which you want to generate a Team Report.'
    },
    {
        element: document.querySelector('.team_Date_Range'),
        intro: 'From here you can select a date range in which you want to get a report.'
    },
    {
        element: document.querySelector('.teamMembersCounts'),
        intro: 'It shows the total count of team members of selected Team.'
    },
    {
        element: document.querySelector('.invitePendingCounts'),
        intro: 'It shows the total count of pending Invited Members.'
    },
    {
        element: document.querySelector('.leftFromTeamCounts'),
        intro: 'It shows the total count of left members from the team.'
    },
    {
        element: document.querySelector('.teamMembersNamesDiv'),
        intro: 'It shows all the Team members present along with their names and profile pic.',
    },
    {
        element: document.querySelector('.schduledChartsDiv'),
        intro: 'This Gives a Graph of Scheduled Published and Failed count of selected Teams on a particular Date.'
    },
    {
        element: document.querySelector('.published_DIv'),
        intro: 'This gives the total count of Social Profiles, Post Failed, Post Count, Scheduled Publish data along with graph format.'
    }

];
if ($("#Sb_content").find(".noTwitterAccountsAddedDiv").length > 0|| $("#Sb_content").find(".noFacebookAccountsAddedDiv").length > 0) {
}
else{
    Steps.push(
        {
            element: document.querySelector('.twitterAccountsData'),
            intro: 'From Here You can Select  Twitter accounts and get Twitter Reports.'
        },
        {
            element: document.querySelector('.faceBookAccountsData'),
            intro: 'From Here You can Select  Facebook Accounts and get Facebook Reports.'
        },
        {
            element: document.querySelector('.twt_stats_chart'),
            intro: 'This Shows Stats of the Follower,following, Likes,Posts Counts on a particular date in the form of a graph of Selected Twitter Account.'
        },
        {
            element: document.querySelector('.fb_stats_chart'),
            intro: 'This Shows Stats of the Likes, Impressions, Daily Total Reach Count on a particular date in the form of a graph of Selected Facebook Page Account.'
        }
    );
}
