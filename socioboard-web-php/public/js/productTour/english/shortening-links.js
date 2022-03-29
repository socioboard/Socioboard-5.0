 let Steps = [];
 Steps = [
    {
        intro: 'Welcome to Link Shortening Page: This page allows to shorten long url links using bit.ly.'
    },
    {
        element: document.querySelector('.radioButtonShortening'),
        intro: 'No shortening'
    },
     {
         element: document.querySelector('.link-shortening'),
         intro: 'Bitly account details, can connect to Bitly accounts and the input field to link shortening.'
     },
];

 if ($("#Sb_content").find(".nameTextBoxDiv").length > 0|| $("#Sb_content").find(".datetimepicker-input").length > 0) {
     Steps.push(    {
             element: document.querySelector('.nameTextBoxDiv'),
             intro: 'Bitly account Name'
         },
         {
             element: document.querySelector('.datetimepicker-input'),
             intro: 'Bitly account added date'
         },
         {
             element: document.querySelector('.short_link_URL'),
             intro: 'Input to enter the long URL to be shortened.'
         },);
 }else{
     Steps.splice(2, 0,    {
         element: document.querySelector('.bityRadioBtn'),
         intro: 'Click here to connect to Bitly Account'
     },);
 }