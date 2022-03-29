let Steps=[];
Steps = [
    {
        intro: 'Welcome to Youtube Reports Page:Youtube Report: The Youtube report contains Youtube channel  total like, comments shares, dislikes, subscribers Lost, average view duration, subscribers Gained, views count based on dates.'
    },
    {
        element: document.querySelector('.team_Date_Range'),
        intro: 'From here You can select the date range to generate reports Data in a date range like weekly monthly etc.'
    },
    {
        element: document.querySelector('.youtubeChartsDiv'),
        intro: 'This shows the graphical stats  of Likes, Dislikes, Comments, Shares counts data on a particular Date of Youtube channel account selected.'
    },
    {
        element: document.querySelector('.youtubeOverViewStats'),
        intro: 'This graph shows the total overview counts  of Subscribers Lost, Average Views Duration, Subscribers Gained counts,Views counts of the selected Youtube channel account within selected date range.'
    },
];

if ($("#Sb_content").find(".noYoutubeDiv").length > 0|| $("#Sb_content").find(".noYoutubeDiv").length > 0) {
}else{
    Steps.splice(2, 0,    {
        element: document.querySelector('.youtubeAccountsData'),
        intro: 'From here you can select a Youtube account from the dropdown of which you want to generate a Youtube Reports.'
    },);
}
