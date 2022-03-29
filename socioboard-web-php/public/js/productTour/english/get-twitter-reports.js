let Steps=[];
Steps =   [
    {
        intro: 'Welcome to Twitter Report Page: The Twitter report contains twitter account followers and following count based on dates and total like, mention, post, and retweet counts.'
    },
    {
        element: document.querySelector('.team_Date_Range'),
        intro: 'From here you can select Date Range to generate Reports Data in a date range like weekly monthly etc.'
    },
    {
        element: document.querySelector('.twitterChartsDiv'),
        intro: 'This shows the Graphical Stats  of follower And Following Counts Data on a particular Date.'
    },
    {
        element: document.querySelector('.twitterOverViewStats'),
        intro: 'This shows the Total Overview Stats  of Favourites Counts, User Mention Counts, Posts Counts, and Retweet Counts on selected date range.'
    },
];

if ($("#Sb_content").find(".noTwitterAccountsDiv").length > 0|| $("#Sb_content").find(".noTwitterAccountsDiv").length > 0) {
}else{
    Steps.splice(2, 0,    {
        element: document.querySelector('.twitterAccountsData'),
        intro: 'From here you can select a Twitter account from the dropdown of which you want to generate a Twitter Reports.'
    },);
}
