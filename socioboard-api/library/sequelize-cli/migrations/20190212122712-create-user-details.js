'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_details', {
      
      user_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'PrimayKey'
      },
      user_name: {
        type: Sequelize.STRING(64),
        validate: {
          notEmpty: {
            args: true,
            msg: "user_name is mandatory field."
          },
          isAlphanumeric: {
            args: true,
            msg: "user_name should be alphanumeric character."
          },
          len: {
            args: [4, 32],
            msg: "user_name should have 4 to 64 characters."
          }
        }
      },
  
      email: {
        type: Sequelize.STRING(64),
        validate: {
          notEmpty: {
            args: true,
            msg: "email is mandatory field."
          },
          isEmail: {
            args: true,
            msg: "email is not valid format."
          }
        }
      },
  
      password: {
        type: Sequelize.STRING(100),
        validate: {
          notEmpty: {
            args: true,
            msg: "password is mandatory field."
          }
        }
      },
  
      first_name: {
        type: Sequelize.STRING(32),
        validate: {
          notEmpty: {
            args: true,
            msg: "first_name is mandatory field."
          },
          is: {
            args: /^[a-z ,.'-]+$/i,
            msg: "first_name should have valid characters."
          },
          len: {
            args: [2, 32],
            msg: "first_name should have 2 to 32 characters."
          }
        }
      },
  
      last_name: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: "NA"
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: {
            args: true,
            msg: "date_of_birth is not in valid format."
          }
        }
      },
      profile_picture: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "www.anyprofileurl.com",
        validate: {
          isUrl: {
            args: true,
            msg: "profile_picture is not in valid url."
          }
        }
      },
      phone_code: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 0
      },
      phone_no: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 0,
        validate: {
          isNumeric: {
            args: true,
            msg: "phone_no allows only numberic characters."
          }
        }
      },
      country: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 0
      },
      time_zone: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: "NA"
      },
      about_me: {
        type: Sequelize.TEXT('tiny'),
        allowNull: true,
      },
      is_admin_user: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
  
      user_rewards_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_rewards',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      user_activation_id:{
        type: Sequelize.INTEGER,
        references: {
          model: 'user_activations',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_details');
  }
};