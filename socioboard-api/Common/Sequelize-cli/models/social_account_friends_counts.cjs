'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class social_account_friends_counts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  social_account_friends_counts.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    friendship_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    follower_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    following_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    page_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    group_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    board_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    subscription_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    total_like_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    total_post_count: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    bio_text: {
      type: Sequelize.TEXT('tiny'),
      allowNull: true
    },
    profile_picture: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    cover_picture: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    account_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'social_accounts',
        key: 'account_id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    updated_date: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'social_account_friends_counts',
  });
  return social_account_friends_counts;
};