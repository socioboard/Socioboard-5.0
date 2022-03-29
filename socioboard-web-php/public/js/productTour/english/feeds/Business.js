let Steps=[];
if ($("#instagramFeeds").find(".noInstaBusinessDiv").length === 0) {
    Steps = [
        {
            intro: 'Welcome to Instagram business feeds Page: This page shows the posts(feeds) of Instagram business accounts.'
        },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select Instagram Business  accounts of which You want to look for Feeds.'
        },
        {
            element: document.querySelector('.rating-css'),
            intro: 'From here you can change the rating of Social Account.'
        },
        {
            element: document.querySelector('.postLinkClassDiv'),
            intro: 'Clicking here will redirect to the original post on Instagram.'
        },
        {
            element: document.querySelector('.reSocioButtonClass'),
            intro: 'From here you can Share Post to Multiple Social Media Accounts.'
        },
    ];

}else{
    Steps = [
        {
            intro: 'Welcome to Instagram business feeds Page: This page shows the posts(feeds) of Instagram business accounts.'
        },
    ];
}
