let Steps = [];
 Steps = [
    {
        intro: 'Welcome to Pinterest Publish View  Page: Publish the Pictures to Pinterest Boards that integrated to SB with just one click,\n' +
            'publish the multiple account and boards simultaneously.'
    },
    {
        element: document.querySelector('.normal_post_area'),
        intro: 'From here You can write the text you want to publish.'
    },
    {
        element: document.querySelector('.outGoingUrlDiv'),
        intro: 'From here you can add the URL you want to share.'
    },
    {
        element: document.querySelector('.new_pic'),
        intro: 'From here you can select the image you want to publish to Pinterest board selected.'
    },
    {
        element: document.querySelector('.previewTabClass'),
        intro: 'Here you can view the preview of how it displays in your respective social media account.'
    },
];
if ($( "#boardsNameDiv" ). hasClass('boardDiv')) {
    Steps.splice(1, 0,       {
        element: document.querySelector('.boardDiv'),
        intro: 'Click here to see and select a board you want to publish'
    },)
}
