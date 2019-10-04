'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('coupons',
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
        /**
         * 1- acitve
         * 0- de-active
         */
        status: {
          allowNull: false,
          type: Sequelize.INTEGER,
          comment: "1-Active, 0-De-active"
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
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('coupons');
  }
};