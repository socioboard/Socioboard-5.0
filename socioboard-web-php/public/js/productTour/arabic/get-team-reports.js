function getSteps() {
    let StepsTeamReportsPage = [
        {
            intro: 'Welcome to Team Report Page'
        },
        {
            element: document.querySelector('.teamSelectDiv'),
            intro: 'From here You can select a Team from dropdown of which you want to generate a Team Report'
        },
        {
            element: document.querySelector('.team_Date_Range'),
            intro: 'From here You can Select Date Ranges to genrate Reports Data in a date range like weekly monthly etc.'
        },
        {
            element: document.querySelector('.team-members_Info_div'),
            intro: 'This gives the info about the Team Members Count,Total Invite Pending In a Team,Left Members Count, and Team members Present with Names of particular Team'
        },
        {
            element: document.querySelector('.schduledChartsDiv'),
            intro: 'This Gives Stats Graph Total overview of Scheduled Published and failed of Team on Particular Date and total Overview'
        },
        {
            element: document.querySelector('.published_DIv'),
            intro: 'This Gives Total Count of Social Profiles,Post Failed,  Post Count, Scheduled Publish Data'
        }
        ,
        {
            element: document.querySelector('.twitterAccountsData'),
            intro: 'From Here You can Select  twitter Accounts and get Twitter Reports'
        },
        {
            element: document.querySelector('.faceBookAccountsData'),
            intro: 'From Here You can Select  Facebook Accounts and get Facebook Reports'
        },
        {
            element: document.querySelector('.twt_stats_chart'),
            intro: 'This Shows Stats of the Follower,following,Likes,Posts Counts on a particular date in the form of graph of Selected Twitter Account'
        },
        {
            element: document.querySelector('.fb_stats_chart'),
            intro: 'This Shows Stats of the Likes,Impressions, Daily Total Reach Count on a particular date in the form of graph of Selected Facebook Page Account'
        }
    ];

    return StepsTeamReportsPage;
}