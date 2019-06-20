const MailServices = require('../../core/mail/utils/mailLibs');

const mailServices = new MailServices();
const expire = 6;
const expired = 7;
const last_login = 8;

describe('expireNotification', () => {

    test('expireNotification_shouldReturn_successMessageForValidInputs', () => {
        return mailServices.sendExpireAlert()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('expireNotification_shouldReturn_errorForAnyErrorOccured', () => {
        return mailServices.sendExpireAlert()
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('expireNotification_shouldReturn_errorForInvalidInputs', () => {
        return mailServices.sendExpireAlert(20)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('expiredNotification', () => {

    test('expiredNotification_shouldReturn_successMessageForValidInputs', () => {
        return mailServices.sendExpiredInitimation()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('expiredNotification_shouldReturn_errorForAnyErrorOccured', () => {
        return mailServices.sendExpiredInitimation()
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('expiredNotification_shouldReturn_errorForInvalidInputs', () => {
        return mailServices.sendExpiredInitimation()
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('loginRemainder', () => {

    test('loginRemainder_shouldReturn_successMessageForValidInputs', () => {
        return mailServices.sendLoginReminder()
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('loginRemainder_shouldReturn_errorForAnyErrorOccured', () => {
        return mailServices.sendLoginReminder()
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('loginRemainder_shouldReturn_errorForInvalidInputs', () => {
        return mailServices.sendLoginReminder(last_login)
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('sendOtherNotification', () => {

    test('sendOtherNotification_shouldReturn_successMessageForValidInputs', () => {
        return mailServices.sendCustomNotifications('message')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('sendOtherNotification_shouldReturn_errorForAnyErrorOccured', () => {
        return mailServices.sendCustomNotifications("string")
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('sendOtherNotification_shouldReturn_errorForInvalidInputs', () => {
        return mailServices.sendCustomNotifications('')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});

describe('getUsersMailedInfo', () => {

    test('getUsersMailedInfo_shouldReturn_successMessageForValidInputs', () => {
        return mailServices.getUsersMailedInfo(20, -1, 'expire@socioboard.com')
            .then((result) => {
                expect(result).not.toHaveProperty('message');
            });
    });

    test('getUsersMailedInfo_shouldReturn_errorForInvalidInputs', () => {
        return mailServices.getUsersMailedInfo(20, 1, 'expire@socioboard.in')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });


    test('getUsersMailedInfo_shouldReturn_errorForMissingInputs', () => {
        return mailServices.getUsersMailedInfo('', -1, 'expire@socioboard.com')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

});