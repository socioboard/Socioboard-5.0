module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'user_details',
        'company_name',
        {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: 'SocioBoard',
        },
        {transaction}
      );
      await queryInterface.addColumn(
        'user_details',
        'company_logo',
        {
          type: Sequelize.STRING(64),
          allowNull: false,
          defaultValue: 'defaultPic.jpg',
        },
        {transaction}
      );
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  },
};
