let Steps=[];
if ($("#linkedInFeeds").find(".noLinkedInDiv").length === 0) {
    Steps = [
        {
            intro: 'Welcome to LinkedIn Pages feeds Page: This page shows the posts(feeds) of LinkedIn page accounts.'
        },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select LinkedIn Page accounts of which You want to look for Feeds.'
        },
        {
            element: document.querySelector('.rating-css'),
            intro: 'From here you can change the rating of your Social Account.'
        },
        {
            element: document.querySelector('.reSocioButtonClass'),
            intro: 'From here you can Share Post to Multiple Social Media Accounts.'
        },
        {
            element: document.querySelector('.postLinkClassDiv'),
            intro: 'Clicking here will redirect to the original post on the LinkedIn page.'
        },
    ];
}else{
    Steps = [
        {
            intro: 'Welcome to LinkedIn Pages feeds Page: This page shows the posts(feeds) of LinkedIn page accounts.'
        },
    ];
}
