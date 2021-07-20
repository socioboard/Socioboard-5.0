import axios from 'axios';
import qs from 'qs';
import moment from 'moment';

// User DB to Update User
import db from '../Sequelize-cli/models/index.js';
const userActivation = db.user_activations;
import logger from '../../User/resources/Log/logger.log.js';

// Plan Mappings
import plansMapping from './plans.mapping.js';

class aMember {
  constructor(aMemberConfig = {}) {
    this.aMemberKey = aMemberConfig?.key;
    this.aMemberDomain = aMemberConfig?.domain;
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
            let {subscriptions} = aMemberUser;
            let plans = Object.keys(subscriptions);
            let planId = 2;
            let expiryDate = moment().add(1, 'month').format('YYYY-MM-DD');
            if (plans.length > 0) {
              plans.sort((a, b) => a - b);
              //  Get Value and Date
              planId = plans[plans.length - 1];
              expiryDate = subscriptions[planId]; // YYYY-MM-DD
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
                reject(error?.message);
              });
          })
          .catch(error => {
            //  Log error to know the status
            reject(error.message);
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
    expiryDate = '2037-12-20'
  ) {
    return new Promise((resolve, reject) => {
      let mappedPlanId = plansMapping[planNumber];
      let expireTime = moment(expiryDate, 'YYYY-MM-DD');
      userActivation
        .update(
          {
            user_plan: plansMapping[planNumber],
            account_expire_date: moment(expiryDate, 'YYYY-MM-DD'),
          },
          {where: {id: userId}}
        )
        .then(updatedData => {
          resolve(updatedData);
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
        data: data,
      };

      axios(userBasicConfig)
        .then(response => {
          logger.info(
            `User Basic Details from aMember: ${JSON.stringify(
              response?.data
            )} & Id ${response?.data[0]?.user_id}`
          );
          // To setup subscription
          const userSubscriptionData = qs.stringify({
            _key: this.aMemberKey,
            user_id: response?.data[0]?.user_id,
            product_id: 2, // Free plan number in Amember
            begin_date: moment().format('YYYY-MM-DD'),
            expire_date: moment().add(1, 'month').format('YYYY-MM-DD'),
          });
          const userSubscriptionConfig = {
            method: 'post',
            url: `${this.aMemberDomain}/access`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: userSubscriptionData,
          };
          axios(userSubscriptionConfig).then(({data}) => {
            resolve(data);
          });
        })
        .catch(error => {
          //  Log the error
          reject(error);
        });
    });
  }

  /**
   * To delete the particular user from aMember if they delete the account from SocioBoard.
   * TODO delete the Details from aMember
   * * Get the plan details ( especially plan number & expiry date )
   * @param {number} userId
   * NOTE Call at deleting the user permanently from the Application
   */
  deleteUserFromAMember(userId = 0) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject(new Error('Invalid data!'));
      } else {
        // Call the Amember Rout and delete the user details from aMember
        const data = qs.stringify({
          _key: this.aMemberKey,
        });
        const userBasicConfig = {
          method: 'delete',
          url: `${this.aMemberDomain}/users/${userId}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: data,
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
            //  Log error to know the status
            reject(error.message);
          });
      }
    });
  }

    /**
   * TODO Update User Mail  to amember
   * @param {number} userId - user Id
   * @param {string} email - User email
   */
  updateUserEmailToAMember(user = {}) {
     return new Promise((resolve, reject) => {
      const data = qs.stringify({
        _key: this.aMemberKey,
        email: user?.email,
      });
      const userBasicConfig = {
        method: 'put',
        url: `${this.aMemberDomain}/users/${user?.userId}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
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
          resolve(`Email updated Successfully`);
        })
        .catch(error => {
          logger.error(
            `Error while  updating Email in Amember;`,
            error.message
          );
          reject(error);
        });
    });
  }

     /**
   * TODO Update User password  to amember
   * @param {number} userId - User Id
   * @param {string} password - User Password
   */
  updateUserPasswordToAMember(user = {}) {
     return new Promise((resolve, reject) => {
      const data = qs.stringify({
        _key: this.aMemberKey,
        pass: user?.password,
      });
      const userBasicConfig = {
        method: 'put',
        url: `${this.aMemberDomain}/users/${user?.userId}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      axios(userBasicConfig)
        .then(response => {
          logger.info(
            `User Details from aMember after update in Password: ${JSON.stringify(
              response?.data
            )} & Id ${response?.data[0]}`
          );
          resolve(`Password  updated Successfully`);
        })
        .catch(error => {
          logger.error(
            `Error while  updating Pasword  in Amember;`,
            error.message
          );
          reject(error);
        });
    });
  }


}

export default aMember;
