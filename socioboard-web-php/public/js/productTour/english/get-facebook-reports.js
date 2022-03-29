let Steps=[];
Steps = [
    {
        intro: 'Welcome to the Facebook Reports Page.'
    },
    {
        element: document.querySelector('.team_Date_Range'),
        intro: 'From here You can Select Date Ranges to generate Reports Data in a date range like weekly monthly etc.'
    },
    {
        element: document.querySelector('.facebookChartsDiv'),
        intro: 'It shows the Graphical Data of the Selected Facebook page Likes, Unlikes counts within the particular Date value along with commutative Count Data.'
    },
    {
        element: document.querySelector('.pageImpressionsDiv'),
        intro: 'It shows the Graphical Data of the Selected Facebook page Total Impressions)\n' +
            '\nUnique Impressions\n'+
            '\nViral Impressions'+
            'all these counts data with in selected date range'
    },
    {
        element: document.querySelector('.totalImpressionsCountDiv'),
        intro: 'Total Impressions: The number of times any content from your Page or about your Page entered a person\'s screen. This includes posts, stories, ads, as well other content or information on your Page. (Total Count).'
    },
    {
        element: document.querySelector('.uniqueImpressionDiv'),
        intro: 'Unique Impression: The number of people who had any content from your Page or about your Page enter their screen. This includes posts, check-ins, ads, social information from people who interact with your Page, and more. (Unique Users).'
    },
    {
        element: document.querySelector('.viralImpressionsDiv'),
        intro: 'Viral Impressions: Total impressions of posts published by a friend about your Page by type. (Total Count).'
    },
    {
        element: document.querySelector('.pageOrganicDiv'),
        intro: 'It shows the Graphical Data of the Organic Impressions and Paid Impressions of selected FB pages on the selected date range.'

    },
    {
        element: document.querySelector('.organicImpressionsDiv'),
        intro: 'Organic Impressions: The number of times any post or story content from your Page or about your Page entered a person\'s screen through unpaid distribution. (Total Count).'

    },
    {
        element: document.querySelector('.paidImpressionsDiv'),
        intro: 'Paid Impressions Daily: The number of times any post or story content from your Page or about your Page entered a person\'s screen through paid distribution such as an ad. (Total Count).'

    },
    {
        element: document.querySelector('.pageImpByStoryDivCount'),
        intro: 'Page Impressions By Story Type: The number of stories about your Page by story type. (Total Count).'

    },
    {
        element: document.querySelector('.viralImpressionsDivCount'),
        intro: 'Viral Impressions By Story Type: Total impressions of posts published by a friend about your Page by type. (Total Count).'

    },
];
if ($("#Sb_content").find(".noFbPageAccountsDiv").length > 0|| $("#Sb_content").find(".noFbPageAccountsDiv").length > 0) {
}else{
    Steps.splice(2, 0,     {
        element: document.querySelector('.faceBookAccountsData'),
        intro: 'From here You can select a Facebook Accounts from the dropdown of which you want to generate a Facebook Reports.'
    },);
}
