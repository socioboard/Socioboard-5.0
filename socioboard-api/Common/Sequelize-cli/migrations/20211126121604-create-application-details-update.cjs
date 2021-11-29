module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'application_informations',
        'competitor_analysis',
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '0-Not allowed, 1-Allowed',
        },
        {transaction}
      );
      await queryInterface.addColumn(
        'application_informations',
        'competitor_analysis_count',
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: 'How many per competitor category allowed',
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
        'application_informations',
        'competitor_analysis',
        {transaction}
      );
      await queryInterface.removeColumn(
        'application_informations',
        'competitor_analysis_count',
        {transaction}
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
