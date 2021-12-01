module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'users_schedule_details',
        'start_date',
        {
          type: Sequelize.DATE,
          allowNull: true
       },
        {transaction}
      );
      await queryInterface.addColumn(
        'users_schedule_details',
        'interval',
        {
          type: Sequelize.INTEGER,
          allowNull: true
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
        'users_schedule_details',
        'start_date',
        {transaction}
      );
      await queryInterface.removeColumn(
        'users_schedule_details',
        'interval',
        {transaction}
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
