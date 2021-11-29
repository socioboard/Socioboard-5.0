const {Model} = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
  class chat_group_messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      chat_group_messages.belongsTo(models.user_details, {
        as: 'user',
        foreignKey: 'sender_id',
      });
    }
  }

  chat_group_messages.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      group_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'chat_groups',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      sender_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_details',
          key: 'user_id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      type: {
        type: Sequelize.ENUM(['text', 'image', 'video', 'serve']),
        unique: false,
        comment: 'text, image, video, serve',
      },
      body: {
        type: Sequelize.TEXT(),
        allowNull: true,
      },
      read_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      },
      is_edited: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt',
        get() {
          return moment(this.getDataValue('createdAt')).toISOString();
        },
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt',
        get() {
          return moment(this.getDataValue('updatedAt')).toISOString();
        },
      },
    },
    {
      sequelize,
      modelName: 'chat_group_messages',
      timestamps: true,
      underscored: true,
    }
  );

  return chat_group_messages;
};
