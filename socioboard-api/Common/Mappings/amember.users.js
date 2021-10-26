import axios from 'axios';
import qs from 'qs';
import moment from 'moment';

// User DB to Update User
import db from '../Sequelize-cli/models/index.js';
import logger from '../../User/resources/Log/logger.log.js';

// Plan Mappings
import plansMapping from './plans.mapping.js';

const userActivation = db.user_activations;

class aMember {
  constructor(aMemberConfig = {}) {
    this.aMemberKey = aMemberConfig?.key;
    this.aMemberDomain = aMemberConfig?.domain;
    this.expiryDays = 14;
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
    return new Promise((resolve, reject) => {
      let dataToUpdate = {
        user_plan: plansMapping[planNumber],
      };
      if (expiryDate !== 'NA')
        dataToUpdate.account_expire_date = moment(expiryDate, 'YYYY-MM-DD');
      userActivation
        .update(dataToUpdate, {where: {id: userId}})
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
          // To setup Subscription with Invoices
          this.addBaseFreeInvoiceToTheUser({
            user_id: response?.data[0]?.user_id,
          });
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
          // 'invoice-payments': [
          //   {
          //     invoice_public_id: 'FREE',
          //     user_id: user.user_id,
          //     paysys_id: 'offline',
          //     receipt_id: 'Free-User',
          //     transaction_id: 'Free-Plan-subscription',
          //     currency: 'USD',
          //     amount: '00.00',
          //   },
          // ],
          access: [
            {
              invoice_public_id: 'FREE',
              user_id: user.user_id,
              product_id: 2,
              transaction_id: 'Free-Plan-subscription',
              begin_date: moment().format('YYYY-MM-DD'),
              expire_date: moment()
                .add(this.expiryDays ?? 14, 'days')
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
}

export default aMember;
