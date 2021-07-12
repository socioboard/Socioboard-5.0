// begin:switch dark/light theme 
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
let time;

function switchTheme(e) {
    clearInterval(time);// will stop calling setInterval function changeThemeByTime().
    sessionStorage.setItem("SessionName", "clicked");//setting value on session variable to know if button theme clicked manually or not
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false); // end:switch dark/light theme

/**
 * TODO We have to switch theme from dark to white and vice versa based on day or night time , if its day time then white and if its night time the dark theme.
 * This function is used for switching theme of dark and night based on day or night time on every 15 minutes it will check and run code.
 * ! Do not change this function without checking script code of changing theme.
 */
function changeThemeByTime() {
    let date = new Date();
    let hours = date.getHours();
    if (hours >= 7 && hours < 18) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }

}

if (sessionStorage.getItem("SessionName") !== 'clicked') {
    time = setInterval(function () {
        changeThemeByTime();// calling function to check if its day or night in every 15 minutes
    }, 60000 * 15);
}
// begin::Preview Desktop and Mobile Tabs
var previewTab = $('#preview-tabs a')
previewTab.on('click', previewContainer);
function previewContainer(e) {
    if(e.target.id === 'mobile-preview') {
        $('#PreviewTabContent .preview-tab').removeClass('desktop-preview');
        $('#PreviewTabContent .preview-tab').addClass('mobile-preview')
    } else {
        $('#PreviewTabContent .preview-tab').removeClass('mobile-preview');
        $('#PreviewTabContent .preview-tab').addClass('desktop-preview')
    }
}

// end::Preview Desktop and Mobile Tabs

