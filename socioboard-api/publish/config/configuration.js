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
            "Admin": "Admin"
        },
        "media_event_label": {
            "media_upload_success": "Socio2001: User({{user}}) uploaded media with privacy type({{privacy}}) to team({{teamId}}).",
            "media_upload_failed": "Socio6001: User({{user}}) cant able to upload media with privacy type({{privacy}}) to team({{teamId}}).",

            "media_fetch_success": "Socio2002: User({{user}}) fetched media of team({{teamId}}).",
            "media_fetch_failed": "Socio6002: User({{user}}) cant able to fetch media of team({{teamId}}).",

            "media_delete_success": "Socio2003: User({{user}}) deleted media({{meida}}) of team({{teamId}}).",
            "media_delete_failed": "Socio6003: User({{user}}) cant able to delete specified media of team({{teamId}}).",

            "force_media_delete_success": "Socio2004: User({{user}}) deleted specified media forcefully of team({{teamId}}).",
            "force_media_delete_failed": "Socio6004: User({{user}}) cant able to delete specified media forcefully.",
        },
        "publish_event_label": {
            "post_publish_success": "Socio2051: User({{user}}) published a ({{type}}) type of post from account(s) ({{accountId}}).",
            "post_publish_failed": "Socio6051: User({{user}}) cant able to publish a ({{type}}) type of post from accounts({{accountId}}).",

            "get_drafted_posts": "Socio2052: User({{user}}) fectched the drafted postlists from team({{teamId}}).",
            "get_drafted_posts_failed": "Socio6052: User({{user}}) cant able to fetch the drafted postlists from team({{teamId}}).",

            "get_approval_post_status": "Socio2053: User({{user}}) fetched the approval post status of team({{teamId}}).",
            "get_approval_post_status_failed": "Socio6053: User({{user}}) cant able to fetch the approval post status of team({{teamId}}).",
        },
        "schedule_event_label": {

            "create_schedule": "Socio2101: User({{user}}) successfully created schedule to the team({{teamId}}).",
            "create_schedule_failed": "Socio6101: User({{user}}) cant able to create schedule to the team({{teamId}}).",

            "schedule_details": "Socio2104: User({{user}}) fetched schedule details.",
            "schedule_details_failed": "Socio6104: User({{user}}) cant able to fetch schedule details.",

            "filtered_schedule_details": "Socio2105: User({{user}}) fetched filtered schedules by status({{status}}).",
            "filtered_schedule_details_failed": "Socio6105: User({{user}}) cant able to fetch filtered schedules by status({{status}}).",

            "schedule_change": "Socio2106: User({{user}}) successfully changed schedule status({{status}}).",
            "schedule_change_failed": "Socio6106: Socio2016: User({{user}}) cant able to change schedule status({{status}}).",

            "schedule_delete": "Socio2107: User({{user}}) successfully deleted schedule({{scid}}).",
            "schedule_delete_failed": "Socio6107: User({{user}}) cant able to delete schedule({{scid}}).",

            "schedule_edit": "Socio2108: User({{user}}) successfully edited schedule({{scid}}).",
            "schedule_edit_failed": "Socio6108: User({{user}}) cant able to edit schedule({{scid}}).",

            "schedule_cancel": "Socio2108: User({{user}}) successfully cancelled schedule({{scid}}).",
            "schedule_cancel_failed": "Socio2108: User({{user}}) successfully cant able to cancel schedule({{scid}}).",

            "filtered_schedule_details_with_category": "Socio2109: User({{user}}) fetched filtered schedules by status({{status}}) of category({{category}}).",
            "filtered_schedule_details_with_category_failed": "Socio6109: User({{user}}) cant able to fetch filtered schedules by status({{status}}) of category({{category}}).",

            "start_cron": "User({{user}}) started Cron.",
            "start_cron_failed": "User({{user}}) cant able to start Cron.",
        },

        "task_event_module": {
            "get_tasks": "Socio2201: Admin({{admin}}) of Team({{teamId}}) fetched all Tasks",
            "get_tasks_failed": "Socio6201: Admin({{admin}}) of Team({{teamId}}) cant able to fetch all Tasks",

            "assign_task": "Socio2202: User({{user}}) assigned task({{taskId}})  to a member({{member}}).",
            "assign_task_failed": "Socio6202: User({{user}}) cant able to assign task({{taskId}})  to a member({{member}}).",

            "update_task_status": "Socio2203: Admin({{admin}}) of Team({{teamId}}) updated the task status({{status}}).",
            "update_task_status_failed": "Socio6203: Admin({{admin}}) of Team({{teamId}}) cant able to update the task status({{status}}).",

        },

        "message_event_label": {
            "twitter_message_sending": "Socio2251: User({{user}}) sent message on twitter.",
            "twitter_message_sending_failed": "Socio6251: User({{user}}) cant able to send message on twitter.",
        },

        "report_event_label": {
            "schedule_publish_report": "Socio2351: User({{user}}) fetched scheduled publish report of scheduleId({{mongoId}}).",
            "schedule_publish_report_failed": "Socio6351: User({{user}}) cant able to get fetch scheduled publish report of scheduleId({{mongoId}}).",

            "account_published_report": "Socio2352: User({{user}}) fetched account published report of account({{accountId}}).",
            "account_published_report_failed": "Socio6352: User({{user}}) cant able to fetch account published report of account({{accountId}}).",

            "today_post_count": "Socio2353: User({{user}}) fetched today post count of account({{accountId}}).",
            "today_post_count_failed": "Socio6353: User({{user}}) cant able to fetch today post count of account({{accountId}}).",

            "xday_post_count": "Socio2354: User({{user}}) fetched {{days}} day/s of published data on all accounts.",
            "xday_post_count_failed": "Socio6354: User({{user}}) cant able to fetch {{days}} day/s of published data on all accounts.",


            "account_published_count": "Socio2355: User({{user}}) fetched the published count of all social accounts.",
            "account_published_count_failed": "Socio6355: User({{user}}) cant able to fetch the published count of all social accounts.",


            "twitter_message_list": "Socio2356: User({{user}}) fetched twitter messages.",
            "twitter_message_list_failed": "Socio6356: User({{user}}) cant able to fetch twitter messages.",

            "twitter_messages_between_users": "Socio2357: User({{user}}) fetched the twitter messages processed between two useres.",
            "twitter_messages_between_users_failed": "Socio6357: User({{user}}) cant able to fetch twitter messages between two users.",

            "previously_messaged_users": "Socio2358: User({{user}}) fetched previously messages users details.",
            "previously_messaged_users_failed": "Socio6358: User({{user}}) cant able to fetch previously messages users details. ",

        },

        "admin_event_label": {

            "daywise_schedule": "Socio2451: Admin({{admin}}) started daywise schedule.",
            "daywise_schedule_failed": "Socio6451: Admin({{admin}}) cant able to start day schedule.",

            "onetime_schedule": "Socio2452: Admin({{admin}}) started one time schedule for today.",
            "onetime_schedule_failed": "Socio6452: Admin({{admin}}) cant able to start one time schedule for today.",

            "start_cron": "Socio2453: Admin({{admin}}) started the cron to setup the publisher intializing.",
            "start_cron_failed": "Socio6453: Admin({{admin}}) cant able to start the cron to setup the publisher intializing.",

            "delete_all_schedules": "Socio2454: Admin({{admin}}) deleted all previous schedules of all user.",
            "delete_all_schedules_failed": "Socio6454: Admin({{admin}}) cant able to delete all previous schedules of all user.",

        }

    },
};