'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class auto_reports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  auto_reports.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    report_title: {
      type: Sequelize.STRING
    },
    report_type: {
      type: Sequelize.INTEGER
    },
    frequency: {
      type: Sequelize.INTEGER
    },
    content: {
      type: Sequelize.TEXT
    },
    user_id: {
      type: Sequelize.INTEGER
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
    modelName: 'auto_reports',
  });
  return auto_reports;
};
