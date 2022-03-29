let Steps=[];
if ($("#instagramFeeds").find(".noInstagramDiv").length === 0) {
    Steps = [
        {
            intro: 'Welcome to Instagram feeds Page: This page shows the posts(feeds) of Instagram accounts.'
        },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select Instagram accounts of which You want to look for Feeds.'
        },
        {
            element: document.querySelector('.rating-css'),
            intro: 'From here you can Change the rating of Social Account.'
        },
        {
            element: document.querySelector('.postLinkClassDiv'),
            intro: 'From here you can change the rating of Social Account.'
        },
        {
            element: document.querySelector('.reSocioButtonClass'),
            intro: 'From here you can Share Post to Multiple Social Media Accounts.'
        },

    ]

}else{
    Steps = [
        {
            intro: 'Welcome to Instagram  feeds Page: This page shows the feeds(Posts) of Instagram accounts added.'
        },
    ]
}
