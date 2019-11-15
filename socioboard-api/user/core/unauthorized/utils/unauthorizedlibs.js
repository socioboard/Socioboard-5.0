const moment = require('moment');
const config = require('config');

const db = require('../../../../library/sequelize-cli/models/index');
const AnalyticsServices = require('../../../../library/utility/analyticsServices');
const AuthorizeServices = require('../../../../library/utility/authorizeServices');
const SendEmailServices = require('../../../../library/utility/mailServices');
const CoreServices = require('../../../../library/utility/coreServices');
const Facebook = require('../../../../library/network/facebook');
const Google = require('../../../../library/network/google');
const UserLibs = require('../../libraries/userlibs');
const logger = require('../../../utils/logger');
var http = require("https");

const UserTeamAccount = require('../../../../library/mixins/userteamaccount');

const userDetails = db.user_details;
const userRewardsModel = db.user_rewards;
const userActivation = db.user_activations;
const teamInfo = db.team_informations;
const socialAccount = db.social_accounts;
const Operator = db.Sequelize.Op;

class UnAuthorizedUtils extends UserLibs {

    constructor() {
        super();
        Object.assign(this, UserTeamAccount);
        this.analyticsServices = new AnalyticsServices(config.get('analytics'));
        this.authorizeServices = new AuthorizeServices(config.get('authorize'));
        this.sendEmailServices = new SendEmailServices(config.get('mailService'));
        this.coreServices = new CoreServices(config.get('authorize'));
        this.fbConnect = new Facebook(config.get('facebook_api'));
        this.googleConnect = new Google(config.get('google_api'));
    }

    isUserRegister(userName, email) {
        return new Promise((resolve, reject) => {
            if (!userName && !email) {
                reject(new Error('Invalid Inputs'));
            }
            else {
                // Checking user existance
                return userDetails.findOne({
                    where: {
                        [Operator.or]: [{
                            user_name: userName
                        }, {
                            email: email
                        }]
                    },
                    attributes: ['user_id']
                })
                    .then((user) => {
                        var result = user ? { status: 'registered', userId: user.user_id } : { status: 'notRegistered' };
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    createUser(info) {
        return new Promise((resolve, reject) => {
            if (!info) {
                reject(new Error("Invalid Inputs"));
            } else {
                var userInfo = {};
                var team = null;
                var AccountDetails = {};
                var user = null;
                var fetchedUserId = null;

                return db.sequelize.transaction((t) => {
                    // Insert user informations
                    return userDetails.create({
                        user_name: info.user.userName,
                        email: info.user.email,
                        profile_url: info.user.profileUrl,
                        password: info.user.password,
                        first_name: info.user.firstName,
                        last_name: info.user.lastName,
                        date_of_birth: info.user.dateOfBirth,
                        profile_picture: info.user.profilePicture,
                        phone_code: info.user.phoneCode,
                        phone_no: info.user.phoneNo,
                        country: info.user.country,
                        time_zone: info.user.timeZone,
                        about_me: info.user.aboutMe,
                        is_admin_user: info.user.isAdminUser,
                        is_account_locked: false
                    }, { transaction: t })
                        // Insert the rewards details
                        .then((createdUser) => {
                            user = createdUser;
                            userInfo.user = createdUser;
                            fetchedUserId = user.user_id;
                            return userRewardsModel.create({
                                refered_by: info.rewards.referedBy,
                                referal_status: info.rewards.referalStatus,
                                is_socioboard_ads_enabled: info.rewards.isAdsEnabled,
                                eWallet: info.rewards.eWalletValue
                            }, { transaction: t });
                        })
                        // Update rewards with particular user
                        .then((rewards) => {
                            return user.setRewards(rewards, { transaction: t });
                        })
                        // Insert the activation status
                        .then(() => {
                            return userActivation.create({
                                activation_status: info.activations.activationStatus,
                                payment_status: info.activations.paymentStatus,
                                activate_2step_verification: info.activations.IsTwoStepVerify,
                                signup_type: info.activations.signupType,
                                account_expire_date: info.activations.expireDate,
                                user_plan: info.activations.userPlan,
                                payment_type: info.activations.paymentType
                            }, { transaction: t });
                        })
                        // Make a relationship for activation details with current user
                        .then((activationDetails) => {
                            userInfo.activations = activationDetails;
                            return user.setActivations(activationDetails, { transaction: t });
                        })
                        // Create a team
                        .then(() => {
                            return teamInfo.create({
                                team_name: config.get('applicationName'),
                                team_description: config.get('teamDescription'),
                                team_admin_id: user.user_id,
                                is_default_team: true
                            }, { transaction: t });
                        })
                        // Make a relationship for team with user
                        .then((teamDetails) => {
                            team = teamDetails;
                            return teamDetails.setUser(user, { transaction: t, through: { invitation_accepted: true, permission: 1, left_from_team: false, invited_by: 0 } });
                        })
                        // Add the social account if user logged in with facebook and gplus
                        .then(() => {
                            if (info.isSocialLogin && info.network == 1) {
                                return socialAccount.create({
                                    account_type: info.network,
                                    user_name: info.user.userName,
                                    first_name: info.user.firstName,
                                    last_name: info.user.lastName,
                                    email: info.user.email,
                                    social_id: info.user.userName,
                                    profile_pic_url: info.user.profilePicture,
                                    cover_pic_url: info.user.profilePicture,
                                    profile_url: info.user.profileUrl,
                                    access_token: info.accessToken,
                                    refresh_token: info.refreshToken,
                                    friendship_counts: info.user.friendCount,
                                    info: info.user.aboutMe,
                                    account_admin_id: user.user_id
                                }, { transaction: t });
                            }
                            return;
                        })
                        // Make a relationship for social account with team
                        .then((socialNetworkDetails) => {
                            if (info.isSocialLogin && info.network == 1) {
                                AccountDetails = socialNetworkDetails;
                                return socialNetworkDetails.setTeam(team, { transaction: t, through: { is_account_locked: false } });
                            }
                            return;
                        })
                        .then(() => {
                            if (info.isSocialLogin && info.network == 1) {
                                try {
                                    return user.setAccount(AccountDetails, { transaction: t });
                                } catch (error) {
                                    return;
                                }
                            }
                        })
                        .then(() => {
                            // create team report for that team
                            return this.createOrUpdateTeamReport(team.dataValues.team_id, '');
                        })
                        .then(() => {
                            resolve({ userId: fetchedUserId, userInfo: userInfo });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            }
        });
    }

    facebookSocialLogin(code) {
        var userInfo = {};
        var fbAccount = {};
        return new Promise((resolve, reject) => {
            if (!code) {
                reject({ error: true, message: "Invalid code" });
            } else {
                // Fetching Facebook access token of user
                return this.fbConnect.getUserAccessToken(code)
                    .then((accessToken) => {
                        // Fetching user profile details from Facebook
                        return this.fbConnect.userProfileInfo(accessToken);
                    })
                    .then((userDetails) => {
                        if (!userDetails)
                            throw new Error('Cant fetch facebook user details.');
                        else {
                            userInfo = {
                                "user": {
                                    "userName": userDetails.user_id,
                                    "email": userDetails.email,
                                    "password": this.coreServices.generatePassword(),
                                    "firstName": userDetails.first_name,
                                    "lastName": userDetails.last_name,
                                    "dateOfBirth": userDetails.birthday ? moment(userDetails.birthday, ["MM-DD-YYYY", "YYYY-MM-DD"]) || moment("01-01-1970", ["MM-DD-YYYY", "YYYY-MM-DD"]) : "1970-01-01",
                                    "profilePicture": `https://graph.facebook.com/${userDetails.user_id}/picture?type=large`,
                                    "phoneCode": "0",
                                    "phoneNo": 0,
                                    "country": "NA",
                                    "timeZone": "NA",
                                    "aboutMe": "",
                                    "isAdminUser": false,
                                    "friendCount": userDetails.friend_count
                                },
                                "rewards": {
                                    "eWalletValue": 0,
                                    "isAdsEnabled": false,
                                    "referedBy": "NA",
                                    "referalStatus": false
                                },
                                "activations": {
                                    "activationStatus": 1,
                                    "paymentStatus": 0,
                                    "IsTwoStepVerify": false,
                                    "signupType": 2,
                                    "userPlan": config.get('user_base_plan'),
                                    "expireDate": moment.utc().add(1, 'months')
                                },
                                "isSocialLogin": true,
                                "network": "1",
                                "accessToken": userDetails.access_token,
                                "refreshToken": userDetails.access_token
                            };
                            // Checking user already existed or not.
                            return this.isUserRegister(userDetails.user_id, userDetails.email);
                        }
                    })
                    .then((result) => {
                        if (result.status == 'registered') {
                            return result;
                        } else {
                            // Adding user
                            return this.createUser(userInfo);
                        }
                    })
                    .then((userDetails) => {
                        var userId = userDetails.userId ? userDetails.userId : userDetails.user.user_id ? userDetails.user.user_id : null;
                        return this.getUserAccessToken(userId);
                    })
                    .then((result) => {
                        fbAccount = result;
                        if (result.user.is_account_locked) {
                            reject({ error: true, message: "Account has been locked." });
                        } else {
                            // if we delete our main account we can't get the account data
                            // which throw an error of problem in getting social account, 'Coz we can't able to update that profile data.
                            return socialAccount.findOne({
                                where: {
                                    account_type: 1,
                                    account_admin_id: result.user.user_id,
                                },
                                attributes: ['account_id', 'access_token'],
                                raw: true
                            })
                                .then((account) => {
                                    if (account) {
                                        return this.fbConnect.getFbProfileStats(account.access_token)
                                            .then((updateDetails) => {
                                                return this.createOrUpdateFriendsList(account.account_id, updateDetails);
                                            })
                                            .then(() => {
                                                resolve(fbAccount);
                                            })
                                            .catch((error) => {
                                                throw error;
                                            });
                                    }
                                    else {
                                        throw new Error('problem in getting social account');
                                    }
                                })
                                .catch((error) => {
                                    throw error;
                                });
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    googleSocialLogin(code) {
        var userInfo = {};
        logger.info(`Codes : ${code}`);

        return new Promise((resolve, reject) => {
            if (!code) {
                reject({ error: true, message: "Invalid code" });
            } else {
                // Fetching Google access token of user
                return this.googleConnect.getGoogleAccessToken(code, config.get('google_api.redirect_url'))
                    .then((tokens) => {
                        logger.info(`tokens : ${tokens}`);
                        return this.googleConnect.getGoogleProfileInformation(tokens);
                    })
                    .then((profileDetails) => {
                        if (!profileDetails)
                            throw new Error('Cant fetch google user details.');
                        else {
                            logger.info(`profileDetails : ${profileDetails}`);
                            var birthdate = moment(profileDetails.birthday, ["MM-DD-YYYY", "YYYY-MM-DD"]);
                            if (profileDetails.birthday == '') {
                                birthdate = moment("01-01-1970", ["MM-DD-YYYY", "YYYY-MM-DD"]);
                            }
                            userInfo = {
                                "user": {
                                    "userName": profileDetails.id,
                                    "email": profileDetails.email,
                                    "password": this.coreServices.generatePassword(),
                                    "firstName": profileDetails.firstName,
                                    "lastName": profileDetails.lastName,
                                    "dateOfBirth": birthdate,
                                    "profilePicture": profileDetails.profilePicUrl,
                                    "phoneCode": "0",
                                    "phoneNo": 0,
                                    "country": "NA",
                                    "timeZone": "NA",
                                    "aboutMe": "",
                                    "isAdminUser": false
                                },
                                "rewards": {
                                    "eWalletValue": 0,
                                    "isAdsEnabled": false,
                                    "referedBy": "NA",
                                    "referalStatus": false
                                },
                                "activations": {
                                    "activationStatus": 1,
                                    "paymentStatus": 0,
                                    "IsTwoStepVerify": false,
                                    "signupType": 1,
                                    "userPlan": config.get('user_base_plan'),
                                    "expireDate": moment.utc().add(1, 'months')
                                },
                                "isSocialLogin": true,
                                "network": "8",
                                "accessToken": profileDetails.access_token,
                                "refreshToken": profileDetails.refresh_token
                            };
                            // Checking user already existed or not.
                            return this.isUserRegister(profileDetails.id, profileDetails.email);
                        }
                    })
                    .then((result) => {
                        if (result.status == 'registered') {
                            return result;
                        } else {
                            // Adding user.
                            return this.createUser(userInfo);
                        }
                    })
                    .then((userDetails) => {
                        var userId = userDetails.userId ? userDetails.userId : userDetails.user.user_id ? userDetails.user.user_id : null;
                        // Making a secrete token for user
                        return this.getUserAccessToken(userId);
                    })
                    .then((result) => {
                        if (result.user.is_account_locked) {
                            reject({ error: true, message: "Account has been locked." });
                        } else {
                            resolve(result);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    changeUserPlanAsBasic(userId) {

        return new Promise((resolve, reject) => {
            if (!userId && userId != 0) {
                reject({ message: 'Invalid UserId', error: true });
            } else {
                // Locking all social accounts
                return this.lockUserSocialAccounts(userId)
                    .then((result) => {
                        if (!result.success)
                            throw new Error('Cant lock the accounts');
                        return this.getUserDetails(userId)
                            .then((userDetails) => {
                                return userDetails;
                            })
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .then((userInformation) => {
                        if (!userInformation)
                            throw new Error('Cant able to find the user');
                        else {
                            // Updating user plan to Basic
                            return userInformation.Activations.update({
                                last_login: moment(),
                                user_plan: 0,
                                account_expire_date: moment.utc().add(1, 'months'),
                            });
                        }
                    })
                    .then(() => {
                        resolve({ status: 'success' });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    appLogin(userNameOrEmail, password) {
        return new Promise((resolve, reject) => {
            if (!userNameOrEmail || !password) {
                reject(new Error("Invalid Inputs"));
            } else {
                // checking user Existance
                return userDetails.findOne({
                    where: {
                        [Operator.or]: [{
                            user_name: userNameOrEmail
                        }, {
                            email: userNameOrEmail
                        }],
                        password: password
                    },
                    attributes: ['user_id', 'email', 'phone_no', 'first_name', 'last_name', 'profile_picture', 'is_account_locked', 'is_admin_user'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'last_login', 'user_plan', 'payment_type', 'account_expire_date', 'signup_type', 'activation_status', 'activate_2step_verification']
                    }
                    ]
                })
                    .then((user) => {
                        resolve(user);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }


        });
    }

    sendActivationMail(userInfo) {
        return new Promise((resolve, reject) => {
            if (!userInfo) {
                reject({ error: true, message: 'Invalid UserInfo' });
            } else {
                return this.getPlanDetails(userInfo.Activations.user_plan)
                    .then((planDetails) => {
                        if (!planDetails) {
                            reject({ error: true, message: 'Invalid plan' });
                        }
                        else {

                            var activationLink = `${config.get('user_socioboard.host_url')}/v1/verifyEmail?email=${userInfo.email}&activationToken=${userInfo.Activations.email_validate_token}`;
                            var htmlContent = this.sendEmailServices.template.registration.replace('[FirstName]', `${userInfo.first_name}`).replace('[AccountType]', planDetails.plan_name).replace('[ActivationLink]', activationLink);
                            var emailDetails = {
                                "subject": config.get('mailTitles.activation_link'),
                                "toMail": userInfo.email,
                                "htmlContent": htmlContent
                            };
                            this.sendEmailServices.sendMails(config.get('mailService.defaultMailOption'), emailDetails)
                                .then((result) => {
                                    logger.info(`Activation mail status: ${JSON.stringify(result)}`);
                                })
                                .catch((error) => {
                                    logger.error(`Activation mail status: ${JSON.stringify(error)}`);
                                });
                            resolve({ status: 'success' });
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    sendOTP(userInfo) {
        return new Promise((resolve, reject) => {
            if (!userInfo) {
                reject({ error: true, message: 'Invalid UserInfo' });
            } else {
                var OTP = this.coreServices.getRandomNumbersByLength(12);
                var newExpireDate = moment().add(10, "minutes");

                return this.getUserDetails(userInfo.userId)
                    .then((user) => {
                        var otpCondition = user.Activations.activate_2step_verification;
                        var userPhoneNumber = user.phone_no;
                        // validating phone number
                        if (Number(userPhoneNumber) != 0) {
                            var phoneCode = user.phone_code;
                            return user.Activations.update({
                                otp_token: String(OTP),
                                otp_token_expire: newExpireDate
                            })
                                .then((result) => {
                                    // check condition on which it should send OTP
                                    if (otpCondition == 1) {
                                        var mobileOtp = OTP.slice(6, 12);
                                        return this.sendOtpToMobile(mobileOtp, phoneCode, userPhoneNumber)
                                            .then(() => {
                                                resolve('Mobile OTP sent successfully, Please verify it');
                                            })
                                            .catch((error) => {
                                                reject("can't able to send Mobile OTP message.");
                                            });
                                    }
                                    if (otpCondition == 2) {
                                        var mobileOtp = OTP.slice(6, 12);
                                        this.sendOtpToMobile(mobileOtp, phoneCode, userPhoneNumber);

                                        var mailOtp = OTP.slice(0, 6);
                                        return this.sendOtpToEmail(mailOtp, userInfo.email);
                                    }
                                }).then(() => {
                                    resolve(otpCondition == 1 ? "Mobile OTP sent successfully, Please verify it" : "Mobile & Email OTP sent successfully, Please verify it");
                                })
                                .catch((error) => { console.log(error); throw error; })
                        } else {
                            reject('Please, Update the phone Number.');
                        }
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    sendOtpToMobile(otp, country, mobileNumber) {
        return new Promise((resolve, reject) => {
            if (!otp || !mobileNumber || mobileNumber == 0 || country == 0 || !country) {
                reject(new Error('Invalid Inputs to send Mobile OTP'));
            }
            else {

                var options = {
                    "method": "POST",
                    "hostname": "api.msg91.com",
                    "port": null,
                    "path": "/api/v2/sendsms?country=91",
                    "headers": {
                        "authkey": config.get('mobileOtp.authkey'),
                        "content-type": "application/json"
                    }
                };

                var req = http.request(options, function (res) {
                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function () {
                        var body = Buffer.concat(chunks);
                        logger.info(body.toString());
                    });
                });

                req.write(JSON.stringify({
                    sender: config.get('mobileOtp.sender'),
                    route: config.get('mobileOtp.route'),
                    country: country,
                    sms:
                        [{ message: `Your Socioboard 2-way OTP is: ${otp}`, to: [mobileNumber] }]
                }));
                req.end();
                resolve();
            }
        })
    }

    sendOtpToEmail(otp, email) {
        return new Promise((resolve, reject) => {
            if (!otp || !email) {
                reject(new Error('Invalid Inputs to send Email OTP'));
            } else {
                var htmlContent = this.sendEmailServices.template.mail_otp.replace('[OTP]', otp);
                var emailDetails = {
                    "subject": config.get('mailTitles.OTP_title'),
                    "toMail": email,
                    "htmlContent": htmlContent
                };
                this.sendEmailServices.sendMails(config.get('mailService.defaultMailOption'), emailDetails)
                    .then((result) => {
                        logger.info(`OTP mail status: ${JSON.stringify(result)}`);
                    })
                    .catch((error) => {
                        logger.error(`OTP mail status: ${JSON.stringify(error)}`);
                    });
                resolve();
            }
        })
    }



    twoStepLoginValidate(email, emailOtp, mobileOtp) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject(new Error('Invalid Inputs'));
            } else {
                return this.getUserDetailsByEmail(email)
                    .then((user) => {
                        // condition for checking what option is selected by user
                        // for mobile OTP
                        if (user.Activations.activate_2step_verification == 1) {
                            if (!email || !mobileOtp)
                                throw new Error("As per your 2-way request you need to enter Mobile OTP");
                            else {
                                var mobOtp = user.Activations.otp_token.slice(6, 12);
                                // validating mobile otp
                                if (mobileOtp == Number(mobOtp)) {
                                    return this.getUserAccessToken(user.user_id)
                                        .then((userInfo) => {
                                            resolve({ user: userInfo.user, accessToken: userInfo.accessToken });
                                        })
                                        .catch((error) => {
                                            throw new Error('Error in creating AccessToken');
                                        })
                                }
                                else
                                    throw new Error("OTP's are not matching, please try again");
                            }
                        }
                        // for Mobile and Email OTP
                        if (user.Activations.activate_2step_verification == 2) {
                            //  condition for checking inputs
                            if (!email || !emailOtp || !mobileOtp)
                                throw new Error("As per your 2-way request you need to enter Email & Mobile OTP's");
                            else {
                                // Validate Mobile  and Email OTP

                                if (moment(user.Activations.otp_token_expire).add(10, "minutes") < moment().subtract(5, "hours").subtract(30, "minutes"))
                                    throw new Error('OTP got expired');
                                else {
                                    var mailOtp = user.Activations.otp_token.slice(0, 6);
                                    var mobOtp = user.Activations.otp_token.slice(6, 12);
                                    // validating mail otp and mobile otp
                                    if (mailOtp == Number(emailOtp) && mobOtp == Number(mobileOtp)) {
                                        return this.getUserAccessToken(user.user_id)
                                            .then((userInfo) => {
                                                resolve({ user: userInfo.user, accessToken: userInfo.accessToken });
                                            })
                                            .catch((error) => {
                                                throw new Error('Error in creating AccessToken');
                                            })
                                    }
                                    else
                                        throw new Error("OTP's are not matching, please try again");
                                }
                            }
                        }
                    })
                    .catch((error) => { console.log(error); reject(error); })
            }
        })
    }

    sendForgotPasswordMail(userInfo) {
        return new Promise((resolve, reject) => {
            if (!userInfo) {
                reject({ error: true, message: 'Invalid UserInfo' });
            } else {
                // Creating an activation Link
                var activationLink = `${config.get('user_socioboard.mail_url')}/verifyPasswordToken?email=${userInfo.email}&activationToken=${userInfo.Activations.forgot_password_validate_token}`;
                // Appending activation link in Mail content
                var htmlContent = this.sendEmailServices.template.forgotpassword.replace('[FirstName]', `${userInfo.first_name}`).replace('[ActivationLink]', activationLink);
                var emailDetails = {
                    "subject": config.get('mailTitles.forgot_password_request'),
                    "toMail": userInfo.email,
                    "htmlContent": htmlContent
                };
                this.sendEmailServices.sendMails(config.get('mailService.defaultMailOption'), emailDetails)
                    .then((result) => {
                        logger.info(`Forgot password mail status: ${JSON.stringify(result)}`);
                    })
                    .catch((error) => {
                        logger.error(`Forgot password mail status: ${JSON.stringify(error)}`);
                    });
                resolve({ status: 'success' });
            }
        });
    }

    changePassword(email, oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            if (!email || !oldPassword || !newPassword) {
                reject(new Error("Invalid Inputs"));
            } else if (oldPassword == newPassword) {
                reject(new Error("New password shouldn't be equal to previous password!"));
            } else {
                // Checking user Existance
                return userDetails.findOne({
                    where: {
                        email: email,
                    },
                    attributes: ['user_id', 'password']
                })
                    .then(function (user) {
                        if (!user)
                            throw new Error('Sorry! Email not registered.');
                        // Comparing the current and entered Passwords
                        if (user.password !== oldPassword)
                            throw new Error('Sorry! Wrong Password.');
                        // Updating user with new Password
                        return userDetails.update({ password: newPassword }, {
                            where: {
                                user_id: user.user_id
                            }
                        });
                    })
                    .then(function () {
                        resolve(`Success!`);
                    }).catch(function (error) {
                        reject(error);
                    });
            }
        });
    }

    resetPassword(email, newPassword) {
        return new Promise((resolve, reject) => {
            if (!email || !newPassword) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking user Existance
                return userDetails.findOne({
                    where: {
                        email: email,
                    },
                    attributes: ['user_id']
                })
                    .then(function (user) {
                        if (!user)
                            throw new Error('Sorry! Email not registered.');
                        // Updating user with new Password
                        return userDetails.update({ password: newPassword }, {
                            where: {
                                user_id: user.user_id
                            }
                        });
                    })
                    .then(function () {
                        resolve(`Success!`);
                    }).catch(function (error) {
                        reject(error);
                    });
            }
        });
    }

    forgotPassword(email) {
        var FetchedUserDetails = '';
        return new Promise((resolve, reject) => {
            if (!email) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking user Existance
                return userDetails.findOne({
                    where: {
                        email: email
                    },
                    attributes: ['user_id', 'first_name', 'email', 'user_activation_id'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'forgot_password_validate_token', 'forgot_password_token_expire']
                    }]
                })
                    .then((user) => {
                        FetchedUserDetails = user;
                        if (!user)
                            throw new Error('Sorry! Email not registered.');
                        var newExpireDate = moment().add(1, 'days');
                        var newForgotVerificationToken = this.coreServices.getGuid();
                        return userActivation.update({
                            forgot_password_validate_token: newForgotVerificationToken,
                            forgot_password_token_expire: newExpireDate
                        }, {
                            where: {
                                id: user.user_activation_id
                            }
                        });
                    })
                    .then(() => {
                        // Fetching updated user details
                        return this.getUserDetails(FetchedUserDetails.user_id);
                    })
                    .then((userInfo) => {
                        // Sending mail to reset Pasword
                        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'phpdev' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'apidevelopment') {
                            return this.sendForgotPasswordMail(userInfo)
                                .then(() => {
                                    return `Success! Please check your email for reset your password!`;
                                })
                                .catch((error) => {
                                    throw error;
                                    //throw new Error("Cant able to send forgot password mail.");
                                });
                        }
                        else {
                            var activationLink = `${config.get('user_socioboard.mail_url')}/v1/verifyPasswordToken?email=${userInfo.email}&activationToken=${userInfo.Activations.forgot_password_validate_token}`;
                            return `Success! Please check your email for reset your password, New activationLink - ${activationLink} !`;
                        }
                    })
                    .then(function (message) {
                        resolve(message);
                    }).catch(function (error) {
                        reject(error);
                    });
            }

        });
    }

    verifyPasswordToken(email, activationToken) {
        var FetchedUserDetails = null;
        return new Promise((resolve, reject) => {
            if (!email || !activationToken) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking user Existance with email
                return userDetails.findOne({
                    where: {
                        email: email
                    },
                    attributes: ['user_id', 'first_name', 'email', 'user_activation_id'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'forgot_password_validate_token', 'forgot_password_token_expire', 'account_expire_date', 'activation_status', 'user_plan']
                    }]
                })
                    .then((user) => {
                        FetchedUserDetails = user;
                        if (!user)
                            throw new Error('Sorry! Email not registered.');
                        else {
                            var expireDate = user.Activations.forgot_password_token_expire;

                            // Checking Token got expired or not
                            if (moment(expireDate).isBefore(moment.utc())) {
                                // Token got expired, making new Token
                                var newExpireDate = moment().add(1, 'days');
                                var newPasswordVerificationToken = this.coreServices.getGuid();
                                return userActivation.update({
                                    forgot_password_validate_token: newPasswordVerificationToken,
                                    forgot_password_token_expire: newExpireDate
                                }, { where: { id: user.user_activation_id } })
                                    .then(() => {
                                        return this.getUserDetails(FetchedUserDetails.user_id);
                                    })
                                    .then((userInfo) => {
                                        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'apidevelopment') {
                                            return this.sendForgotPasswordMail(userInfo)
                                                .then(() => {
                                                    return `Token expired, please check your email for new token!`;
                                                })
                                                .catch((error) => {
                                                    throw new Error("Cant able to send forgot password mail.");
                                                });
                                        }
                                        else {
                                            var activationLink = `${config.get('user_socioboard.mail_url')}/v1/verifyPasswordToken?email=${userInfo.email}&activationToken=${userInfo.Activations.forgot_password_validate_token}`;
                                            return `Token expired, New activationLink - ${activationLink} ! `;
                                        }
                                    });
                            }
                            // Validating Token with existing token
                            else if (user.Activations.forgot_password_validate_token === activationToken) {
                                return "success";
                            }
                            else {
                                return "Invalid verification token!";
                            }
                        }

                    })
                    .then((message) => {
                        resolve(message);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }


        });
    }

    verifyEmail(email, activationToken) {
        var fetchedUserId = '';
        return new Promise((resolve, reject) => {
            if (!email || !activationToken) {
                reject(new Error("Invalid Inputs"));
            } else {

                // Checking user existance with email
                return userDetails.findOne({
                    where: {
                        email: email
                    },
                    attributes: ['user_id', 'first_name', 'email', 'user_activation_id'],
                    include: [{
                        model: userActivation,
                        as: "Activations",
                        where: { id: db.Sequelize.col('user_activation_id') },
                        attributes: ['id', 'signup_type', 'email_validate_token', 'email_token_expire', 'account_expire_date', 'activation_status', 'user_plan']
                    }]
                })
                    .then((user) => {
                        if (!user) {
                            throw new Error('Sorry! Email not registered.');
                        }
                        if (user.Activations.signup_type != 0) {
                            return `${user.email} isn't signup manually!`;
                        }
                        if (user.Activations.activation_status === 1) {
                            return `${user.email} already activated!`;
                        }
                        if (user.Activations.email_validate_token === activationToken) {
                            fetchedUserId = user.user_id;
                            var expireDate = user.Activations.email_token_expire;


                            logger.info(`${email} expired date : ${expireDate} and now : ${moment.utc()} `);

                            logger.info(`${email} Is Expired : ${moment(expireDate).isBefore(moment.utc())}`);

                            if (moment(expireDate).isBefore(moment.utc())) {
                                // Token expired, making new Token and sending it to user
                                var newExpireDate = moment().add(1, 'days');
                                var newEmailVerificationToken = this.coreServices.getGuid();
                                return userActivation.update({
                                    email_validate_token: newEmailVerificationToken,
                                    email_token_expire: newExpireDate
                                }, { where: { id: user.user_activation_id } })
                                    .then(() => {
                                        return this.getUserDetails(fetchedUserId)
                                            .then((userInfo) => {
                                                if (userInfo) {
                                                    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'apidevelopment') {
                                                        return this.sendActivationMail(userInfo)
                                                            .then(() => { reject(new Error(`Token expired, please check your email for new token!`)); })
                                                            .catch((error) => { throw error; });
                                                    }
                                                    else {
                                                        var activationLink = `${config.get('user_socioboard.mail_url')}/v1/verifyEmail?email=${userInfo.email}&activationToken=${userInfo.Activations.email_validate_token}`;
                                                        reject(new Error(`Token expired on ${user.Activations.email_token_expire}, New activationLink - ${activationLink} !`));
                                                    }
                                                }
                                                else {
                                                    throw new Error('Sorry! Cant able to found user.');
                                                }
                                            })
                                            .catch((error) => {
                                                throw new Error('Something went wrong.');
                                            });
                                    })
                                    .catch((error) => {
                                        throw new Error('Something went wrong.');
                                    });
                            }
                            else {
                                // Making user Activated
                                return userActivation.update({ activation_status: 1, },
                                    { where: { id: user.user_activation_id } })
                                    .then(() => { return "success"; })
                                    .catch((error) => {
                                        throw new Error('Something went wrong.');
                                    });
                            }
                        }
                        else {
                            reject(new Error("Invalid verification token!"));
                        }
                    })
                    .then((message) => {
                        resolve(message);
                    })
                    .catch((error) => {
                        reject(error);
                    });

            }


        });
    }

    getActivationLink(email) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject(new Error('Invalid Inputs'));
            }
            else {
                // Checking and getting user details with email
                return this.getUserDetailsByEmail(email)
                    .then((userDetails) => {
                        if (!userDetails)
                            throw new Error('User didnt registered yet!');
                        else if (userDetails.Activations.activation_status == 1)
                            throw new Error('Email already activated, please login with creds');
                        else
                            resolve(userDetails);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    checkUserNameAvailability(userName) {
        return new Promise((resolve, reject) => {
            if (!userName) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking userName existance
                return userDetails.findOne({
                    where: {
                        user_name: userName,
                    }
                }).then((result) => {
                    if (!result)
                        resolve("success");
                    else
                        reject(new Error('User name is already exists.'));

                }).catch((error) => {
                    reject(error);
                });
            }
        });
    }

    checkEmailAvailability(email) {
        return new Promise((resolve, reject) => {
            if (!email) {
                reject(new Error('Invalid Inputs'));
            } else {
                // Checking user email existance
                return userDetails.findOne({
                    where: {
                        email: email,
                    }
                }).then((result) => {
                    if (!result)
                        resolve("success");
                    else
                        reject(new Error('Email is already exists.'));

                }).catch((error) => {
                    reject(error);
                });
            }
        });
    }

}





module.exports = UnAuthorizedUtils;