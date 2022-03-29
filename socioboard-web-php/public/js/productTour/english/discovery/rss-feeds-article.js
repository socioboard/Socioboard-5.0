let Steps=[];
Steps = [
    {
        intro: 'Welcome to rss-feeds-article: Get World News by One-click from Integrated News Papers,and  have specific News search by adding Keyword.'
    },
    {
        element: document.querySelector('.rss-feed-articlesDiv'),
        intro: 'This div shows all the Newspapers Added clicking on them will show keywords related to that newspapers.'
    },
    {
        element: document.querySelector('.keywordDiv'),
        intro: 'Clicking on the keywords buttons here will show Newspaper articles related to these keywords.'
    },
];
if ($( "#showKeywordButton" ). hasClass('newsPaperButton')) {
    Steps.splice(2, 0,      {
        element: document.querySelector('.newsPaperButton'),
        intro: 'Click here to get keywords related to this Newspaper'
    })
}
