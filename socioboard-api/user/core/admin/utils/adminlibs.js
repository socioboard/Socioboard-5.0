const moment = require('moment');
const config = require('config');
const db = require('../../../../library/sequelize-cli/models/index');

const userActivation = db.user_activations;
const userDetails = db.user_details;
const userPayments = db.user_payments;
const coupons = db.coupons;
const applicationInformations = db.application_informations;
const Operator = db.Sequelize.Op;

const AppUserStatsModel = require('../../../../library/mongoose/models/appuserstats');
const analyticsServices = require('../../../../library/utility/analyticsServices');

class AdminUtils {

    constructor() {
        this.AnalyticsServices = new analyticsServices(config.get('analytics'));
    }

    findUserStats() {
        return new Promise((resolve, reject) => {
            // Finding Application user statistics 
            userDetails.findOne({
                attributes: [
                    [db.Sequelize.fn("sum", db.Sequelize.where(db.Sequelize.col('user_id'), { [Operator.ne]: null })), "totalUsers"],
                    [db.Sequelize.fn("sum", db.Sequelize.where(db.Sequelize.col('is_account_locked'), 1)), "lockedUsers"],
                ],
                include: [{
                    model: userActivation,
                    as: 'Activations',
                    attributes: [
                        [db.Sequelize.fn("sum", db.Sequelize.where(db.Sequelize.col('user_plan'), { [Operator.ne]: 0 })), "paidPlanUserCount"],
                        [db.Sequelize.fn("sum", db.Sequelize.where(db.Sequelize.col('user_plan'), 0)), "freePlanUserCount"],
                        [db.Sequelize.fn("sum", db.Sequelize.where(db.Sequelize.col('last_login'), { [Operator.gt]: moment.utc().add(-7, 'days').format("YYYY-MM-DD") })), "activeUsers"]

                    ],
                }]
            })
                .then((result) => {
                    var response = result.toJSON();
                    if (response.totalUsers) {
                        var stats = {
                            totalUsers: response.totalUsers,
                            paidUsers: response.Activations.paidPlanUserCount,
                            unpaidUsers: response.Activations.freePlanUserCount,
                            activeUsers: response.Activations.activeUsers,
                            inActiveUsers: response.totalUsers - response.Activations.activeUsers,
                            lockedUsers: response.lockedUsers,
                        };
                        return stats;
                    } else {
                        throw new Error("Something went wrong!");
                    }
                })
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    findTodayUserStats() {
        return new Promise((resolve, reject) => {
            // Finding user statistics
            return this.findUserStats()
                .then((response) => {
                    // Adding filter to Today
                    response.month = Number(moment().format('MM'));
                    response.year = Number(moment().format('YYYY'));
                    if (response.totalUsers) {
                        var appMemberStatsModel = new AppUserStatsModel();
                        // Inserting into mongo DB 
                        appMemberStatsModel.insertMany(response)
                            .then((result) => {
                                resolve(result);
                            }).catch((error) => {
                                throw error;
                            });
                    } else
                        reject(new Error("Something went wrong!"));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getAppUserInfo() {
        var counts = {};
        return new Promise((resolve, reject) => {
            return this.findUserStats()
                .then((response) => {
                    counts = response;
                    var appUserStatsModel = new AppUserStatsModel();
                    // Fetching application users for a month range from mongo DB
                    return appUserStatsModel.getMonthlyStats();
                })
                .then((response) => {
                    resolve({ counts: counts, monthlyStats: response });
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getMonthlyUserStats(month, year) {
        return new Promise((resolve, reject) => {
            if (!month || !year) {
                reject(new Error("Invalid Inputs"));
            } else {
                var appUserStatsModel = new AppUserStatsModel();
                // Fetching application user for a specified month from mongo DB
                return appUserStatsModel.getParticularMonth(month, year)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    filterUserInfo(conditions, activationConditions, pageId) {
        return new Promise((resolve, reject) => {
            if (!conditions)
                conditions = {};
            if (!activationConditions)
                activationConditions = {};

            if (!pageId)
                reject(new Error("Invalid Inputs"));
            else {
                // Making offset/skip value
                var offset = (pageId - 1) * config.get('perPageLimit');
                // Fetching users from DB with conditions
                return userDetails.findAll({
                    where: conditions,
                    attributes: ['user_id', 'first_name', 'last_name', 'profile_picture', 'email', 'date_of_birth', 'phone_no', 'country', 'is_admin_user', 'is_account_locked'],
                    include: [{
                        model: userActivation,
                        as: 'Activations',
                        where: activationConditions,
                        attributes: ['payment_type', 'payment_status', 'signup_type', 'user_plan', 'created_date', 'activate_2step_verification', 'account_expire_date', 'last_login'],
                    }],
                    offset: offset,
                    limit: config.get('perPageLimit'),
                    raw: true
                })
                    .then((fulldetails) => {
                        var userProfileInfo = [];
                        // Arranging the fetails in a structural format 
                        fulldetails.map(user => {
                            var info = {
                                AccountId: user.user_id,
                                Email: user.email,
                                FirstName: user.first_name,
                                LastName: user.last_name,
                                PlanType: user["Activations.user_plan"],
                                RegisteredDate: user["Activations.created_date"],
                                LastLoginDate: user["Activations.last_login"],
                                PaymentStatus: user["Activations.payment_status"],
                                ExpireDate: user["Activations.account_expire_date"],
                                SignUpType: user["Activations.signup_type"],
                                TwoStepLogin: user["Activations.activate_2step_verification"],
                                ProfilePicture: user.profile_picture,
                                DateOfBirth: user.date_of_birth,
                                Mobile: user.phone_no,
                                Country: user.country
                            };
                            userProfileInfo.push(info);
                        });
                        resolve(userProfileInfo);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getFilteredUsers(filterType, planId, paymentStatus, nameOrEmail, pageId) {
        return new Promise((resolve, reject) => {
            switch (Number(filterType)) {
                case 0: // Without Filter     
                    return this.filterUserInfo(null, null, pageId)
                        .then((result) => { resolve(result); })
                        .catch((error) => reject(error));
                case 1:  // userPlan
                    if (!planId) {
                        reject(new Error("Invalid Inputs"));
                    } else {
                        return this.filterUserInfo(null, { user_plan: planId }, pageId)
                            .then((result) => { resolve(result); })
                            .catch((error) => reject(error));
                    }
                    break;
                case 2: // paymentStatus
                    if (!paymentStatus) {
                        reject(new Error("Invalid Inputs"));
                    } else {
                        return this.filterUserInfo(null, { payment_status: paymentStatus }, pageId)
                            .then((result) => { resolve(result); })
                            .catch((error) => reject(error));
                    }
                    break;
                case 3: // NameOrEmail
                    if (!nameOrEmail) {
                        reject(new Error("Invalid Inputs"));
                    } else {
                        var lookupValue = nameOrEmail.toLowerCase();
                        return this.filterUserInfo({
                            where:
                                db.Sequelize.or(
                                    db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('email')), 'LIKE', '%' + lookupValue + '%'),
                                    db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('first_name')), 'LIKE', '%' + lookupValue + '%'),
                                    db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('last_name')), 'LIKE', '%' + lookupValue + '%')
                                )
                        }, null, pageId)
                            .then((result) => { resolve(result); })
                            .catch((error) => reject(error));
                    }
                    break;
                default:
                    return this.filterUserInfo(null, null, pageId)
                        .then((result) => { resolve(result); })
                        .catch((error) => reject(error));
            }
        });
    }

    getUserPaymentHistory(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching user payments 
                return userPayments.findAll({
                    where: { user_id: userId, payment_status: 1 }
                })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    fetchUser(userId) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching user Details from userDetails amd Activations
                return userDetails.findOne({
                    where: {
                        user_id: userId
                    },
                    attributes: ['user_id', 'is_account_locked'],
                    include: [{
                        model: userActivation,
                        as: 'Activations',
                        attributes: ['id', 'user_plan', 'activate_2step_verification', 'account_expire_date']
                    }]
                })
                    .then((result) => {
                        if (!result) {
                            throw new Error("No user details found or access denied!");
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

    getRecentSignup(filterType, since, untill, pageId) {
        return new Promise((resolve, reject) => {
            if (!filterType) {
                reject(new Error("Please select a valid filterType(1-5)"));
            } else {
                switch (Number(filterType)) {
                    case 1:
                        since = moment().startOf('day');
                        untill = moment().endOf('day');
                        break;
                    case 2:
                        since = moment().subtract(1, "days").startOf('day');
                        untill = moment().subtract(1, "days").endOf('day');
                        break;
                    case 3:
                        since = moment().startOf('week');
                        untill = moment().endOf('day');
                        break;
                    case 4:
                        since = moment().startOf('month');
                        untill = moment().endOf('day');
                        break;
                    case 5:
                        if (!since || !untill)
                            throw new Error('Start date and end date are compulsary for this filter.');
                        else if (since > untill)
                            throw new Error("start date should be less than end date");
                        else
                            since = moment(since).startOf('day');
                        untill = moment(untill).endOf('day');
                        break;
                    default:
                        throw new Error("please choose valid filter type");
                }
                var dateCondition = {
                    created_date: {
                        [Operator.between]: [since, untill]
                    }
                };
                // Fetching user information with Filters
                return this.filterUserInfo(null, dateCondition, pageId)
                    .then((userProfileInfo) => { resolve({ count: userProfileInfo.length, accounts: userProfileInfo }); })
                    .catch((error) => reject(error));
            }
        });
    }

    updateUserlock(userId, options) {
        return new Promise((resolve, reject) => {
            if (!userId || !(options == 0 || options == 1)) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching user 
                return this.fetchUser(userId)
                    .then((result) => {
                        // Updating user to either lock/unlock
                        return result.update({
                            is_account_locked: options
                        });
                    })
                    .then(() => {
                        resolve(options == 0 ? "User unlocked!" : "User locked!");
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    updatePlanForTrail(userId, planId, dayCount) {
        return new Promise((resolve, reject) => {
            if (!userId || !planId || !dayCount) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that the requested plan is available or not
                return applicationInformations.findOne({
                    where: { plan_id: planId }
                })
                    .then((result) => {
                        if (!result)
                            throw new Error("Sorry, Specified plan is not available currently");
                        else
                            // Fething user to whome you want to update
                            return this.fetchUser(userId);
                    })
                    .then((result) => {
                        if (dayCount > config.get('maximumTrialPeriod')) {
                            throw new Error(`Cant able to add trial period more than ${config.get('maximumTrialPeriod')} days`);
                        } else {
                            // Updating user with new plam
                            return userActivation.update({
                                user_plan: planId,
                                account_expire_date: moment.utc().add(dayCount, 'days')
                            }, { where: { id: result.Activations.id } });
                        }
                    })
                    .then(() => {
                        resolve("Plan has been updated!");
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    updateTwoStepOptions(userId, option) {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Fetching user
                return this.fetchUser(userId)
                    .then((result) => {
                        if (option == 1 || option == 0) {
                            // Updating user with new 2step option
                            return userActivation.update({
                                activate_2step_verification: option,
                            }, { where: { id: result.Activations.id } });
                        } else {
                            throw new Error("Options should either 0 or 1");
                        }
                    })
                    .then(() => {
                        resolve("Two step verification updated!");
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    getPackages() {
        return new Promise((resolve, reject) => {
            // Fetching all packages
            return applicationInformations.findAll({})
                .then((packages) => {
                    resolve(packages);
                }).catch((error) => {
                    reject(error);
                });
        });
    }

    addPackage(packageData) {
        return new Promise((resolve, reject) => {
            if (!packageData) {
                reject(new Error("Invalid Inputs"));
            } else {
                var requestBody = packageData.package;
                // Checking the package is already exists or not
                return applicationInformations.findOne({
                    attributes: [
                        [db.Sequelize.fn('max', db.Sequelize.col('plan_id')), "MaximumPlanId"]
                    ],
                    where: { plan_name: { [Operator.ne]: String(requestBody.plan_name) } },
                })
                    .then((packageAvailable) => {

                        var maixmumPackageId = packageAvailable.toJSON().MaximumPlanId;
                        if (!packageAvailable)
                            throw new Error("Package is already available with same name.");
                        else {
                            var packageObject = requestBody;
                            var plans = {
                                plan_id: Number(maixmumPackageId) + 1,
                                plan_name: packageObject.plan_name,
                                account_count: Number(packageObject.account_count),
                                plan_price: Number(packageObject.plan_price),
                                member_count: Number(packageObject.member_count),
                                available_network: packageObject.available_network,
                                browser_extension: packageObject.browser_extension,
                                scheduling_posting: packageObject.scheduling_posting,
                                mobile_apps: packageObject.mobile_apps,
                                support_24_7: packageObject.support_24_7,
                                crm: packageObject.crm,
                                calendar: packageObject.calendar,
                                rss_feeds: packageObject.rss_feeds,
                                social_report: packageObject.social_report,
                                discovery: packageObject.discovery,
                                twitter_engagement: packageObject.twitter_engagement,
                                link_shortening: packageObject.link_shortening,
                                shareathon: packageObject.shareathon,
                                content_studio: packageObject.content_studio,
                                team_report: packageObject.team_report,
                                board_me: packageObject.board_me,
                                share_library: packageObject.share_library,
                                custom_report: packageObject.custom_report,
                                maximum_schedule: Number(packageObject.maximum_schedule),
                                maximum_referal_count: Number(packageObject.maximum_referal_count),
                            };
                            // Updating the packages with new package details
                            return applicationInformations.findOrCreate({ where: { plan_name: requestBody.plan_name }, defaults: plans });
                        }
                    })
                    .then((response) => {
                        const [instance, wasCreated] = response;
                        if (!wasCreated) {
                            // Else, throwing error of already available package with same name
                            throw new Error("Package is already available with same name.");
                        } else {
                            resolve(instance);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });

    }

    editPackage(packageData, planId) {
        return new Promise((resolve, reject) => {
            if (!packageData || !planId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Finding the Package
                return applicationInformations.findOne({
                    where: { plan_id: planId }
                })
                    .then((details) => {
                        if (!details) {
                            throw new Error("No package found or access denied!");
                        } else {
                            // Updating the package with new details
                            return details.update(packageData).then((result) => {
                                return result;
                            });
                        }
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    updatePackageActivations(planId, activationStatus) {
        return new Promise((resolve, reject) => {
            if (!planId || !(activationStatus == 0 || activationStatus == 1)) {
                reject(new Error("Invalid Inputs"));
            } else {
                if (activationStatus == 0 || activationStatus == 1) {
                    // Fetching the plan details
                    return applicationInformations.findOne({
                        where: { plan_id: planId }
                    })
                        .then((result) => {
                            if (!result)
                                throw new Error("Invalid plan id!");
                            else {
                                // Updating plan details of acive or not
                                return result.update({
                                    is_plan_active: activationStatus
                                });
                            }
                        })
                        .then(() => {
                            resolve(activationStatus == 0 ? "Plan deactivated successfully" : "Plan activated successfully");
                        }).catch((error) => {
                            reject(error);
                        });
                }
                else {
                    reject(new Error("Acitivation options should be either 0 or 1"));
                }
            }
        });
    }

    createCoupon(userId, couponInfo) {
        return new Promise((resolve, reject) => {
            if (!userId || !couponInfo) {
                reject(new Error("Invalid Inputs"));
            }
            else {
                if (couponInfo.discount > 100 || couponInfo.discount < 1) {
                    reject(new Error("Discount should be between 1 to 100"));
                }
                else if (couponInfo.start_date < moment().format('YYYY-MM-DD') || couponInfo.end_date < couponInfo.start_date) {
                    reject(new Error("Invalid coupon start and end dates, please verify startdate should be >= today and enddate should be >= startdate"));
                }
                else if (couponInfo.max_use < 1) {
                    reject(new Error("Max use count should be greater than zero."));
                }
                else {
                    couponInfo.created_date = moment.now();
                    couponInfo.status = true;
                    couponInfo.added_admin_id = userId;

                    // Creating a package if not exist, or else updating
                    return coupons.findOrCreate({
                        where: { coupon_code: couponInfo.coupon_code },
                        defaults: couponInfo
                    })
                        .then((response) => {
                            const [instance, wasCreated] = response;
                            if (!wasCreated) {
                                throw new Error("Coupon already exists.");
                            } else {
                                resolve(instance);
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                }
            }
        });
    }

    changeCouponStatus(couponCode, status) {
        return new Promise((resolve, reject) => {
            if (!couponCode || !(status == 0 || status == 1)) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Finding coupon information 
                return coupons.findOne({ where: { coupon_code: couponCode, status: { [Operator.ne]: status } } })
                    .then((coupon) => {
                        if (!coupon) {
                            var errorMsg = status == 1 ? "Coupon code already activated!" : "Coupon code already deactivated!";
                            reject(new Error(`Mismatched coupon code or ${errorMsg}`));
                        } else {
                            // Updating coupon status
                            return coupon.update({ status: status })
                                .then(() => {
                                    resolve(status == 1 ? "Coupon code activated!" : "Coupon code deactivated!");
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        }
                    });
            }
        });
    }

    getCoupons() {
        return new Promise((resolve, reject) => {
            // Finding all coupons from DB
            return coupons.findAll({})
                .then((coupons) => {
                    resolve(coupons);
                }).catch((error) => {
                    reject(error);
                });
        });
    }

    getCouponInfo(user) {
        return new Promise((resolve, reject) => {
            if (!user) {
                reject(new Error("Invalid Inputs"));
            } else {
                var responsedUsers = [];
                var conditions = {
                    [Operator.or]: [{
                        email: user
                    }, {
                        user_id: user
                    },
                    {
                        first_name: {
                            [Operator.like]: `%${user}%`
                        }
                    }]
                };
                // Fetching user details
                return userDetails.findOne({
                    where: conditions,
                    attributes: ['user_id', 'user_name', 'first_name', 'last_name', 'email', 'phone_no', 'date_of_birth'],
                })
                    .then((user) => {
                        if (!user) {
                            throw new Error("Invalid User");
                        } else {
                            responsedUsers.push(user);
                            return userPayments.findAll({
                                where: {
                                    user_id: user.user_id,
                                },
                                attributes: ['payment_id', 'requested_plan_id', 'coupon_code', 'amount', 'payment_mode', 'payment_status', 'is_payment_verified', 'payer_id', 'payer_name']
                            });
                        }
                    })
                    .then((responseData) => {
                        if (!responseData)
                            throw new Error('Invalid User');
                        else {
                            responseData.forEach(response => {
                                responsedUsers.push(response);
                            });
                            resolve(responsedUsers);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getUnverifiedPayments(paymentMode) {
        return new Promise((resolve, reject) => {
            if (paymentMode == null || paymentMode == undefined) {
                reject(new Error("Invalid Inputs"));
            }
            else {
                // Fetching all un-verified payments
                return userPayments.findAll({ where: { is_payment_verified: 0, payment_mode: paymentMode } })
                    .then((result) => {
                        if (!result) {
                            throw new Error("Not found!");
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

    verifyPayment(paymentId, userName) {
        return new Promise((resolve, reject) => {
            if (!paymentId || !userName) {
                reject(new Error("Invalid Inputs"));
            }
            else {
                // Checking that the payment id is available or not
                return userPayments.findOne({ where: { payment_id: paymentId } })
                    .then((result) => {
                        if (!result) {
                            throw new Error("No such payment available!");
                        } else {
                            return result.update({
                                is_payment_verified: true,
                                payment_verified_date: moment.utc(),
                                payment_verified_by: userName
                            });
                        }
                    })
                    .then(() => {
                        resolve("Successfully verified!");
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}

module.exports = AdminUtils;