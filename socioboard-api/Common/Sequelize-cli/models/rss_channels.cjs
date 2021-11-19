const {
  Model,
} = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class rss_channels extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      rss_channels.hasMany(models.rss_links, { as: 'links', foreignKey: 'channel_id', targetKey: 'id' });
    }
  }

  rss_channels.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    title: {
      allowNull: false,
      type: Sequelize.STRING(256),
    },
    logo_url: {
      allowNull: true,
      type: Sequelize.STRING(256),
      defaultValue: null,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'user_details',
        key: 'user_id',
      },
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
    modelName: 'rss_channels',
  });

  return rss_channels;
};
