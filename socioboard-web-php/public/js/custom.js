// begin:switch dark/light theme 
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false); // end:switch dark/light theme


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

