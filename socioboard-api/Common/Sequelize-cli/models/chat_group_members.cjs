const {
  Model,
} = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
  class chat_group_members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      chat_group_members.belongsTo(models.user_details, { as: 'user', foreignKey: 'user_id' });
      chat_group_members.belongsTo(models.chat_groups, { as: 'group', foreignKey: 'group_id' });
    }
  }

  chat_group_members.init({
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
    user_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'user_details',
        key: 'user_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
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
  }, {
    sequelize,
    modelName: 'chat_group_members',
    indexes: [
      {
        unique: true,
        fields: ['group_id', 'user_id'],
      },
    ],
    timestamps: true,
    underscored: true,
  });

  return chat_group_members;
};
