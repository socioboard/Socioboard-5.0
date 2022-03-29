let Steps=[];
if ($("#twitterFeeds").find(".noTwitterFeedsDiv").length === 0) {
     Steps = [
        {
            intro: 'Welcome to Twitter feeds Page: This page shows the feeds(Posts) of Twitter accounts added.'
        },
         {
             element: document.querySelector('.rating-css'),
             intro: 'From here you can change the rating of Social Account.'
         },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select Twitter  accounts of which You want to look for Feeds.'
        },
        {
            element: document.querySelector('.searchButton'),
            intro: 'Click Here to Get Trending Hashtags in a Selected Country.'
        },
        {
            element: document.querySelector('.postLinkClassDiv'),
            intro: 'Clicking here will redirect to the original post on Twitter.'
        },
         {
             element: document.querySelector('.dateClass'),
             intro: 'It shows the time when the post was published.'
         },
        {
            element: document.querySelector('.retweetButton'),
            intro: 'This shows retweet Count and then you can retweet this Tweet From here.'
        },
        {
            element: document.querySelector('.likeButtonDiv'),
            intro: 'This shows likes Count and then you can like or dislike this Tweet From here.'
        },
         {
             element: document.querySelector('.reSocioButtonClass'),
             intro: 'From here you can Share posts to Multiple Social Media Accounts.'
         },
        {
            element: document.querySelector('.sendCommentDiv'),
            intro: 'From here you can reply to this post'
        },

    ];
}else{
    Steps = [
        {
            intro: 'Welcome to Twitter feeds Page: This page shows the feeds(Posts) of Twitter accounts added.'
        },
    ]
}
