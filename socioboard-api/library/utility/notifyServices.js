const requestPromise = require('request-promise');
const NotifyModel = require('../mongoose/models/notifications');

function Notification(host_url) {

    this.host_url = host_url;

    let notificationMessage = '';
    Object.defineProperty(this, 'notificationMessage', {
        set: function (message) {
            if (typeof message == 'string') {
                notificationMessage = message;
            }
        },
        get: function () {
            return notificationMessage;
        }
    });

    let teamName = '';
    Object.defineProperty(this, 'teamName', {
        set: function (team) {
            if (typeof team == 'string') {
                teamName = team;
            }
        },
        get: function () {
            return teamName;
        }
    });

    let notifyType = '';
    Object.defineProperty(this, 'notifyType', {
        set: function (type) {
            if (typeof type == 'string') {
                notifyType = type;
            }
        },
        get: function () {
            return notifyType;
        }
    });

    let initiatorName = '';
    Object.defineProperty(this, 'initiatorName', {
        set: function (initiator) {
            if (typeof initiator == 'string') {
                initiatorName = initiator;
            }
        },
        get: function () {
            return initiatorName;
        }
    });

    let profileType = '';
    Object.defineProperty(this, 'profileType', {
        set: function (profile) {
            if (typeof initiator == 'string') {
                profileType = profile;
            }
        },
        get: function () {
            return profileType;
        }
    });

    let status = '';
    Object.defineProperty(this, 'status', {
        set: function (nofityStatus) {
            if (typeof nofityStatus == 'string') {
                status = nofityStatus;
            }
        },
        get: function () {
            return status;
        }
    });

    let targetUserId = '';
    Object.defineProperty(this, 'targetUserId', {
        set: function (targetUsers) {
            if (typeof targetUsers == 'array') {
                targetUserId = targetUsers;
            }
        },
        get: function () {
            return targetUserId;
        }
    });

    let targetTeamId = '';
    Object.defineProperty(this, 'targetTeamId', {
        set: function (teamIds) {
            if (typeof teamIds == 'array') {
                targetTeamId = teamIds;
            }
        },
        get: function () {
            return targetTeamId;
        }
    });
}


Notification.prototype.saveNotifications = function saveNotifications() {
    var mongoDetails = {
        notificationMessage: this.notificationMessage,
        teamName: this.teamName,
        notifyType: this.notifyType,
        initiatorName: this.initiatorName,
        profileType: this.profileType,
        status: this.status,
        targetUserIds: this.targetUserIds,
        targetTeamIds: this.targetTeamIds
    }
    var notifyMongo = new NotifyModel(mongoDetails);
    return notifyMongo.save();
};


Notification.prototype.sendTeamNotification = function sendTeamNotification(teamId, Message) {
    console.log(`Message : \n ${Message}`);
    return requestPromise(`${this.host_url}/v1/notify/sendTeamNotification?teamId=${teamId}&notificationDetails=${Message}`)
        .then(() => {
            console.log("Send Notifications");
            return;
        })
        .catch((error) => {
            return;
        });
};

Notification.prototype.sendUserNotification = function sendUserNotification(userId, Message) {
    return requestPromise(`${this.host_url}/v1/notify/sendUserNotification?userId=${userId}&notificationDetails=${Message}`)
        .then(() => {
            console.log("Send Notifications");
            return;
        })
        .catch((error) => {
            return;
        });
};

module.exports = Notification;
