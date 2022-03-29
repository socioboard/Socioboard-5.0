let Steps = [
    {
        intro: 'Welcome to Scheduling a post  Page : This page allows making & editing posts in different accounts at a time with multiple(draft, publish & instant post) options.'
    },
    {
        element: document.querySelector('.infoDiv'),
        intro: 'Click here to get info about what type of social account networks are available for scheduling and posting.'
    },
    {
        element: document.querySelector('.socialAccountsDiv'),
        intro: 'Here you can view and select the social media accounts for posting.'
    },
    {
        element: document.querySelector('.normal_post_area'),
        intro: 'Here you can add the required text to the post.'
    },
    {
        element: document.querySelector('.emojionearea-filters'),
        intro: 'Here you can select your preferred emoji'
    },
    {
        element: document.querySelector('.outGoingUrlDiv'),
        intro: 'From here you can add the URL you want to share.'
    },
    {
        element: document.querySelector('#input_urls_for_short'),
        intro: 'From here you can enter a long urls links to short.'
    },

    {
        element: document.querySelector('.publishContentSubmit'),
        intro: 'From here you can directly publish instantly.'
    },
    {
        element: document.querySelector('.schedule-post-btn'),
        intro: 'From here You can Schedule a  normal post or day-wise post.'
    },
    {
        element: document.querySelector('.draftButton'),
        intro: 'By using this you can save your post as the draft(means saving it for posting in future instead of posting it now.).'
    },
    {
        element: document.querySelector('.previewTabClass'),
        intro: 'Here you can view the preview of how it displays in your respective social media account.'
    },

];
if ($("#option_upload").is(":visible") === true) {
    Steps.splice(6, 0,       {
        element: document.querySelector('.picClass'),
        intro: 'Here you can select the image for the post.'
    },);
    Steps.splice(7, 0,           {
        element: document.querySelector('.videoClass'),
        intro: 'Here you can select the  video for the post'
    },);
}
