module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'social_account_feeds_updates',
        'boardId',
        {
          after: 'social_id',
          type: Sequelize.STRING,
          allowNull: true,
          comment: 'Board Id'
        },
        {transaction}
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'social_account_feeds_updates',
        'boardId',
        {transaction}
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
