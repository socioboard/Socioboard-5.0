'use strict';
module.exports = (sequelize, Sequelize) => {
  const coupons = sequelize.define('coupons',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coupon_code: {
        allowNull: false,
        type: Sequelize.STRING(32)
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      added_admin_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      discount: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      max_use: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      created_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
    }, {});
  coupons.associate = function (models) {
    // associations can be defined here
  };
  return coupons;
};