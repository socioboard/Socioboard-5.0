'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('social_accounts', {
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      /**
       * 1-Facebook user,
       * 2-Facebook page, 
       * 3-Facebook group,
       * 4-Twitter, 
       * 5-Instagram,
       * 6-Linkedin Personal,
       * 7-Linkedin Business,
       * 8-Google Plus, 
       * 9-Youtube, 
       * 10-Google analytics,
       * 11-Dailymotion
       */
      account_type: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
        comment: '1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion'
      },
      user_name: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      social_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      profile_pic_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cover_pic_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 'NA'
      },
      profile_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 'NA'
      },
      friendship_counts: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      info: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // category1: {
      //   type: Sequelize.STRING(64),
      //   allowNull: true,
      //   defaultValue: 'NA'
      // },

      // category2: {
      //   type: Sequelize.STRING(64),
      //   allowNull: true,
      //   defaultValue: 'NA'
      // },
      
      // create_on: {
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW,
      //   allowNull: false
      // },
      account_admin_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_details',
          key: 'user_id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
      // ,
      // archived_status: {
      //   type: Sequelize.INTEGER,
      //   defaultValue: 1,
      //   allowNull: false
      // },
      // account_name: {
      //   type: Sequelize.STRING(64),
      //   allowNull: true
      // },
      // subaccount_type: {
      //   type: Sequelize.STRING(64),
      //   allowNull: true
      // },
      // is_invite: {
      //   type: Sequelize.INTEGER,
      //   defaultValue: 0
      // },
      // rating: {
      //   type: Sequelize.INTEGER,
      //   defaultValue: 1,
      //   allowNull: false
      // },
      // refresh_feeds: {
      //   type: Sequelize.INTEGER,
      //   defaultValue: 1,
      //   allowNull: false
      // },
      // updated_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // },
      // created_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('social_accounts');
  }
};