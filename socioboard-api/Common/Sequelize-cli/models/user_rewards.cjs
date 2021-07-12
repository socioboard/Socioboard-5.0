'use strict';
const {
  Model
} = require('sequelize')
module.exports = (sequelize, Sequelize) => {
  class user_rewards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_rewards.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    eWallet: {
      type: Sequelize.FLOAT,
      defaultValue: 0.0,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "eWallet is mandatory field."
        },
        isFloat: {
          args: true,
          msg: "eWallet should be a float value."
        }
      }
    },
    /**
    * true - ads are enabled : 1
    * false - ads are not enabled : 0
    */
    is_socioboard_ads_enabled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "true - ads are enabled, false - ads are not enabled"
    },
    refered_by: {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "NA"
    },
    referal_code: {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV1
    },
    // 0: inactive : false
    // 1: active : true
    referal_status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "0: inactive : false, 1: active : true"
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },

    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'user_rewards',
  });
  return user_rewards;
};