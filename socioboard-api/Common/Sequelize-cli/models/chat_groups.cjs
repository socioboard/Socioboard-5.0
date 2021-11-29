const {
  Model,
} = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class chat_groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      chat_groups.belongsTo(models.team_informations, { as: 'Team', foreignKey: 'team_id', targetKey: 'team_id' });
      chat_groups.hasMany(models.chat_group_members, { foreignKey: 'group_id', targetKey: 'id' });
      chat_groups.hasMany(models.chat_group_messages, { foreignKey: 'group_id', targetKey: 'id' });
    }
  }

  chat_groups.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    team_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'team_informations',
        key: 'team_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    admin_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'user_details',
        key: 'user_id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    name: {
      type: Sequelize.STRING(64),
    },
  }, {
    sequelize,
    modelName: 'chat_groups',
  });

  return chat_groups;
};
