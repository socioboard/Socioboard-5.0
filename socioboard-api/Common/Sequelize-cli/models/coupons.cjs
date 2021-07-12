'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class coupons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  };
  coupons.init({
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
    modelName: 'coupons',
  });
  return coupons;
};