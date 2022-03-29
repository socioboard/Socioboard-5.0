const Steps = [
    {
        intro: 'Welcome to SocioBoard Dashboard: This is a dynamic page to view all the recent reports. useful to have enough glance at the landing itself.'
    },
    {
        element: document.querySelector('.reportsCart'),
        intro: 'Clicking here will show The Custom Reports Added'
    },
    {
        element: document.querySelector('.nofificationsDiv'),
        intro: 'Here you can see multiple notifications of Team, Activity Log, User & Publishing History.'
    },
    {
        element: document.querySelector('.team_Name_Box'),
        intro: 'Here you can see the currently selected team along with all teams created, from here you can get the option to create a Team also.'
    },
    {
        element: document.querySelector('#Sb_quick_user_toggle'),
        intro: 'Clicking here will show the menu options for profile edit, Auto emails Reports, etc.'
    },
    {
        element: document.querySelector('.introjs-step-1'),
        intro: 'Create A New Post: By using this option, you can directly schedule messages with normal scheduling and day-wise scheduling options.'
    },
    {
        element: document.querySelector('.introjs-step-2'),
        intro: 'Calendar View:  By using this, you can have the calendar view of scheduled and published posts showing Normal schedule (in red) and Day wise schedule (in yellow).'
    },
    {
        element: document.querySelector('.introjs-step-3'),
        intro: 'Team Report:  There you can view the nested pie chart showing you the activities of your social profile based on the number of accounts, scheduled posts, and total post count'
    },
    {
        element: document.querySelector('.introjs-step-4'),
        intro: 'Premium Plan: This shows the plan Details selected by the user & all plans show there.'
    },

    {
        element: document.querySelector('.introjs-step-5'),
        intro: 'It shows the graphical representation of scheduled posts, published and failed posts based on Date filters.'
    },
    {
        element: document.querySelector('.changeDateFilterDiv'),
        intro: 'Click here to see Graph Data on This month last month etc.'
    },
    {
        element: document.querySelector('.addToCartDIv'),
        intro: 'This plus sign Button has been given to add Reports or Data in the Custom Reports.'
    },
    {
        element: document.querySelector('.introjs-step-6'),
        intro: 'Team Report: There you can view the nested pie chart showing you the activities of your social profile based on the number of accounts, scheduled posts, and total post count.'
    },
    {
        element: document.querySelector('.view_accounts_btn'),
        intro: 'Click here to check all the social accounts added.'
    },
    {
        element: document.querySelector('.sendInviteDiv'),
        intro: 'Add your known person Social Account(s) to your account by Sending an Invitation to that person.'
    },
    {
        element: document.querySelector('.addAccountsModal'),
        intro: 'Click here to add social accounts.'
    },
    {
        element: document.querySelector('.accountsSectionDiv'),
        intro: 'Accounts: It shows Recently Added  Social Accounts data.'
    },

    {
        element: document.querySelector('.introjs-step-9'),
        intro: 'Top 5 RSS: It shows  the top 5 searched RSS feeds results.'
    },
    {
        element: document.querySelector('.introjs-step-8'),
        intro: 'Publishing History: It shows History Data  you can check 3 latest scheduled posts.'
    },

];
if ($("#accountsSectionDiv").find(".noAccountsDiv").length === 0) {
    Steps.splice(16, 0,{
        element: document.querySelector('.connectedButton'),
        intro: 'Clicking here will show the profile and feed of that account.'
    });
    Steps.splice(17, 0,{
        element: document.querySelector('.quickActionsButton'),
        intro: 'Click here to delete or lock or unlock this account.'
    });
}
