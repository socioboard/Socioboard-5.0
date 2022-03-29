let Steps = [];
 Steps = [
    {
        intro: 'Welcome to History page: This page shows post details history of all posts which have published to your social accounts.'
    },
    {
        element: document.querySelector('.scheduled-create_btn'),
        intro: 'From here you can go to the scheduling page and schedule the post to publish.'
    },
];
if ($( "#viewButton" ). hasClass('eyeDiv')) {
    Steps.push({
        element: document.querySelector('.eyeDiv'),
        intro: 'Click here to see the days(s) and timings(s).'
    });
}
