'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class appsumo_activation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  appsumo_activation.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      action: {
        type: Sequelize.STRING,
      },
      uuid: {
        type: Sequelize.STRING,
      },
      plan_id: {
        type: Sequelize.STRING,
      },
      activation_email: {
        type: Sequelize.STRING,
      },
      invoice_item_uuid: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'appsumo_activation',
    }
  );
  return appsumo_activation;
};
