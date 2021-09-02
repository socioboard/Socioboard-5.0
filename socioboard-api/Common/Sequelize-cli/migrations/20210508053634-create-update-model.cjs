// 'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //#region  changes for SBv4 database
      await queryInterface.addColumn(
        'social_accounts',
        'category1',
        {
          type: Sequelize.STRING(64),
          allowNull: true,
          defaultValue: 'NA'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'category2',
        {
          type: Sequelize.STRING(64),
          allowNull: true,
          defaultValue: 'NA'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'create_on',
        {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'archived_status',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'account_name',
        {
          type: Sequelize.STRING(64),
          allowNull: true
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'subaccount_type',
        {
          type: Sequelize.STRING(64),
          allowNull: true
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'is_invite',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'rating',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'refresh_feeds',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'team_informations',
        'is_team_locked',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'direct_login_validate_token',
        {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.UUIDV1
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'direct_login_token_expire',
        {
          type: Sequelize.DATE,
          allowNull: true,
          validate: {
            isDate: {
              args: true,
              msg: "direct_login_token_expire should be a valid date format."
            }
          }
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'send_expire_mail',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false,
          comments: '0-Not active, 1-active'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'send_feature_mail',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false,
          comments: '0-Not active, 1-active'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'sent_expired_mail',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
          comments: '0-Mail not sent, 1-mail sent'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'bio',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'address',
        {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'working_at',
        {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: "nil"
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'twitter_id',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'facebook_id',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'youtube_id',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'instagram_id',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
          defaultValue: 0
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'language',
        {
          type: Sequelize.STRING(10),
          defaultValue: "en",
          allowNull: false
        },
        { transaction }
      );

      //#endregion

      //#region common  data changes
      await queryInterface.addColumn(
        'application_informations',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'application_informations',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'boards',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'boards',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'join_table_teams_social_accounts',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'join_table_teams_social_accounts',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'join_table_users_teams',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'join_table_users_teams',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scheduled_informations',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scheduled_informations',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_accounts',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_account_feeds_updates',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_account_feeds_updates',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_account_feeds_updates',
        'updated_date',
        {
          allowNull: false,
          type: Sequelize.DATE
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_account_friends_counts',
        'updated_date',
        {
          allowNull: false,
          type: Sequelize.DATE
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_account_friends_counts',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'social_account_friends_counts',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'team_informations',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'team_informations',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'users_schedule_details',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'users_schedule_details',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_activations',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_details',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_media_details',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_media_details',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_payments',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_payments',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_rewards',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'user_rewards',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'pinterest_boards',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'pinterest_boards',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'coupons',
        'updated_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'coupons',
        'created_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        { transaction }
      );
      //#endregion
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

};