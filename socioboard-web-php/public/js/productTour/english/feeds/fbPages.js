let Steps=[];
if ($("#facebookFeeds").find(".fbPageDivs").length === 0) {
     Steps = [
        {
            intro: 'Welcome to Facebook Pages feeds Page: This page shows the posts(feeds) of Facebook page accounts.'
        },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select Facebook Page accounts of which You want to look for Feeds.'
        },
        {
            element: document.querySelector('.rating-css'),
            intro: 'From here you can change the rating of Social Account.'
        },
        {
            element: document.querySelector('.postLinkClassDiv'),
            intro: 'Clicking here will redirect to the original post on Facebook.'
        },
        {
            element: document.querySelector('.likeButtonDiv'),
            intro: 'From here You can like this Post.'
        },
        {
            element: document.querySelector('.sendCommentDiv'),
            intro: 'From here You can write and Send Comments for this Post.'
        },
        {
            element: document.querySelector('.reSocioButtonClass'),
            intro: 'From here you can Share posts to Multiple Social Media Accounts.'
        },
    ];
}else{
     Steps = [
        {
            intro: 'Welcome to Facebook Pages feeds Page: This page shows the posts(feeds) of Facebook page accounts.'
        },
    ];
}
