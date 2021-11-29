module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('chat_group_messages', {
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
          type: Sequelize.ENUM(['text', 'image', 'serve']),
          unique: false,
          comment: '0-Text, 1-Image, 2-Serve',
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
        createdAt: { type: Sequelize.DATE, field: 'createdAt' },
        updatedAt: { type: Sequelize.DATE, field: 'updatedAt' },
      });
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('chat_group_messages');
    } catch (error) {
      console.error(error);
    }
  },
};
