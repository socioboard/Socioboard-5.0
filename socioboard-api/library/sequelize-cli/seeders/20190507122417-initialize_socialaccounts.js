'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */
    return queryInterface.bulkInsert('social_accounts',
      [
        {
          "account_id": 1,
          "account_type": 1,
          "user_name": "<<username>>",
          "first_name": "<<firstname>>",
          "last_name": "<<lastname>>",
          "email": "<<emailId>>",
          "social_id": "<<social id>>",
          "profile_pic_url": "<<profile picture>>",
          "cover_pic_url": "<<cover picture>>",
          "profile_url": "<<profile url>>",
          "access_token": "<<access token>>",
          "refresh_token": "<<refresh token>>",
          "friendship_counts": "0",
          "info": "",
          "account_admin_id": 1
        }     
      ])
      .then(() => {
        queryInterface.bulkInsert('join_table_teams_social_accounts', [
          {
            "id": 1,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 1
          },
         
        ]);
      })
      .then(() => {
        return queryInterface.bulkInsert('pinterest_boards', [
          {
            "id": 1,
            "board_id": "<<Board Id>>",
            "board_name": "<<Board Name>>",
            "board_url": "<<Board Url>>",
            "privacy": "public",
            "board_admin_name": "<<Board Admin Name>>",
            "board_admin_id": "<<Board Admin Id>>",
            "board_admin_url": "<<Board Admin Url>>",
            "social_account_id": "<<Account in Integer>>"
          }
        ]);
      });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('social_accounts', null, {})
      .then(() => {
        return queryInterface.bulkDelete('join_table_teams_social_accounts', null, {});
      })
      .then(() => {
        return queryInterface.bulkDelete('pinterest_boards', null, {});
      });
  }
};
