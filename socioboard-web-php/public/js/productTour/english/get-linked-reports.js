let Steps=[];
Steps = [
        {
            intro: 'Welcome to LinkedIn Reports Page: The Linkedin page report contains a Linkedin page followers graph with organic and paid followers growth. and also have graphical representation for Likes, Unique Impressions, Shares, Comments, Impressions, Clicks day wise.'
        },

        {
            element: document.querySelector('.team_Date_Range'),
            intro: 'From here You can Select a date Range to generate Reports Data in a date range like weekly monthly etc.'
        },
        {
            element: document.querySelector('.linkedInFollowerDiv'),
            intro: 'This Shows the Stats of Paid Followers Counts, Total Followers Counts,Organic Followers Counts on Particular Date'
        },
        {
            element: document.querySelector('.paid_Followers_Div'),
            intro: 'This shows the total count of followers gained by paid ads on particular date of selected linkedIn page.'
        },
        {
            element: document.querySelector('.total-followers_Div'),
            intro: 'This Shows count of total number of followers of selected linkedIn page on Particular Date.'
        },
        {
            element: document.querySelector('.organic_Followrs_Div'),
            intro: 'This Shows count of total number of organic followers(gained without ads) of selected linkedIn page on Particular Date.'
        },
        {
            element: document.querySelector('.linkedInPageStatsDiv'),
            intro: 'This Shows the Stats of Paid Followers Counts, Total Followers Counts,Organic Followers Counts on Particular Date'
        },
    {
        element: document.querySelector('.likesDIv'),
        intro: 'This shows total number of likes count of selected linkedIn page on particular date.'
    },
    {
        element: document.querySelector('.uniqueImpressionsDiv'),
        intro: 'Unique Impression: The number of people who had any content from your Page or about your Page enter their screen. This includes posts, check-ins, ads, social information from people who interact with your Page, and more. (Unique Users).'
    },
    {
        element: document.querySelector('.sharesDiv'),
        intro: 'Shares : Total counts of  numbers of shares on that selected linkedIn page on particular date.'
    },
    {
        element: document.querySelector('.commentsDiv'),
        intro: 'Comments : Total counts of  numbers of comments on that selected linkedIn page on particular date.'
    },
    {
        element: document.querySelector('.impressionsDiv'),
        intro: 'Impressions: The number of times any content from your Page or about your Page entered a person\'s screen. This includes posts, stories, ads, as well other content or information on your Page. (Total Count).'
    },
    {
        element: document.querySelector('.clicksDivs'),
        intro: 'Clicks : Total counts of  numbers of clicks on that selected linkedIn page on particular date.'
    },
    ];

if ($("#Sb_content").find(".noLinkedInDivAdded").length > 0|| $("#Sb_content").find(".noLinkedInDivAdded").length > 0) {
}else{
    Steps.splice(2, 0,     {
        element: document.querySelector('.linkedInAccountsData'),
        intro: 'From here You can select a LinkedIn Page Accounts from dropdown of which you want to generate LinkedIN Reports'
    },);
}
