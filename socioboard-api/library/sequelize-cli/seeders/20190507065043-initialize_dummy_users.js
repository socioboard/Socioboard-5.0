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
        id: 1,
        activation_status: 1,
        email_validate_token: uuidv4(),
        email_token_expire: moment.utc().add(5, 'days').format(),
        forgot_password_validate_token: uuidv4(),
        forgot_password_token_expire: moment.utc().add(5, 'days').format(),
        payment_status: 1,
        last_payment_id: 1,
        activate_2step_verification: false,
        signup_type: 0,
        account_expire_date: moment.utc().add(5, 'days').format(),
        user_plan: 7,
        payment_type: 0,
        created_date: moment.utc().format(),
      },
      { // user
        id: 2,
        activation_status: 1,
        email_validate_token: '24d63085-44ea-46cb-9b6f-bbf881abca18',
        email_token_expire: moment.utc().add(5, 'days').format(),
        forgot_password_validate_token: '3b083e90-72f9-11e9-91c8-0757688864bd',
        forgot_password_token_expire: moment.utc().add(5, 'days').format(),
        payment_status: 1,
        last_payment_id: 2,
        activate_2step_verification: false,
        signup_type: 0,
        account_expire_date: moment.utc().add(5, 'days').format(),
        user_plan: 7,
        payment_type: 0,
        created_date: moment.utc().format(),
      }
    ])
      // Create Rewards
      .then(() => {
        return queryInterface.bulkInsert('user_rewards', [
          { //admin
            id: 1,
            refered_by: "string",
            referal_status: false,
            is_socioboard_ads_enabled: false,
            eWallet: 0
          },
          { //user
            id: 2,
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
            user_id: 1,
            user_name: 'socioboard-admin',
            email: 'testadmin@socioboard.com',
            password: 'admin',
            first_name: 'Admin',
            last_name: 'Socioboard',
            date_of_birth: moment.utc().subtract(25, 'years').format(),
            profile_picture: 'https://i0.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png',
            phone_code: '+91',
            phone_no: '9876543210',
            country: 'IND',
            time_zone: '+05:30',
            about_me: 'Hi, I am a test admin',
            is_admin_user: true,
            is_account_locked: false,
            user_rewards_id: 1,
            user_activation_id: 1
          },
          {
            user_id: 2,
            user_name: 'socioboard-user',
            email: 'testuser@socioboard.com',
            password: 'user',
            first_name: 'User',
            last_name: 'Socioboard',
            date_of_birth: moment.utc().subtract(25, 'years').format(),
            profile_picture: 'http://shinobi-software.com/images/geek.png',
            phone_code: '+91',
            phone_no: '9876543120',
            country: 'IND',
            time_zone: '+05:30',
            about_me: 'I am a test user',
            is_admin_user: false,
            is_account_locked: false,
            user_rewards_id: 2,
            user_activation_id: 2
          }
        ]);
      })
      .then(() => {
        return queryInterface.bulkInsert('team_informations', [
          {
            team_id: 1,
            team_name: 'Socioboard',
            team_description: '',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 1,
            is_default_team: true
          },
          {
            team_id: 2,
            team_name: 'Socioboard',
            team_description: '',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 2,
            is_default_team: true
          },
          {
            team_id: 3,
            team_name: 'Admin',
            team_description: 'Admin group',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 1,
            is_default_team: false
          },
          {
            team_id: 4,
            team_name: 'User',
            team_description: 'User group for testing',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 2,
            is_default_team: false
          },
          {
            team_id: 5,
            team_name: 'UserAdmin',
            team_description: 'User Admin Group',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 1,
            is_default_team: false
          },
          {
            team_id: 6,
            team_name: 'UserLeftTeam',
            team_description: 'User Left Group',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 1,
            is_default_team: false
          },
          {
            team_id: 7,
            team_name: 'UserRequestPendingForAccept',
            team_description: 'User Request Pending (Accept) Groups',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 1,
            is_default_team: false
          },
          {
            team_id: 8,
            team_name: 'UserRequestPendingForDecline',
            team_description: 'User Request Pending (Decline) Groups',
            team_logo: 'https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg',
            team_admin_id: 1,
            is_default_team: false
          },
        ]);
      })
      .then(() => {
        queryInterface.bulkInsert('join_table_users_teams', [
          {
            id: 1,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 1,
            user_id: 1
          },
          {
            id: 2,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 2,
            user_id: 2
          },
          {
            id: 3,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 3,
            user_id: 1
          },
          {
            id: 4,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 4,
            user_id: 2
          },
          {
            id: 5,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 5,
            user_id: 1
          },
          {
            id: 6,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 1,
            permission: 1,
            team_id: 5,
            user_id: 2
          },
          {
            id: 7,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 6,
            user_id: 1
          },
          {
            id: 8,
            invitation_accepted: 1,
            left_from_team: 1,
            invited_by: 1,
            permission: 1,
            team_id: 6,
            user_id: 2
          },
          {
            id: 9,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 7,
            user_id: 1
          },
          {
            id: 10,
            invitation_accepted: 0,
            left_from_team: 0,
            invited_by: 1,
            permission: 1,
            team_id: 7,
            user_id: 2
          },
          {
            id: 11,
            invitation_accepted: 1,
            left_from_team: 0,
            invited_by: 0,
            permission: 1,
            team_id: 8,
            user_id: 1
          },
          {
            id: 12,
            invitation_accepted: 0,
            left_from_team: 0,
            invited_by: 1,
            permission: 1,
            team_id: 8,
            user_id: 2
          }
        ]);
      })
      .then(() => {
        // Payments
        return queryInterface.bulkInsert('user_payments', [
          {
            payment_id: 1,
            transaction_id: "5WA71798LB533870A",
            transaction_type: 'expresscheckout',
            currency_code: 'USD',
            amount: '19.9979999',
            coupon_code: 'SB80',
            payment_mode: 0,
            payment_status: 1,
            payment_initiated_date: moment.utc().format(),
            requested_plan_id: 7,
            payment_completed_date: moment.utc().format(),
            is_payment_verified: 0,
            payment_verified_date: null,
            payment_verified_by: null,
            payer_id: 'J9VSKE27GQU6S',
            payer_email: 'testadmin@socioboard.com',
            payer_name: 'Socioboard Admin',
            subscription_details: '{"token":"EC-1EB05790N97828118","invoiceId":"1557215725"}',
            invoice_id: '1557215725',
            invoice_url: null,
            user_id: 1
          },
          {
            payment_id: 2,
            transaction_id: '341333',
            transaction_type: 'AXISPG',
            currency_code: 'INR',
            amount: '1387',
            coupon_code: 'SB80',
            payment_mode: 1,
            payment_status: 1,
            payment_initiated_date: moment.utc().format(),
            requested_plan_id: 7,
            payment_completed_date: moment.utc().format(),
            is_payment_verified: 0,
            payment_verified_date: null,
            payment_verified_by: null,
            payer_id: '9876543210',
            payer_email: 'testuser@socioboard.com',
            payer_name: '401200XXXXXX1112',
            subscription_details: '{"transaction_id":"Socioboard1557228011"}',
            invoice_id: 'Socioboard1557228011',
            invoice_url: null,
            user_id: 2
          }
        ]);
      })
      .then(() => {
        return queryInterface.bulkInsert('coupons', [
          {
            id: 1,
            coupon_code: "SB80",
            start_date: moment.utc().format(),
            end_date: moment.utc().add(12, 'hours').format(),
            added_admin_id: 1,
            status: 1,
            discount: 80,
            max_use: 2,
            created_date: moment.utc().format()
          },
          {
            id: 2,
            coupon_code: "SB50",
            start_date: moment.utc().format(),
            end_date: moment.utc().add(2, 'days').format(),
            added_admin_id: 2,
            status: 0,
            discount: 50,
            max_use: 4,
            created_date: moment.utc().format()
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
      })
      .then(() => {
        return queryInterface.bulkDelete('user_payments', null, {});
      })
      .then(() => {
        return queryInterface.bulkDelete('coupons', null, {});
      });
  }
};
