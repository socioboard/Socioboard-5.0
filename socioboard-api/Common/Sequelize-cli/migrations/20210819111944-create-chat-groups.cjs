module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('chat_groups', {
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
        createdAt: { type: Sequelize.DATE, field: 'createdAt' },
        updatedAt: { type: Sequelize.DATE, field: 'updatedAt' },
      });
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('chat_groups');
    } catch (error) {
      console.error(error);
    }
  },
};
