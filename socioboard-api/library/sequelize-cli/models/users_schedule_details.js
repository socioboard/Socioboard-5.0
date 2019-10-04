'use strict';
module.exports = (sequelize, Sequelize) => {
  const users_schedule_details = sequelize.define('users_schedule_details', {
    schedule_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    schedule_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0-Onetime Schedule, 1-Daywise Schedule"
      // 0- Onetime Schedule, 1- Daywise Schedule
    },
    module_name: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
    schedule_status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done"
      //schedule_status : 1=ready queue, 2=wait(pause) state, 3= approvalpending, 4=rejected, 5=draft, 6=done  
    },
    mongo_schedule_id: {
      type: Sequelize.STRING(64),
      allowNull: false
    },
    one_time_schedule_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    /**
     * 0- sunday
     * 1- monday
     * 2- tuesday
     * 3- wednesday
     * 4- thursday
     * 5- fri-day
     * 6- saturday
     */
    running_days_of_weeks: {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: '0-1-2-3-4-5-6',
      comment: "0- sunday, 1-monday, 2-tuesday, 3-wednesday, 4-thursday, 5-fri-day, 6-saturday"
    },
    created_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'user_details',
        key: 'user_id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    team_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'team_informations',
        key: 'team_id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
  }, {});
  users_schedule_details.associate = function (models) {
    users_schedule_details.belongsTo(models.user_details, { as: 'UserSchedule', foreignKey: 'user_id', targetKey: 'user_id' });
    users_schedule_details.belongsTo(models.team_informations, { as: 'TeamSchedule', foreignKey: 'team_id', targetKey: 'team_id' });
    // associations can be defined here
  };
  return users_schedule_details;
};