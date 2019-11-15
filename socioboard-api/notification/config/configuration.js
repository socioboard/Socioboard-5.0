module.exports = {
    "user_service_events": {
        "anonymous": "anonymous",
        "event_category": "{{user_id}}",
        "event_action": {
            "Notificattion": "Notification",
            "Mail": "Mail",
        },

        //(4001-4050)-(8001-8050)
        "notify_event_lable": {
            "send_team_notification": "Socio4001: User({{user}})(ID: {{id}}) sent a team notification to team({{teamId}}).",
            "send_team_notification_failed": "Socio8001: User({{user}})(ID: {{id}}) cant able to send a team notification to team({{teamId}}).",

            "send_user_notification": "Socio4002: User({{user}})(ID: {{id}}) sent a user notification to team({{user}}).",
            "send_user_notification_failed": "Socio8002: User({{user}})(ID: {{id}}) cant able to send a user notification to team({{user}}).",

            "get_user_notification": "Socio4003: User({{user}})(ID: {{id}}) fetched notification of user({{user}}).",
            "get_user_notification_failed": "Socio8003: User({{user}})(ID: {{id}}) cant able to fetch notification of user({{user}}).",
        },

        //(4051-4100)-(8051-8100)       
        "emails_event_lable": {
            "email_expire": "Socio4051: Admin({{admin}})(ID: {{id}}) sent email to users whos account going to expire in a week.",
            "email_expire_failed": "Socio8051: Admin({{admin}})(ID: {{id}}) cant able to send mail to users whos account going to expire in a week.",

            "email_expired": "Socio4052: Admin({{admin}})(ID: {{id}}) sent mail to users whos account is expired.",
            "email_expired_failed": "Socio8052: Admin({{admin}})(ID: {{id}}) cant able to send mail to users whos account is expired.",

            "recent_login": "Socio4053: Admin({{admin}})(ID: {{id}}) sent mail to the last 3 days inactive users.",
            "recent_login_failed": "Socio8053: Admin({{admin}})(ID: {{id}}) cant able to send mail to the last 3 days inactive users.",

            "notification_email": "Socio4054: Admin({{admin}})(ID: {{id}}) successfully sent notifcation to all active users.",
            "notification_email_failed": "Socio8054: Admin({{admin}})(ID: {{id}}) failed to send notifcation to all active users.",

            "mails_sent_list": "Socio4055: Admin({{admin}})(ID: {{id}}) fetched sent mails of a perticular user({{user}}).",
            "mails_sent_list_failed": "Socio8055: Admin({{admin}})(ID: {{id}}) failed to fetch sent mails of a perticular user({{user}}).",
        }

    }
};
