'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, Sequelize) => {
  class scheduled_informations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      scheduled_informations.belongsTo(models.users_schedule_details, { as: 'ScheduledInfo', foreignKey: 'schedule_id', targetKey: 'schedule_id' });

    }
  };
  scheduled_informations.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    schedule_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users_schedule_details',
        key: 'schedule_id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    schedule_datetime: {
      type: Sequelize.DATE,
      allowNull: false
    },
    scheduler_name: {
      type: Sequelize.STRING(64),
      allowNull: false
    },
    /**
     * 1- ready Queue
     * 2- wait(pause)
     * 3- approvalpending
     * 4- rejected
     * 5- draft
     * 6- done
     */
    status: {
      type: Sequelize.INTEGER(2),
      allowNull: false,
      defaultValue: 0,
      comment: "1- ready Queue, 2-wait(pause), 3-approvalpending, 4-rejected, 5-draft, 6-done"
      // 0- Not Yet Started, 1- Running, 2-Completed, 3-Errored, 4-Paused, 5-Stopped(they made main schedule as stopped), 6- Expired, 7-Draft, 8- Admin Request, 9 -Rejected By Admin, 10- Cancelled
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'scheduled_informations',
  });
  return scheduled_informations;
};