module.exports = (sequelize, Sequelize) => {
  const Invitation = sequelize.define('Invitations', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId:{
      type: Sequelize.INTEGER
    },
    teamId:{
      type: Sequelize.INTEGER
    },
    userName:{
      type: Sequelize.STRING
    },
    refreshToken: {
      type: Sequelize.STRING
    },
    requestSecret:{
      type:Sequelize.STRING
    },
    redirectUrl:{
      type:Sequelize.STRING
    },
    account_name:{
      type: Sequelize.STRING(64),
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }, {});
  return Invitation;
};