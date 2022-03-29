let Steps = [
    {
        intro: 'Welcome to Accounts View Page: This page shows all social accounts added and also you can search them using filter.'
    },
    {
        element: document.querySelector('.SendInviteDIv'),
        intro: 'Add your known person Social Account(s) to your account by Sending an Invitation to that person.'
    },
    {
        element: document.querySelector('.acountDivCount'),
        intro: 'Shows the count of every Type of Social Accounts Added.'
    },
    {
        element: document.querySelector('.searchFilterDiv'),
        intro: 'Filter Accounts and search them by account type, Star Rating and User names Given.'
    },

];
if ($("#accountsDIv").find(".noAccountsDiv").length === 0) {
    Steps.push(        {
            element: document.querySelector('.profileLinkDiv'),
            intro: 'Clicking on it will redirect to the original profile on the social Account website.'
        },
        {
            element: document.querySelector('.rating-css'),
            intro: 'From here you can change the rating of Social Account.'
        },
        {
            element: document.querySelector('.profileDiv'),
            intro: 'Clicking on this will show Social Feeds and Profile Data of that social account'
        },
        {
            element: document.querySelector('.lockButtonDiv'),
            intro: 'You can lock/unlock your Account for accessing/blocking publishes and other operations.'
        },
        {
            element: document.querySelector('.cronUpdateDiv'),
            intro: 'This option allows updating account details on a day 1(off) or 2(on) times.'
        });
}
else{
    Steps.push({
        element: document.querySelector('#accountsDIv'),
        intro: 'Here will show all the details of the profiles of the social accounts added.'
    });
}




