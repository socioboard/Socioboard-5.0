'use strict';
module.exports = (sequelize, Sequelize) => {
  const application_informations = sequelize.define('application_informations', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    plan_id: {
      type: Sequelize.INTEGER(2),
      allowNull: false,
    },
    plan_name: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    plan_price: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
    is_plan_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    account_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    member_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    available_network: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    browser_extension: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    scheduling_posting: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    mobile_apps: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    support_24_7: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    crm: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    calendar: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    rss_feeds: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    social_report: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    discovery: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    twitter_engagement: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    link_shortening: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    shareathon: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    content_studio: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    team_report: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    board_me: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    share_library: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    custom_report: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    maximum_schedule: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: 20
    },
    maximum_referal_count: {
      type: Sequelize.INTEGER(3),
      allowNull: false,
      defaultValue: 3
    }
  }, {});
  application_informations.associate = function (models) {
    // associations can be defined here
  };
  return application_informations;
};