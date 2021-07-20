'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_details', {
      user_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'PrimayKey'
      },
      user_name: {
        type: Sequelize.STRING(64),
        unique: true,
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
            args: /^[a-z ,.'0-9]+$/i,
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
        // validate: {
        //   isUrl: {
        //     args: false,
        //     msg: "profile_picture is not in valid url."
        //   }
        // }
      },

      // bio: {
      //   type: Sequelize.TEXT,
      //   allowNull: true,
      //   defaultValue: 0
      // },

      phone_code: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 0,
        validate: {
          is: {
            args: /^[+0-9]+$/i,
            msg: "Phone code should have valid characters."
          },
        }
      },

      phone_no: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 0,
        // validate: {
        //   isNumeric: {
        //     args: true,
        //     msg: "phone_no allows only numberic characters."
        //   }
        // }
      },
      // address: {
      //   type: Sequelize.STRING(64),
      //   allowNull: false,
      //   defaultValue: 0
      // },
      // working_at: {
      //   type: Sequelize.STRING(30),
      //   allowNull: false,
      //   defaultValue: "nil"
      // },

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

      is_admin_user: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_account_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // twitter_id: {
      //   type: Sequelize.STRING(30),
      //   allowNull: true,
      //   defaultValue: 0
      // },
      // facebook_id: {
      //   type: Sequelize.STRING(30),
      //   allowNull: true,
      //   defaultValue: 0

      // },
      // youtube_id: {
      //   type: Sequelize.STRING(30),
      //   allowNull: true,
      //   defaultValue: 0

      // },
      // instagram_id: {
      //   type: Sequelize.STRING(30),
      //   allowNull: true,
      //   defaultValue: 0

      // },
      about_me: {
        type: Sequelize.TEXT('tiny'),
        allowNull: true,

      },
      // language: {
      //   type: Sequelize.STRING(10),
      //   defaultValue: "en",
      //   allowNull: false
      // },
      // updated_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // },
      // created_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.NOW
      // },
      user_rewards_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_rewards',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      user_activation_id: {
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_details');
  }
};