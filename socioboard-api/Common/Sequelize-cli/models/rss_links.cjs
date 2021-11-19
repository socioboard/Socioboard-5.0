'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class rss_links extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  };
  rss_links.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    url: {
      allowNull: false,
      type: Sequelize.STRING(256),
    },
    category: {
      allowNull: true,
      type: Sequelize.STRING(256),
    },
    channel_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'rss_channels',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
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
  }, {
    sequelize,
    modelName: 'rss_links',
  });

  return rss_links;
};
