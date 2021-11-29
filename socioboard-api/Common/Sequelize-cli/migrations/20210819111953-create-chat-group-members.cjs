module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('chat_group_members', {
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
        createdAt: { type: Sequelize.DATE, field: 'createdAt' },
        updatedAt: { type: Sequelize.DATE, field: 'updatedAt' },
      }, {
        indexes: [
          {
            unique: true,
            fields: ['group_id', 'user_id'],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('chat_group_members');
    } catch (error) {
      console.error(error);
    }
  },
};
