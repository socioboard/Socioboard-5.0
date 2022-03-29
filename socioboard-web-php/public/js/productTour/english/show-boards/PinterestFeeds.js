let Steps=[];
if ($("#boardRow").find(".noPinterestBoardsDiv").length === 0) {
     Steps = [
        {
            intro: 'Welcome to View Pinterest Feeds  Page: This page shows all Boards present in Your Pinterest Accounts.'
        },
        {
            element: document.querySelector('.selectAccountsDiv'),
            intro: 'From here you can select Pinterest accounts of which You want to look for Boards in it.'
        },
        {
            element: document.querySelector('.boardNameDiv'),
            intro: 'Clicking Here will redirecting this Board in Pinterest Site.'
        },
    ];
}else{
    Steps = [
        {
            intro: 'Welcome to View Pinterest Feeds  Page: This page shows all Boards present in Your Pinterest Accounts'
        },
    ]
}

