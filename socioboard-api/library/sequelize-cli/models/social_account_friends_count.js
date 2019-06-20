'use strict';
module.exports = (sequelize, Sequelize) => {
  const social_account_friends_counts = sequelize.define('social_account_friends_counts', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
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
      type: Sequelize.TEXT,
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
    updated_date: {
      allowNull: false,
      type: Sequelize.DATE
    },
  }, {});
  social_account_friends_counts.associate = function(models) {
    // associations can be defined here
  };
  return social_account_friends_counts;
};