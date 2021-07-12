'use strict';
const {
  Model

} = require('sequelize')
const moment = require('moment');

module.exports = (sequelize, Sequelize) => {
  class user_activations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_activations.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    email_validate_token: {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV1
    },
    email_token_expire: {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "email_token_expire should be a valid date format."
        }
      }
    },
    forgot_password_validate_token: {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV1
    },
    forgot_password_token_expire: {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "forgot_password_token_expire should be a valid date format."
        }
      }
    },
    direct_login_validate_token: {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV1
    },
    direct_login_token_expire: {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "direct_login_token_expire should be a valid date format."
        }
      }
    },
    /*
     * 0 - InActive
     * 1 - Active
     */
    activation_status: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '0-InActive, 1-Active',
      validate: {
        max: {
          args: 1,
          msg: "activation_status should be less than or equal to 1"
        }
      }
    },
    /*
    * 0 - Paypal
    * 1 - PayUMoney
    */
    payment_type: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-Paypal, 1-PayUmoney"
    },

    last_payment_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    },

    /*
     * 0 - unpaid
     * 1 - paid
     */
    payment_status: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '0-UnPaid, 1-Paid',
      validate: {
        max: {
          args: 1,
          msg: "payment_status should be less than or equal to 1"
        }
      }
    },
    activate_2step_verification: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    shortenStatus: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-normal, 1-firebase"
    },
    /*
     * 0 - Manually
     * 1 - Google 
     * 2 - Facebook
     * 3 - Amember    
     */
    signup_type: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
      comments: '0-Manually, 1-Google, 2-Facebook,3-Twitter,4-Github',
      validate: {
        max: {
          args: 4,
          msg: "signup_type should be less than or equal to 2"
        }
      }
    },
    /*
     * 0 - Basic
     * 1 - Standard
     * 2 - Premium
     * 3 - Deluxe
     * 4 - Topaz
     * 5 - Ruby
     * 6 - Gold
     * 7 - Platinum
     */
    user_plan: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "0-Basic, 1-Standard, 2-Premium, 3-Deluxe, 4-Topaz, 5-Ruby, 6-Gold, 7-Platinum"
    },
    created_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      validate: {
        max: {
          args: 2,
          msg: "user_plan should be less than or equal to 7"
        }
      }
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
    },
    account_expire_date: {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "account_expire_date should be a valid date format."
        }
      }
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "last_login should be a valid date format."
        }
      }
    },
    otp_token: {
      type: Sequelize.STRING(32),
      allowNull: true,
      comment: 'first half for email, next half for phone'
    },
    otp_token_expire: {
      type: Sequelize.DATE, allowNull: true, validate: {
        isDate: {
          args: true,
          msg: "otp_token_expire should be a valid date format."
        }
      }, comment: 'expires in 10 minutes'
    },
    /*
    * 0 - InActive
    * 1 - Active
    */
    send_expire_mail: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '0-InActive, 1-Active',
      validate: {
        max: {
          args: 1,
          msg: "activation_status should be less than or equal to 1"
        }
      }
    },
    /*
    * 0 - InActive
    * 1 - Active
    */
    send_feature_mail: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '0-InActive, 1-Active',
      validate: {
        max: {
          args: 1,
          msg: "activation_status should be less than or equal to 1"
        }
      }
    },
    /*
    * 0 - sent
    * 1 - not sent
    */
    sent_expired_mail: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '0-InActive, 1-Active',
      validate: {
        max: {
          args: 1,
          msg: "activation_status should be less than or equal to 1"
        }
      }
    }
  },
    {
      sequelize,
      modelName: 'user_activations',
    });
  user_activations.beforeCreate(async (instance, options) => {
    instance.email_token_expire = moment().add(1, 'days');
    instance.forgot_password_token_expire = moment().add(1, 'days');
    instance.direct_login_token_expire = moment().add(1, 'days');
  });

  return user_activations;
};