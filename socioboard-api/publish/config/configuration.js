module.exports = {
    "publiser_service_events": {
        "event_category": "{{user_id}}",
        "event_action":
        {
            "Media": "Media",
            "Publish": "Publish",
            "Scheduler": "Scheduler",
            "Task": "Task",
            "Message": "Message",
            "Report": "Report",
            "Admin": "Admin",
            "Rss": "Rss"
        },

        "media_event_label": {
            "media_upload_success": "Socio2001: User({{user}})(ID: {{id}}) uploaded media with privacy type({{privacy}}) to team({{teamId}}).",
            "media_upload_failed": "Socio6001: User({{user}})(ID: {{id}}) cant able to upload media with privacy type({{privacy}}) to team({{teamId}}).",

            "media_fetch_success": "Socio2002: User({{user}})(ID: {{id}}) fetched media of team({{teamId}}).",
            "media_fetch_failed": "Socio6002: User({{user}})(ID: {{id}}) cant able to fetch media of team({{teamId}}).",

            "media_delete_success": "Socio2003: User({{user}})(ID: {{id}}) deleted media({{meida}}) of team({{teamId}}).",
            "media_delete_failed": "Socio6003: User({{user}})(ID: {{id}}) cant able to delete specified media of team({{teamId}}).",

            "force_media_delete_success": "Socio2004: User({{user}})(ID: {{id}}) deleted specified media forcefully of team({{teamId}}).",
            "force_media_delete_failed": "Socio6004: User({{user}})(ID: {{id}}) cant able to delete specified media forcefully.",
        },

        "publish_event_label": {
            "post_publish_success": "Socio2051: User({{user}})(ID: {{id}}) published a ({{type}}) type of post from account(s) ({{accountId}}).",
            "post_publish_failed": "Socio6051: User({{user}})(ID: {{id}}) cant able to publish a ({{type}}) type of post from accounts({{accountId}}).",

            "get_drafted_posts": "Socio2052: User({{user}})(ID: {{id}}) fectched the drafted postlists from team({{teamId}}).",
            "get_drafted_posts_failed": "Socio6052: User({{user}})(ID: {{id}}) cant able to fetch the drafted postlists from team({{teamId}}).",

            "get_approval_post_status": "Socio2053: User({{user}})(ID: {{id}}) fetched the approval post status of team({{teamId}}).",
            "get_approval_post_status_failed": "Socio6053: User({{user}})(ID: {{id}}) cant able to fetch the approval post status of team({{teamId}}).",
        },

        "schedule_event_label": {
            "create_schedule": "Socio2101: User({{user}})(ID: {{id}}) successfully created schedule to the team({{teamId}}).",
            "create_schedule_failed": "Socio6101: User({{user}})(ID: {{id}}) cant able to create schedule to the team({{teamId}}).",

            "schedule_details": "Socio2104: User({{user}})(ID: {{id}}) fetched schedule details.",
            "schedule_details_failed": "Socio6104: User({{user}})(ID: {{id}}) cant able to fetch schedule details.",

            "getParticularSchedule_details": "Socio2111: User({{user}})(ID: {{id}}) fetched schedule details of a particular schedule({{scId}}).",
            "getParticularSchedule_details_failed": "Socio6111: User({{user}})(ID: {{id}}) cant able to fetch schedule details of a particular schedule({{scId}}).",

            "filtered_schedule_details": "Socio2105: User({{user}})(ID: {{id}}) fetched filtered schedules by status({{status}}).",
            "filtered_schedule_details_failed": "Socio6105: User({{user}})(ID: {{id}}) cant able to fetch filtered schedules by status({{status}}).",

            "schedule_change": "Socio2106: User({{user}})(ID: {{id}}) successfully changed schedule status({{status}}).",
            "schedule_change_failed": "Socio6106: Socio2016: User({{user}})(ID: {{id}}) cant able to change schedule status({{status}}).",

            "schedule_delete": "Socio2107: User({{user}})(ID: {{id}}) successfully deleted schedule({{scid}}).",
            "schedule_delete_failed": "Socio6107: User({{user}})(ID: {{id}}) cant able to delete schedule({{scid}}).",

            "schedule_edit": "Socio2108: User({{user}})(ID: {{id}}) successfully edited schedule({{scid}}).",
            "schedule_edit_failed": "Socio6108: User({{user}})(ID: {{id}}) cant able to edit schedule({{scid}}).",

            "schedule_cancel": "Socio2108: User({{user}})(ID: {{id}}) successfully cancelled schedule({{scid}}).",
            "schedule_cancel_failed": "Socio2108: User({{user}})(ID: {{id}}) successfully cant able to cancel schedule({{scid}}).",

            "filtered_schedule_details_with_category": "Socio2109: User({{user}})(ID: {{id}}) fetched filtered schedules by status({{status}}) of category({{category}}).",
            "filtered_schedule_details_with_category_failed": "Socio6109: User({{user}})(ID: {{id}}) cant able to fetch filtered schedules by status({{status}}) of category({{category}}).",

            "start_cron": "Socio2110: User({{user}})(ID: {{id}}) started Cron.",
            "start_cron_failed": "Socio6110: User({{user}})(ID: {{id}}) cant able to start Cron.",
        },

        "task_event_module": {
            "get_tasks": "Socio2201: Admin({{admin}})(ID: {{id}}) of Team({{teamId}}) fetched all Tasks",
            "get_tasks_failed": "Socio6201: Admin({{admin}})(ID: {{id}}) of Team({{teamId}}) cant able to fetch all Tasks",

            "assign_task": "Socio2202: User({{user}})(ID: {{id}}) assigned task({{taskId}})  to a member({{member}}).",
            "assign_task_failed": "Socio6202: User({{user}})(ID: {{id}}) cant able to assign task({{taskId}})  to a member({{member}}).",

            "update_task_status": "Socio2203: Admin({{admin}})(ID: {{id}}) of Team({{teamId}}) updated the task status({{status}}).",
            "update_task_status_failed": "Socio6203: Admin({{admin}})(ID: {{id}}) of Team({{teamId}}) cant able to update the task status({{status}}).",
        },

        "message_event_label": {
            "twitter_message_sending": "Socio2251: User({{user}})(ID: {{id}}) sent message on twitter.",
            "twitter_message_sending_failed": "Socio6251: User({{user}})(ID: {{id}}) cant able to send message on twitter.",
        },

        "report_event_label": {
            "schedule_publish_report": "Socio2351: User({{user}})(ID: {{id}}) fetched scheduled publish report of scheduleId({{mongoId}}).",
            "schedule_publish_report_failed": "Socio6351: User({{user}})(ID: {{id}}) cant able to get fetch scheduled publish report of scheduleId({{mongoId}}).",

            "account_published_report": "Socio2352: User({{user}})(ID: {{id}}) fetched account published report of account({{accountId}}).",
            "account_published_report_failed": "Socio6352: User({{user}})(ID: {{id}}) cant able to fetch account published report of account({{accountId}}).",

            "today_post_count": "Socio2353: User({{user}})(ID: {{id}}) fetched today post count of account({{accountId}}).",
            "today_post_count_failed": "Socio6353: User({{user}})(ID: {{id}}) cant able to fetch today post count of account({{accountId}}).",

            "xday_post_count": "Socio2354: User({{user}})(ID: {{id}}) fetched {{days}} day/s of published data on all accounts.",
            "xday_post_count_failed": "Socio6354: User({{user}})(ID: {{id}}) cant able to fetch {{days}} day/s of published data on all accounts.",

            "account_published_count": "Socio2355: User({{user}})(ID: {{id}}) fetched the published count of all social accounts.",
            "account_published_count_failed": "Socio6355: User({{user}})(ID: {{id}}) cant able to fetch the published count of all social accounts.",

            "twitter_message_list": "Socio2356: User({{user}})(ID: {{id}}) fetched twitter messages.",
            "twitter_message_list_failed": "Socio6356: User({{user}})(ID: {{id}}) cant able to fetch twitter messages.",

            "twitter_messages_between_users": "Socio2357: User({{user}})(ID: {{id}}) fetched the twitter messages processed between two useres.",
            "twitter_messages_between_users_failed": "Socio6357: User({{user}})(ID: {{id}}) cant able to fetch twitter messages between two users.",

            "previously_messaged_users": "Socio2358: User({{user}})(ID: {{id}}) fetched previously messages users details.",
            "previously_messaged_users_failed": "Socio6358: User({{user}})(ID: {{id}}) cant able to fetch previously messages users details. ",
        },

        "admin_event_label": {
            "daywise_schedule": "Socio2451: Admin({{admin}})(ID: {{id}}) started daywise schedule.",
            "daywise_schedule_failed": "Socio6451: Admin({{admin}})(ID: {{id}}) cant able to start day schedule.",

            "onetime_schedule": "Socio2452: Admin({{admin}})(ID: {{id}}) started one time schedule for today.",
            "onetime_schedule_failed": "Socio6452: Admin({{admin}})(ID: {{id}}) cant able to start one time schedule for today.",

            "start_cron": "Socio2453: Admin({{admin}})(ID: {{id}}) started the cron to setup the publisher intializing.",
            "start_cron_failed": "Socio6453: Admin({{admin}})(ID: {{id}}) cant able to start the cron to setup the publisher intializing.",

            "delete_all_schedules": "Socio2454: Admin({{admin}})(ID: {{id}}) deleted all previous schedules of all user.",
            "delete_all_schedules_failed": "Socio6454: Admin({{admin}})(ID: {{id}}) cant able to delete all previous schedules of all user.",
        },

        "rss_event_label": {
            "create_rss_schedule": "Socio2554: User({{user}})(ID: {{id}}) successfully created Rss schedule for team({{teamId}}).",
            "create_rss_schedule_failed": "Socio6554: User({{user}})(ID: {{id}}) cant able to create Rss schedule for team({{teamId}}).",

            "edit_rss_schedule": "Socio2554: User({{user}})(ID: {{id}}) successfully edited Rss schedule of schedulId({{scid}}) of team({{teamId}}).",
            "edit_rss_schedule_failed": "Socio2554: User({{user}})(ID: {{id}}) cant able to edit Rss schedule of schedulId({{scid}}) of team({{teamId}}).",
        }

    },
};