module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'user_media_details',
        'rating',
        {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          allowNull: false,
        },
        {transaction}
      );
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  },
};
