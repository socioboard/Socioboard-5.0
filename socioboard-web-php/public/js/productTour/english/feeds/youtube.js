let Steps=[];
if ($("#youtubeFeeds").find(".youtubeNoDIv").length === 0) {
     Steps = [
        {
            intro: 'Welcome to Youtube feeds Page: This page shows the feeds(Posts) of Youtube accounts added..'
        },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select Youtube  accounts of which You want to look for Feeds.'
        },
        {
            element: document.querySelector('.rating-css'),
            intro: 'From here you can Change the rating of Social Account.'
        },
         {
             element: document.querySelector('.postLinkClassDiv'),
             intro: 'Clicking here will redirect to the original Profile of the Youtube Channel.'
         },
        {
            element: document.querySelector('.reSocioButtonClass'),
            intro: 'From here you can Share Post to Multiple Social Media Accounts.'
        },
        {
            element: document.querySelector('.sendCommentDiv'),
            intro: 'From here You can write and Send Comments for this Post.'
        },

    ];

}else{
    Steps = [
        {
            intro: 'Welcome to Youtube  feeds Page: This page shows the feeds(Posts) of Youtube channel accounts added.'
        },
    ]
}
