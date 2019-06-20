const AppInsightLibs = require('./../../../user/core/appinsights/utils/appinsightlibs');
const appinsightlibs = new AppInsightLibs();

describe('getAllRealtimeUsers', () => {
    test('getAllRealtimeUsers_shouldReturn_successMessageForValidInputs', () => {
        return appinsightlibs.getAllRealtimeUsers()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getAllRealtimeUsers_shouldReturn_errorMessageForAnyInputError', () => {
        return appinsightlibs.getAllRealtimeUsers()
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('getUsersActivities', () => {
    test('getUsersActivities_shouldReturn_successMessageForValidInputs', () => {
        var email = "testadmin@socioboard.com";
        var pageId = 1;
        return appinsightlibs.getUsersActivities(email, pageId)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getUsersActivities_shouldReturn_errorForMissingInputs', () => {
        var email = "";
        var pageId = 1;
        return appinsightlibs.getUsersActivities(email, pageId)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('getUserActionCount', () => {

    test('getUserActionCount_shouldReturn_successMessageForValidInputs', () => {
        var email = "testadmin@socioboard.com";
        var startDate = "2019-05-08";
        var endDate = "2019-05-26";
        return appinsightlibs.getUserActionCount(email, startDate, endDate)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getUserActionCount_shouldReturn_errorMessageForInvalidEmail', () => {
        var email = "testadmin@socioboard.com";
        var startDate = "2019-05-08";
        var endDate = "2019-05-26";
        return appinsightlibs.getUserActionCount(email, startDate, endDate)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('getUserActionCount_shouldReturn_errorMessageForInvalidStartDate', () => {
        var email = "testadmin@socioboard.com";
        var startDate = "2019-05-25";
        var endDate = "2019-04-26";
        return appinsightlibs.getUserActionCount(email, startDate, endDate)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('getUserActionCount_shouldReturn_errorMessageForIvalidDateFormat', () => {
        var email = "testadmin@socioboard.com";
        var startDate = "20-04-2019";
        var endDate = "2019-04-26";
        return appinsightlibs.getUserActionCount(email, startDate, endDate)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('getUserActionCount_shouldReturn_errorForDataDifference', () => {
        var email = "testadmin@socioboard.com";
        var startDate = "2019-04-27";
        var endDate = "2019-04-26";
        return appinsightlibs.getUserActionCount(email, startDate, endDate)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
    test('getUserActionCount_shouldReturn_errorForMissingInputs', () => {
        var email = "";
        var startDate = "2019-04-25";
        var endDate = "2019-04-26";
        return appinsightlibs.getUserActionCount(email, startDate, endDate)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });
});

describe('getRealtimeUsersActivities', () => {

    test('getRealtimeUsersActivities', () => {
        var email = 'testadmin@socioboard.com';
        return appinsightlibs.getRealtimeUsersActivities(email)
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });
    test('getRealtimeUsersActivities', () => {
        return appinsightlibs.getRealtimeUsersActivities('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});
