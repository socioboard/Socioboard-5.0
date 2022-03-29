let CURRENT_PATH = '';

function loadFile(fileName = '') {
    document.body.appendChild(document.createElement("script")).src = fileName;
}

function generateSteps() {
    let stepsPage = pageMappings[window.location.pathname.replace('/', '')];
    if (stepsPage !== CURRENT_PATH) {
        CURRENT_PATH = stepsPage;
        let languageID = languageMappings['en'];
        // let languageID = languageMappings[userLanguage ?? 'en'];
        console.log(stepsPage, languageID, 'steps and language');
        loadFile(`/js/productTour/${languageID}/${stepsPage}`);
        setTimeout(() => {
            startTour();
        }, 500);
    } else startTour();
}

startTour = () => {
    introJs().setOptions({
        skipLabel: 'Skip',
        doneLabel: 'Finish',
        steps: Steps
    }).start();
};

$('.introjs-step-0').on('click', () => {
    generateSteps();
});