'use strict';
module.exports = (sequelize, Sequelize) => {
    const social_accounts = sequelize.define('social_accounts', {
        account_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        /**
         * 1-Facebook user,
         * 2-Facebook page, 
         * 3-Facebook group,
         * 4-Twitter, 
         * 5-Instagram,
         * 6-Linkedin Personal,
         * 7-Linkedin Business,
         * 8-Google Plus, 
         * 9-Youtube, 
         * 10-Google analytics,
         * 11-Dailymotion
         */
        account_type: {
            type: Sequelize.INTEGER(1),
            allowNull: false,
            defaultValue: 0,
            comment: '1-Facebook user, 2-Facebook page, 3-Facebook group, 4-Twitter, 5-Instagram, 6-Linkedin Personal, 7-Linkedin Business, 8-Google Plus, 9-Youtube, 10-Google analytics, 11-Dailymotion'
        },
        user_name: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        first_name: {
            type: Sequelize.STRING(64),
            allowNull: true
        },
        last_name: {
            type: Sequelize.STRING(64),
            allowNull: true
        },
        email: {
            type: Sequelize.STRING(64),
            allowNull: true
        },
        social_id: {
            type: Sequelize.STRING(64),
            allowNull: true
        },
        profile_pic_url: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        cover_pic_url: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: 'NA'
        },
        profile_url: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        access_token: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        refresh_token: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: 'NA'
        },
        friendship_counts: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        info: {
            type: Sequelize.TEXT,
            allowNull: true
        },
    }, {});
    social_accounts.associate = function (models) {
        social_accounts.belongsTo(models.user_details, { as: 'Account', foreignKey: 'account_admin_id', targetKey: 'user_id' });
        social_accounts.belongsToMany(models.team_informations, { through: models.join_table_teams_social_accounts, as: 'Team', foreignKey: 'account_id', otherKey: 'team_id' });

        //social_accounts.hasMany(models.pinterest_boards, { as: 'Boards', foreignKey: 'social_account_id', sourceKey: 'account_id' });
    };
    return social_accounts;
};