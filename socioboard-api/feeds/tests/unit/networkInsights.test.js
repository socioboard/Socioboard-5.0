const NetworkInsightsLibs = require('../../core/networkInsights/utils/networkinsightlibs');
const networkInsightsLibs = new NetworkInsightsLibs();

// need to give inputs.

const userId = 1;
const teamId = 5;

describe('facebookPageInsights', () => {

    test('facebookPageInsights_ShouldReturnSuccess_ToDayData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 1, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnSuccess_YesterDayData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 2, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnSuccess_Last7DaysData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 3, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnSuccess_Last30DaysData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 4, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnSuccess_ThisMonthData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 5, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnSuccess_LastMonthData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 6, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnSuccess_CustomRangeData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 7, '2019-04-22', '2019-04-25')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('facebookPageInsights_ShouldReturnError_CustomRangeDataOfNoDates', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 7, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('facebookPageInsights_ShouldReturnError_InvalidCustomRangeData', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 7, '2019-04-22', '2019-04-20')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Check range values. since should be lesserthan or equals to until");
            });
    });

    test('facebookPageInsights_ShouldReturnError_InvalidAccountId', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 9485283, teamId, 2, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('facebookPageInsights_ShouldReturnError_InvalidFilterType', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, teamId, 22, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'please choose valid filter type');
            });
    });

    test('facebookPageInsights_ShouldReturnError_MissingInputs', () => {
        return networkInsightsLibs.facebookPageInsights(userId, '', teamId, '', 'start', 'enddate')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('facebookPageInsights_ShouldReturnError_InvalidTeamOfUser', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 3, 68574, 2, 'start', 'enddate')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('facebookPageInsights_ShouldReturnError_InvalidYtbAccount', () => {
        return networkInsightsLibs.facebookPageInsights(userId, 6, teamId, 2, 'start', 'enddate')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getYoutubeInsights', () => {

    test('getYoutubeInsights_ShouldReturnWarning_ToDayData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 1, '', '')
            .catch((error) => {
                expect(error.message).toMatch("Currently youtube didnt support today's and yesterday's insights, please choose some other");
            });
    });

    test('getYoutubeInsights_ShouldReturnWarning_YesterDayData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 2, '', '')
            .catch((error) => {
                expect(error.message).toMatch("Currently youtube didnt support today's and yesterday's insights, please choose some other");
            });
    });

    test('getYoutubeInsights_ShouldReturnSuccess_LastWeekData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 3, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getYoutubeInsights_ShouldReturnSuccess_Last30DaysData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 4, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getYoutubeInsights_ShouldReturnSuccess_ThisMonthData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 5, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getYoutubeInsights_ShouldReturnSuccess_LastMonthData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 6, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getYoutubeInsights_ShouldReturnSuccess_CustomRangeData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 7, '2019-04-22', '2019-04-24')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getYoutubeInsights_ShouldReturnError_CustomRangeDataOfNoDates', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 7, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getYoutubeInsights_ShouldReturnError_InvalidCustomRangeData', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 7, '2019-04-22', '2019-04-20')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Check range values. since should be lesserthan or equals to until");
            });
    });

    test('getYoutubeInsights_ShouldReturnError_InvalidAccountId', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 89560984, teamId, 3, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getYoutubeInsights_ShouldReturnError_InvalidFilterType', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, teamId, 45, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "please choose valid filter type");
            });
    });

    test('getYoutubeInsights_ShouldReturnError_MissingInputs', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, '', teamId, 3, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getYoutubeInsights_ShouldReturnError_InvalidTeamOfUser', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 10, 68574, 3, 'start', 'enddate')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getYoutubeInsights_ShouldReturnError_InvalidYtbAccount', () => {
        return networkInsightsLibs.getYoutubeInsights(userId, 1, teamId, 3, 'start', 'enddate')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });


});

describe('getLinkedInCompanyInsights', () => {

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_ToDayData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 1, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_YesterDayData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 2, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_LastWeekData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 3, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_Last30DaysData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 4, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_ThisMonthData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 5, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_LastMonthData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 6, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnSuccess_CustomRangeData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 7, '2019-04-24', '2019-04-28')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnError_CustomRangeDataOfNoDates', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 7, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnError_InvalidCustomRangeData', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 7, '2019-04-24', '2019-04-20')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Check range values. since should be lesserthan or equals to until");
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnError_InvalidAccountId', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9854795, teamId, 1, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnError_InvalidFilterType', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 9, teamId, 24, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "please choose valid filter type");
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnError_MissingInputs', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, '', teamId, 2, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });
   
    test('getLinkedInCompanyInsights_ShouldReturnError_InvalidTeamOfUser', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 10, 68574, 3, 'start', 'enddate')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getLinkedInCompanyInsights_ShouldReturnError_InvalidLinkedInAccount', () => {
        return networkInsightsLibs.getLinkedInCompanyInsights(userId, 1, teamId, 3, 'start', 'enddate')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});

describe('getInstagramBusinessInsights', () => {

    test('getInstagramBusinessInsights_ShouldReturnSuccess_ToDayData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 1, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnSuccess_YesterDayData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 2, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnSuccess_LastWeekData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 3, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnSuccess_Last30DaysData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 4, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnSuccess_ThisMonthData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 5, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnSuccess_LastMonthData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 6, '', '')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnSuccess_CustomRangeData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 7, '2019-04-24', '2019-04-28')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnError_CustomRangeDataOfNoDates', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 7, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnError_InvalidCustomRangeData', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 7, '2019-04-22', '2019-04-20')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Check range values. since should be lesserthan or equals to until");
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnError_InvalidAccountId', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 8579413, teamId, 9, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "Account isnt belongs to team or account is locked for the team!");
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnError_InvalidFilterType', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, 25, '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', "please choose valid filter type");
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnError_MissingInputs', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, teamId, '', '', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });
       
    test('getInstagramBusinessInsights_ShouldReturnError_InvalidTeamOfUser', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 13, 68574, 3, 'start', 'enddate')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'User not belongs to the team!');
            });
    });

    test('getInstagramBusinessInsights_ShouldReturnError_InvalidInstaAccount', () => {
        return networkInsightsLibs.getInstagramBusinessInsights(userId, 1, teamId, 3, 'start', 'enddate')
            .catch((error) => {
                expect(error.message).toMatch(new RegExp(`No profile found or account isn't * `));
            });
    });

});