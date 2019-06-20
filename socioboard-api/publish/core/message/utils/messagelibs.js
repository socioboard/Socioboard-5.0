const config = require('config');
const TwitterConnect = require('../../../../library/network/twitter');
const db = require('../../../../library/sequelize-cli/models/index');
const Operator = db.Sequelize.Op;
const socialAccount = db.social_accounts;

class MessageLibs {

    constructor() {
        this.twitterConnect = new TwitterConnect(config.get('twitter_api'));
    }

    twitterDirectMessage(requestBody) {
        return socialAccount.findOne({
            where: {
                [Operator.and]: [{
                    account_type: 4
                }, {
                    account_id: requestBody.senderAccountId
                }]
            },
            attributes: ['account_id', 'access_token', 'social_id', 'account_type', 'refresh_token']
        })
            .then((socialAcc) => {
                if (!socialAcc)
                    throw new Error("Requested account not found or not a twitter profile");
                else {
                    var messageDetails = {
                        messageType: requestBody.messageType,
                        media: requestBody.media,
                        recipientId: requestBody.recipientId,
                        text: requestBody.text
                    };
                    return this.twitterConnect.directMessage(messageDetails, socialAcc.access_token, socialAcc.refresh_token);
                }
            })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    }
}

module.exports = MessageLibs;