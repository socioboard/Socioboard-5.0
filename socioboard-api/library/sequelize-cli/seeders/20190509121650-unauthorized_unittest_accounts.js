'use strict';

const moment = require('moment');
const uuidv4 = require('uuid/v4');

module.exports = {
  up: (queryInterface, Sequelize) => {

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    // create Activations
    return queryInterface.bulkInsert('user_activations', [
      { // admin
        id: 3,
        activation_status: 0,
        email_validate_token: '05739305-8ef8-4cdc-880e-0771a429597d',
        email_token_expire: moment.utc().add(5, 'days').format(),
        forgot_password_validate_token: '75b23070-19a8-4602-a9c2-55acb3b42721',
        forgot_password_token_expire: moment.utc().add(5, 'days').format(),
        payment_status: 0,
        activate_2step_verification: false,
        signup_type: 0,
        account_expire_date: moment.utc().add(5, 'days').format(),
        user_plan: 0,
        payment_type: 0,
        created_date: moment.utc().format(),
      },
      { // user
        id: 4,
        activation_status: 0,
        email_validate_token: '7485d2fa-2f67-4ecd-b2f0-31dcb2e75066',
        email_token_expire: moment.utc().add(-2, 'days').format(),
        forgot_password_validate_token: '7d65f66e-1d32-410a-bd3f-5075f8287236',
        forgot_password_token_expire: moment.utc().add(-2, 'days').format(),
        payment_status: 0,
        activate_2step_verification: false,
        signup_type: 0,
        account_expire_date: moment.utc().add(5, 'days').format(),
        user_plan: 0,
        payment_type: 0,
        created_date: moment.utc().format(),
      }
    ])
      // Create Rewards
      .then(() => {
        return queryInterface.bulkInsert('user_rewards', [
          { //admin
            id: 3,
            refered_by: "string",
            referal_status: false,
            is_socioboard_ads_enabled: false,
            eWallet: 0
          },
          { //user
            id: 4,
            refered_by: "string",
            referal_status: false,
            is_socioboard_ads_enabled: false,
            eWallet: 0
          }
        ]);
      })
      // Create users
      .then(() => {
        return queryInterface.bulkInsert('user_details', [
          {
            user_id: 3,
            user_name: 'unverified',
            email: 'unverified@socioboard.com',
            password: 'unverified',
            first_name: 'Unverified User',
            last_name: 'Socioboard',
            date_of_birth: moment.utc().subtract(25, 'years').format(),
            profile_picture: 'https://i0.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png',
            phone_code: '+91',
            phone_no: '9876543210',
            country: 'IND',
            time_zone: '+05:30',
            about_me: 'Hi, I am unverified user',
            is_admin_user: false,
            is_account_locked: false,
            user_rewards_id: 3,
            user_activation_id: 3
          },
          {
            user_id: 4,
            user_name: 'tokenexpired',
            email: 'tokenexpired@socioboard.com',
            password: 'tokenexpired',
            first_name: 'Tokenexpired',
            last_name: 'Socioboard',
            date_of_birth: moment.utc().subtract(25, 'years').format(),
            profile_picture: 'http://shinobi-software.com/images/geek.png',
            phone_code: '+91',
            phone_no: '9876543120',
            country: 'IND',
            time_zone: '+05:30',
            about_me: 'I am a token expired user',
            is_admin_user: false,
            is_account_locked: false,
            user_rewards_id: 4,
            user_activation_id: 4
          }
        ]);
      })
      .then(() => {
        return queryInterface.bulkInsert('team_informations', [
          {
            team_id: 9,
            team_name: 'Socioboard',
            team_description: '',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 3,
            is_default_team: true
          },
          {
            team_id: 10,
            team_name: 'Socioboard',
            team_description: '',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 4,
            is_default_team: true
          }
        ]);
      })
      .then(() => {
        queryInterface.bulkInsert('join_table_users_teams', [
          {
            id: 13,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 9,
            user_id: 3
          },
          {
            id: 14,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 10,
            user_id: 4
          }
        ]);
      })
      .catch((error) => {
        console.log(`Error : ${error}`);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */

    return queryInterface.bulkDelete('user_activations', null, {})
      .then(() => {
        return queryInterface.bulkDelete('user_rewards', null, {});
      })
      .then(() => {
        return queryInterface.bulkDelete('user_details', null, {});
      })
      .then(() => {
        return queryInterface.bulkDelete('team_informations', null, {});
      })
      .then(() => {
        return queryInterface.bulkDelete('join_table_users_teams', null, {});
      });
  }
};
