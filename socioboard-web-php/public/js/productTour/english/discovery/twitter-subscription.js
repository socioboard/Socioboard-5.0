let Steps=[];
 Steps = [
    {
        intro: 'Welcome to Twitter-Subscription View Page: This page gives the best Twitter influencer for your business.'
    },
];
if ($("#Sb_content").find(".noTwitterAccountsDivAdded").length > 0|| $("#Sb_content").find(".noTwitterAccountsDivAdded").length > 0) {
}else{
    Steps.push(
        {
            element: document.querySelector('.filterDiv'),
            intro: 'From here search your Twitter influencers based on the Account, Username of the account.'
        },
        {
            element: document.querySelector('.gridView'),
            intro: 'This shows the grid view of results.'

        },
        {
            element: document.querySelector('.listView'),
            intro: 'Clicking here will show the list view of Results.'

        },
        {
            element: document.querySelector('.followButtonDiv'),
            intro: 'Click here to follow or Unfollow the Twitter influencer.'

        },);
}