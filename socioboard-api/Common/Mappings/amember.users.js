import axios from 'axios';
import qs from 'qs';
import moment from 'moment';

// User DB to Update User
import db from '../Sequelize-cli/models/index.js';
import logger from '../../User/resources/Log/logger.log.js';

// Plan Mappings
import plansMapping from './plans.mapping.js';

const userActivation = db.user_activations;
const userDetails = db.user_details;
class aMember {
  constructor(aMemberConfig = {}) {
    this.aMemberKey = aMemberConfig?.key;
    this.aMemberDomain = aMemberConfig?.domain;
    this.expiryDays = 7;
  }

  /**
   * To get the user details of particular user by username
   * TODO get the Details of an user
   * TODO check the user subscriptions
   * * Get the plan details ( especially plan number & expiry date )
   * @param {Object} user - userId, userName
   * NOTE Call at login before making token to set the plan and Expiry date
   */
  getUserPlanDetail(userId = 0, userName = '') {
    return new Promise((resolve, reject) => {
      if (!userId || !userName) {
        reject(new Error('Invalid data!'));
      } else {
        // Call the Amember Rout and get the user details
        // Access API - http://example.com/amember/api/check-access/by-login?_key=APIKEY&login=test
        // Here I'm going to break like - DOMAIN/check-access/by-login?_key=KEY&login=test
        axios
          .get(
            `${this.aMemberDomain}/check-access/by-login?_key=${this.aMemberKey}&login=${userName}`
          )
          .then(({data: aMemberUser}) => {
            //  Get Plans from here only
            const {subscriptions} = aMemberUser;
            const plans = Object.keys(subscriptions);
            let planId = 2;
            let expiryDate = 'NA';
            if (plans.length > 0) {
              plans.sort((a, b) => a - b);
              //  Get Value and Date
              planId = plans[plans.length - 1];
              expiryDate = subscriptions[planId] ?? 'NA'; // YYYY-MM-DD
            }
            logger.info(
              `aMember plane Details of an user: ${planId} & ${expiryDate}`
            );

            // Add subscription to the user.
            this.setPlanDetailsToUser(userId, planId, expiryDate)
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                logger.error(
                  `Error amember Inner getUserPlanDetail: ${error?.message}`
                );
                resolve(true);
              });
          })
          .catch(error => {
            logger.error(`Error amember getUserPlanDetail: ${error?.message}`);
            resolve(true);
          });
      }
    });
  }

  /**
   * To set the user package value and expiry date by the username
   * TODO Check the user table and setup the active plan to the number and expiry date as well
   * * Set it before generating the token
   * @param {string} userName - to whom we need to set plan that user userName
   * @param {number} planNumber - which plan need to set
   * @param {date} expiryDate - by when this plan gets expired.
   * @param {Object} params - params should be object with 3 keys
   */
  async setPlanDetailsToUser(
    userId = 99999,
    planNumber = 0,
    expiryDate = 'NA'
  ) {
    return new Promise(async (resolve, reject) => {
      let dataToUpdate = {
        user_plan: plansMapping[planNumber],
      };
      if (expiryDate !== 'NA')
        dataToUpdate.account_expire_date = moment(expiryDate, 'YYYY-MM-DD');
      let activationId = await userDetails.findOne({
        where: {user_id: userId},
        raw: true,
      });
      userActivation
        .update(dataToUpdate, {where: {id: activationId.user_activation_id}})
        .then(updatedData => {
          resolve(updatedData);
        })
        .catch(error => {
          logger.error(`Error amember setPlanDetailsToUser: ${error?.message}`);
          resolve(true);
        });
    });
  }

  /**
   * After signup we need to add the user to amember
   * After adding the user again add a plan of free for some time to make him active
   * TODO Add user to amember, get the ID
   * TODO set the activation to the ID returned
   * @param {string} userName - userName
   * @param {string} password - password
   * @param {string} firstName - firstName
   * @param {string} lastName - lastName
   * @param {string} email - email
   * NOTE Call after register to register in amember also
   */
  addUserToAMember(user = {}) {
    // Set User Details for request
    // Set Basic user details in amember

    // Create user
    return new Promise((resolve, reject) => {
      const data = qs.stringify({
        _key: this.aMemberKey,
        login: user?.userName,
        pass: user?.password,
        name_f: user?.firstName,
        name_l: user?.lastName,
        email: user?.email,
        phone: user?.phone ?? '',
        country: user?.country ?? 'NA',
        src: user?.src ?? '',
        cmp: user?.med ?? '',
        rfd: user?.rfd ?? '',
        kwd: user?.kwd ?? '',
      });
      const userBasicConfig = {
        method: 'post',
        url: `${this.aMemberDomain}/users`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };

      axios(userBasicConfig)
        .then(response => {
          logger.info(
            `User Basic Details from aMember: ${JSON.stringify(
              response?.data
            )} & Id ${response?.data[0]?.user_id}`
          );
          if (response?.data?.error) resolve(true);
          // To setup Subscription with Invoices
          return this.addBaseFreeInvoiceToTheUser({
            user_id: response?.data[0]?.user_id,
          }).then(resolve(true));
        })
        .catch(error => {
          logger.error(`Error amember addUserToAMember: ${error?.message}`);
          resolve(true);
        });
    });
  }

  /**
   * To delete the particular user from aMember if they delete the account from SocioBoard.
   * TODO delete the Details from aMember
   * * Get the plan details ( especially plan number & expiry date )
   * @param {string} userName
   * NOTE Call at deleting the user permanently from the Application
   */
  deleteUserFromAMember(userName) {
    return new Promise(async (resolve, reject) => {
      if (!userName) {
        reject(new Error('Invalid data!'));
      } else {
        // Call the Amember Rout and delete the user details from aMember
        let userId = await this.getAmemberUserId(userName);
        logger.info(`Fetched the Amember User Id ${userId} successfully `);
        const data = qs.stringify({
          _key: this.aMemberKey,
        });
        const userBasicConfig = {
          method: 'delete',
          url: `${this.aMemberDomain}/users/${userId}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data,
        };

        axios(userBasicConfig)
          .then(({data: aMemberUser}) => {
            //  Get Plans from here only
            logger.info(
              `aMember user Deleted and Deleted User Details: ${JSON.stringify(
                aMemberUser
              )} & ${moment().format('YYYY-MM-DD hh:mm:ss A')}`
            );

            resolve('Successfully Deleted the User');
          })
          .catch(error => {
            logger.error(
              `Error amember deleteUserFromAMember:  ${error?.message}`
            );
            resolve(true);
          });
      }
    });
  }

  /**
   * TODO Update User Mail  to amember
   * @param {string} userName - user Name
   * @param {string} email - User email
   */
  updateUserEmailToAMember(user = {}) {
    return new Promise(async (resolve, reject) => {
      const data = qs.stringify({
        _key: this.aMemberKey,
        email: user?.email,
      });
      let userId = await this.getAmemberUserId(user.userName);
      logger.info(`Fetched the Amember User Id ${userId} successfully `);
      const userBasicConfig = {
        method: 'put',
        url: `${this.aMemberDomain}/users/${userId}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };

      axios(userBasicConfig)
        .then(response => {
          logger.info(
            `User Details from aMember after update in Email: ${JSON.stringify(
              response?.data
            )} & Id ${response?.data[0]?.user_id} & Email Id: ${
              response?.data[0]?.email
            } `
          );
          resolve('Email updated Successfully');
        })
        .catch(error => {
          logger.error(
            'Error while  updating Email in Amember;',
            error.message
          );
          resolve(true);
        });
    });
  }

  /**
   * TODO Update User Phone number to amember
   * @param {string} userName - user Name
   * @param {string} phone - User phone number
   */
  updateUserPhoneToAMember(user = {}) {
    return new Promise(async (resolve, reject) => {
      const data = qs.stringify({
        _key: this.aMemberKey,
        phone: user?.phoneNo,
      });
      let userId = await this.getAmemberUserId(user.userName);
      logger.info(`Fetched the Amember User Id ${userId} successfully `);
      const userBasicConfig = {
        method: 'put',
        url: `${this.aMemberDomain}/users/${userId}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };

      axios(userBasicConfig)
        .then(response => {
          logger.info(
            `User Details from aMember after update phone number: ${JSON.stringify(
              response?.data
            )} & Id ${response?.data[0]?.user_id} & Email Id: ${
              response?.data[0]?.phone
            } `
          );
          resolve('Phone number updated Successfully');
        })
        .catch(error => {
          logger.error(
            'Error while  updating Phone number in Amember;',
            error.message
          );
          resolve(true);
        });
    });
  }

  /**
   * TODO Update User password  to amember
   * @param {number} userId - User Id
   * @param {string} password - User Password
   */
  updateUserPasswordToAMember(user = {}) {
    return new Promise(async (resolve, reject) => {
      const data = qs.stringify({
        _key: this.aMemberKey,
        pass: user?.password,
      });
      let userId = await this.getAmemberUserId(user.userName);
      logger.info(`Fetched the Amember User Id ${userId} successfully `);
      const userBasicConfig = {
        method: 'put',
        url: `${this.aMemberDomain}/users/${userId}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };

      axios(userBasicConfig)
        .then(response => {
          logger.info(
            `User Details from aMember after update in Password: ${JSON.stringify(
              response?.data
            )} & Id ${response?.data[0]}`
          );
          resolve('Password updated Successfully');
        })
        .catch(error => {
          logger.error(
            `Error while updating Password in Amember;  ${error?.message}`
          );
          resolve(true);
        });
    });
  }

  /**
   * TODO: This function is useful for adding the Invoices for even first Free subscriptions
   * @param { Object }  user - it should have user_id
   * @returns object of success Data, but no use of it
   * ! It should be same , don't change without checking the Amember user
   * * user_id is for To add subscription based on the user only.
   */
  addBaseFreeInvoiceToTheUser(user = {}) {
    return new Promise((resolve, reject) => {
      // To setup subscription
      const userSubscriptionData = qs.stringify({
        _key: this.aMemberKey,
        public_id: 'FREE',
        user_id: user.user_id,
        paysys_id: 'offline',
        currency: 'USD',
        first_subtotal: '00.00',
        first_discount: '0.00',
        first_tax: '0.00',
        first_shipping: '0.00',
        first_total: '00.00',
        first_period: '14d',
        rebill_times: 0,
        second_subtotal: '00.00',
        second_discount: '0.00',
        second_tax: '0.00',
        second_shipping: '0.00',
        second_total: '00.00',
        second_period: '14d',
        is_confirmed: 1,
        status: 1,
        nested: {
          'invoice-items': [
            {
              invoice_public_id: 'FREE',
              item_id: 2,
              item_type: 'product',
              item_title: 'Free Plan',
              item_description: 'Free Plan',
              qty: 1,
              first_discount: '0.00',
              first_price: '00.00',
              first_tax: '0.00',
              first_shipping: '0.00',
              first_total: '00.00',
              first_period: '14d',
              rebill_times: 0,
              second_discount: '0.00',
              second_tax: '0.00',
              second_shipping: '0.00',
              second_total: '00.00',
              second_price: '00.00',
              second_period: '14d',
              currency: 'USD',
              billing_plan_id: 2,
            },
          ],
          access: [
            {
              invoice_public_id: 'FREE',
              user_id: user.user_id,
              product_id: 2,
              transaction_id: 'Free-Plan-subscription',
              begin_date: moment().format('YYYY-MM-DD'),
              expire_date: moment()
                .add(this.expiryDays ?? 7, 'days')
                .format('YYYY-MM-DD'),
            },
          ],
        },
      });
      const userSubscriptionConfig = {
        method: 'post',
        url: `${this.aMemberDomain}/invoices`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: userSubscriptionData,
      };
      axios(userSubscriptionConfig).then(({data}) => {
        resolve(data);
      });
    });
  }

  /**
   * TODO Fetch the User Id from  amember
   * @param {string} userName - user Name
   * @return {number} Returns Amember UserId
   */
  getAmemberUserId(userName) {
    return new Promise(async (resolve, reject) => {
      if (!userName) {
        reject(new Error('Invalid data!'));
      } else {
        let response = await axios.get(
          `${this.aMemberDomain}/check-access/by-login?_key=${this.aMemberKey}&login=${userName}`
        );
        let userId = response.data.user_id;
        resolve(userId);
      }
    });
  }

  getUserCurrentProducts(userId = 0) {
    return new Promise(async (resolve, reject) => {
      let response = await axios.get(
        `${this.aMemberDomain}/access?_key=${this.aMemberKey}&_filter[user_id]=${userId}`
      );
      resolve(response?.data);
    });
  }

  removeCurrentProducts(products = []) {
    return new Promise((resolve, reject) => {
      Promise.all(
        products.map(productId => {
          return new Promise((resolve, reject) => {
            var config = {
              method: 'delete',
              url: `${this.aMemberDomain}/access/${productId}?_key=${this.aMemberKey}`,
            };

            axios(config)
              .then(({data}) => {
                resolve(data);
              })
              .catch(error => {
                reject(error);
              });
          });
        })
      )
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          logger.error(JSON.stringify(error));
          reject(false);
        });
    });
  }

  async setAMemberPlanForAppSumoUser(userName, plan_type, refund) {
    let user_id = await this.getAmemberUserId(userName);

    let products = await this.getUserCurrentProducts(user_id);
    if (products?._total > 0) {
      let productIds = [];
      for (let i = 0; i < products?._total; i++) {
        productIds.push(products[i].access_id);
      }
      await this.removeCurrentProducts(productIds);
    }
    let userSubscriptionData;
    if (!refund) {
      let first_subtotal = await this.getPlanSubTotal(plan_type);
      let item_id =
        plan_type === 'socioboard_tier1'
          ? 10
          : plan_type === 'socioboard_tier2'
          ? 11
          : 12;

      // To setup subscription
      userSubscriptionData = qs.stringify({
        _key: this.aMemberKey,
        public_id: 'AppSumo',
        user_id,
        paysys_id: 'offline',
        currency: 'USD',
        first_subtotal,
        first_discount: '0.00',
        first_tax: '0.00',
        first_shipping: '0.00',
        first_total: '00.00',
        first_period: `lifetime`,
        rebill_times: 0,
        second_subtotal: '00.00',
        second_discount: '0.00',
        second_tax: '0.00',
        second_shipping: '0.00',
        second_total: '00.00',
        second_period: `lifetime`,
        is_confirmed: 1,
        status: 1,
        nested: {
          'invoice-items': [
            {
              invoice_public_id: 'AppSumo',
              item_id,
              item_type: 'product',
              item_title: plan_type, //
              item_description: plan_type, //same
              qty: 1,
              first_discount: '0.00',
              first_price: '00.00',
              first_tax: '0.00',
              first_shipping: '0.00',
              first_total: '00.00',
              first_period: `lifetime`,
              rebill_times: 0,
              second_discount: '0.00',
              second_tax: '0.00',
              second_shipping: '0.00',
              second_total: '00.00',
              second_price: '00.00',
              second_period: `lifetime`,
              currency: 'USD',
              billing_plan_id: item_id,
            },
          ],
          access: [
            {
              invoice_public_id: 'AppSumo',
              user_id,
              product_id: item_id,
              transaction_id: plan_type,
              begin_date: moment().format('YYYY-MM-DD'),
              expire_date: refund
                ? moment().format('YYYY-MM-DD')
                : '2037-12-31',
            },
          ],
        },
      });
    } else {
      // Set plan to 0 days or expired.
      userSubscriptionData = qs.stringify({
        _key: this.aMemberKey,
        public_id: 'FREE',
        user_id,
        paysys_id: 'offline',
        currency: 'USD',
        first_subtotal: '00.00',
        first_discount: '0.00',
        first_tax: '0.00',
        first_shipping: '0.00',
        first_total: '00.00',
        first_period: '1d',
        rebill_times: 0,
        second_subtotal: '00.00',
        second_discount: '0.00',
        second_tax: '0.00',
        second_shipping: '0.00',
        second_total: '00.00',
        second_period: '1d',
        is_confirmed: 1,
        status: 1,
        nested: {
          'invoice-items': [
            {
              invoice_public_id: 'FREE',
              item_id: 2,
              item_type: 'product',
              item_title: 'Free Plan',
              item_description: 'Free Plan',
              qty: 1,
              first_discount: '0.00',
              first_price: '00.00',
              first_tax: '0.00',
              first_shipping: '0.00',
              first_total: '00.00',
              first_period: '1d',
              rebill_times: 0,
              second_discount: '0.00',
              second_tax: '0.00',
              second_shipping: '0.00',
              second_total: '00.00',
              second_price: '00.00',
              second_period: '1d',
              currency: 'USD',
              billing_plan_id: 2,
            },
          ],
          access: [
            {
              invoice_public_id: 'FREE',
              user_id,
              product_id: 2,
              transaction_id: 'Free-Plan-subscription',
              begin_date: moment().format('YYYY-MM-DD'),
              expire_date: moment().add(1, 'days').format('YYYY-MM-DD'),
            },
          ],
        },
      });
    }

    return new Promise((resolve, reject) => {
      const userSubscriptionConfig = {
        method: 'post',
        url: `${this.aMemberDomain}/invoices`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: userSubscriptionData,
      };
      axios(userSubscriptionConfig).then(({data}) => {
        resolve(data);
      });
    });
  }

  async getPlanSubTotal(plan) {
    return plan === 'socioboard_tier1'
      ? 59.0
      : plan === 'socioboard_tier2'
      ? 119.0
      : 179.0;
  }
}

export default aMember;
