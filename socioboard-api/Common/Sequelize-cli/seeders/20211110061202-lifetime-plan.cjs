'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      'application_informations',
      [
        {
          plan_id: '101',
          plan_name: 'socioboard_tier1',
          plan_price: '59.00',
          is_plan_active: '1',
          account_count: '100000',
          member_count: '50',
          available_network: '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17',
          browser_extension: '1',
          scheduling_posting: '1',
          mobile_apps: '0',
          support_24_7: '0',
          crm: '1',
          calendar: '1',
          rss_feeds: '1',
          social_report: '1',
          discovery: '1',
          twitter_engagement: '1',
          link_shortening: '1',
          shareathon: '1',
          content_studio: '1',
          team_report: '1',
          board_me: '0',
          share_library: '1',
          custom_report: '0',
          maximum_referal_count: '200',
          maximum_schedule: '200',
        },
        {
          plan_id: '102',
          plan_name: 'socioboard_tier2',
          plan_price: '119.00',
          is_plan_active: '1',
          account_count: '100000',
          member_count: '100',
          available_network: '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17',
          browser_extension: '1',
          scheduling_posting: '1',
          mobile_apps: '0',
          support_24_7: '0',
          crm: '1',
          calendar: '1',
          rss_feeds: '1',
          social_report: '1',
          discovery: '1',
          twitter_engagement: '1',
          link_shortening: '1',
          shareathon: '1',
          content_studio: '1',
          team_report: '1',
          board_me: '1',
          share_library: '1',
          custom_report: '1',
          maximum_referal_count: '300',
          maximum_schedule: '500',
        },
        {
          plan_id: '103',
          plan_name: 'socioboard_tier3',
          plan_price: '179.00',
          is_plan_active: '1',
          account_count: '200000',
          member_count: '200000',
          available_network: '1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17',
          browser_extension: '1',
          scheduling_posting: '1',
          mobile_apps: '0',
          support_24_7: '0',
          crm: '1',
          calendar: '1',
          rss_feeds: '1',
          social_report: '1',
          discovery: '1',
          twitter_engagement: '1',
          link_shortening: '1',
          shareathon: '1',
          content_studio: '1',
          team_report: '1',
          board_me: '1',
          share_library: '1',
          custom_report: '1',
          maximum_referal_count: '500',
          maximum_schedule: '1000',
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('application_informations', null, {});
  },
};
