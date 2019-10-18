module.exports = {
    "user_service_events": {
        "anonymous": "anonymous",
        "event_category": "{{user_id}}",
        "event_action": {
            "Open": "Open",
            "Users": "Users",
            "Teams": "Teams",
            "Profiles": "Profiles",
            "Payment": "Payment",
            "Notificattion": "Notification",
            "Mail": "Mail",
            "AppInsights": "AppInsights",
            "Admin": "Admin"
        },
        // (1001 -1040)- (5001-5040) 
        "unauthorized_event_label": {

            "user_name_avialable": "Socio1001: User name verification success.",
            "user_name_avialable_failed": "Socio5001: User name verification failed.",

            "user_email_avialable": "Socio1002: User email verification success.",
            "user_email_avialable_failed": "Socio5002: User email verification failed.",

            "register": "Socio1003: User signup successfully.",
            "register_failed": "Socio5003: User signup failed.",

            "activation_email_sent": "Socio1004: Activation mail sent.",
            "activation_email_failed": "Socio5004: Activation mail didnt sent.",

            "facebook_register": "Socio1005: Facebook user signup successfully.",
            "facebook_register_failed": "Socio5005: Facebook user signup failed.",

            "google_register": "Socio1006: Google user signup successfully.",
            "google_register_failed": "Socio5006: Google User signup failed.",

            "login_success": "Socio1007: Signin via username and password.",
            "wrong_creds": "Socio5007: Signin failed due to wrong credential.",
            "email_not_activated": "Socio5008: Signin failed due email still not activated.",
            "login_failed": "Socio5009: Signin failed via username and password.",
            "login_twostep_request": "Socio5010: Signin required two step login.",

            "facebook_login": "Socio1011: Signin via facebook.",
            "facebook_login_failed": "Socio5011: Signin failed via facebook.",

            "google_login": "Socio1012: Signin via google.",
            "google_login_failed": "Socio5012: Signin failed via google.",

            "email_verified": "Socio1013: User's e-mail verified successfully.",
            "email_not_verified": "Socio5013: User's e-mail verification failed.",

            "forgot_password_request": "Socio1014: User requested for forgot password.",
            "forgot_password_token_verified": "Socio1015: User's forgot password token verified successfully.",
            "forgot_password_token_failed": "Socio5014: User's forgot password token verification failed.",

            "reset_password_success": "Socio1016: User's password successfully reseted.",
            "reset_password_failed": "Socio5016: User's password not reseted.",

            "change_password_success": "Socio1017: User's password successfully changed.",
            "change_password_failed": "Socio5017: User's password not changed.",

            "mail_activationLink_success": "Socio1018: User fetched mail Activation link",
            "mail_activationLink_failed": "Socio5018: User cant able to fetch mail Activation link",

            "two_step_login_success": "Socio1019: Signin via username and password with two step.",
            "two_step_login_failed": "Socio5019: Signin via username and password, but two step login failed.",

            "plan_expired": "Socio1020: Users plan expired, and switched to basic plan.",
            "plan_expired_failed": "Socio5020: Users plan expired, and cant able to switch account plan as basic.",

            "facebook_redirect_url": "Socio1021: User fethed facebook link to sign-up.",
            "google_redirect_url": "Socio1022: User fetched google link to sign-up.",
            "signup_redirect_url_failed": "Socio5021: User cant able to fetch google link to sign-up.",

            "two_way_auth": "Socio1022: User logged in with 2 way authentication",
            "two_way_auth_failed": "Socio5022: User cant able to logged in with 2 way authentication",

        },

        // (1041 -1100)- (5041 -5100)
        "authorized_event_label": {
            "change_password": "Socio1041: User({{user}})(ID: {{id}}) password has been changed.",
            "change_password_failed": "Socio5041: User({{user}})(ID: {{id}}) password can't able to change.",

            "get_userData_success": "Socio1042: User({{user}})(ID: {{id}}) fetched all details",
            "get_userData_failed": "Socio5042: User({{user}})(ID: {{id}}) cant able to fetch all details",

            "change_plan": "Socio1043: User({{user}})(ID: {{id}}) plan has been changed.",
            "change_plan_failed": "Socio5043: User({{user}})(ID: {{id}}) plan can't able to change.",

            "change_payment_type": "Socio1044: User({{user}})(ID: {{id}}) payment type has been changed.",
            "change_payment_type_failed": "Socio5044: User({{user}})(ID: {{id}}) payemnt type can't able to change.",

            "change_twostep": "Socio1045: User({{user}})(ID: {{id}}) did changes in two step login options.",
            "change_twostep_failed": "Socio5045: User({{user}})(ID: {{id}}) can't able changes in two step login options.",

            "update_profile": "Socio1046: User({{user}})(ID: {{id}}) profile updated successfully.",
            "update_profile_failed": "Socio5046: User({{user}})(ID: {{id}}) profile can't able to update.",

            "short_url": "Socio1047: User({{user}})(ID: {{id}}) fetched short url for ({{url}}).",
            "short_url_failed": "Socio5047: User({{user}})(ID: {{id}}) cant able to fetch short url for ({{url}}).",

            "change_shorten_status": "Socio1048: User({{user}})(ID: {{id}}) changed shorten status to {{status}}.",
            "change_shorten_status_failed": "Socio5048: User({{user}})(ID: {{id}}) cant able to change shorten status to {{status}}.",
        },


        // (1101-1200) - (5101-5200) 
        "team_event_label": {

            "fetch_all_team": "Socio1101: User({{user}})(ID: {{id}}) fetched all team details.",
            "fetch_all_team_failed": "Socio5101: User({{user}})(ID: {{id}}) cant able to fetch all team details.",

            "fetch_team": "Socio1102: User({{user}})(ID: {{id}}) fetched team({{teamId}}) details.",
            "fetch_team_failed": "Socio5102: User({{user}})(ID: {{id}}) cant able to fetch team({{teamId}}) details.",

            "fetch_profiles": "Socio1103: User({{user}})(ID: {{id}}) fetched all social profiles.",
            "fetch_profiles_failed": "Socio5103: User({{user}})(ID: {{id}})  can't able to fetch all social profiles.",

            "create_team": "Socio1104: User({{user}})(ID: {{id}}) created a team({{teamId}}).",
            "create_team_failed": "Socio5104: User({{user}})(ID: {{id}}) cant able to create a team.",

            "edit_team": "Socio1105: User({{user}})(ID: {{id}}) edited a team({{teamId}}).",
            "edit_team_failed": "Socio5105: User({{user}})(ID: {{id}}) cant able to edit a team({{teamId}}).",

            "delete_team": "Socio1106: User({{user}})(ID: {{id}}) deleted a team({{teamId}}).",
            "delete_team_failed": "Socio5106: User({{user}})(ID: {{id}}) cant able to delete a team({{teamId}}).",

            "invite_team": "Socio1107: User({{user}})(ID: {{id}}) invited a member({{email}}) for a team({{teamId}}).",
            "invite_team_failed": "Socio5107: User({{user}})(ID: {{id}}) cant able to invite a member({{email}}) for a team({{teamId}}).",

            "fetch_team_invitation": "Socio1108: User({{user}})(ID: {{id}}) fetched the team invitation.",
            "fetch_team_invitation_failed": "Socio5108: User({{user}})(ID: {{id}}) cant able to fetched the team invitations.",

            "accept_team_invitation": "Socio1109: User({{user}})(ID: {{id}}) accepted the team({{teamId}}) invitation.",
            "accept_team_invitation_failed": "Socio5109: User({{user}})(ID: {{id}}) cant able to accept the team({{teamId}}) invitations.",

            "decline_team_invitation": "Socio1110: User({{user}})(ID: {{id}}) declined the team({{teamId}}) invitation.",
            "decline_team_invitation_failed": "Socio5110: User({{user}})(ID: {{id}}) cant able to decline the team({{teamId}}) invitations.",

            "withdraw_team_invitation": "Socio1111: User({{user}})(ID: {{id}}) withdraw the team({{teamId}}) invitation for email({{email}}).",
            "withdraw_team_invitation_failed": "Socio5111: User({{user}})(ID: {{id}}) cant able to withdraw the team({{teamId}}) invitation for email({{email}}).",

            "profile_redirect_url": "Socio1112: User({{user}})(ID: {{id}}) fetched redirect url of ({{url}}).",
            "profile_redirect_url_failed": "Socio5112: User({{user}})(ID: {{id}}) cant able to fetch redirect url of ({{url}}).",

            "add_social_profile": "Socio1113: User({{user}})(ID: {{id}}) added social profile({{profileId}}).",
            "add_social_profile_failed": "Socio5113: User({{user}})(ID: {{id}}) cant able to add social profile.",

            "bulk_add_social_profile": "Socio1114: User({{user}})(ID: {{id}}) added bulk social profiles to team({{teamId}}).",
            "bulk_add_social_profile_failed": "Socio5114: User({{user}})(ID: {{id}}) cant able to add bulk social profiles to team({{teamId}}).",

            "delete_social_profile": "Socio1115: User({{user}})(ID: {{id}}) deleted a social profile({{profileId}}).",
            "delete_social_profile_failed": "Socio5115: User({{user}})(ID: {{id}}) cant able to delete social profile({{profileId}}).",

            "add_other_team_social_profile": "Socio1116: User({{user}})(ID: {{id}}) added a social profile({{profileId}}) to team({{teamId}}).",
            "add_other_team_social_profile_failed": "Socio5116: User({{user}})(ID: {{id}}) cant able to add a social profile to other team.",

            "delete_current_team_social_profile": "Socio1117: User({{user}})(ID: {{id}}) removed a social profile from the team.",
            "delete_current_team_social_profile_failed": "Socio5117: User({{user}})(ID: {{id}}) cant able to remove a social profile from the team.",

            "leave_team": "Socio1118: User({{user}})(ID: {{id}}) left from the team of ({{TeamId}}).",
            "leave_team_failed": "Socio5118: User({{user}})(ID: {{id}}) can't able to left the team of({{TeamId}}).",

            "edit_permission": "Socio1119: User({{user}})(ID: {{id}}) edited the permission of the user({{user1}}).",
            "edit_permission_failed": "Socio5119: User({{user}})(ID: {{id}}) can't able to edit the permission of the user({{user1}}).",

            "lock_profiles": "Socio1120: User({{user}})(ID: {{id}}) locked some social profiles({{accounts}}).",
            "lock_profiles_failed": "Socio5120: User({{user}})(ID: {{id}}) can't able to lock social profiles({{accounts}}).",

            "unlock_profiles": "Socio1121: User({{user}})(ID: {{id}}) unlocked some social profiles({{accounts}}).",
            "unlock_profiles_failed": "Socio5121: User({{user}})(ID: {{id}}) can't able to unlock social profiles({{accounts}}).",

            "invited_list": "Socio1122: User({{user}})(ID: {{id}}) fetched all his invitations sent list.",
            "invited_list_failed": "Socio5122: User({{user}})(ID: {{id}}) cant able to fetch all his invitations sent list.",

            "fetch_invited_list": "Socio1123: User({{user}})(ID: {{id}}) fetched invited list.",
            "fetch_invited_list_failed": "Socio5123: User({{user}})(ID: {{id}}) cant able to fetch invited list.",

            "remove_team_member": "Socio1124: User({{user}})(ID: {{id}}) removed a member({{memberId}}) from the Team({{teamId}})",
            "remove_team_member_failed": "Socio5124: User({{user}})(ID: {{id}}) cant able to remove a member({{memberId}}) from the Team({{teamId}})",

            "fetch_profiles_byId": "Socio1125: User({{user}})(ID: {{id}}) fetched social profile({{accountId}}) details.",
            "fetch_profiles_byId_failed": "Socio5125: User({{user}})(ID: {{id}})  can't able to fetch social profile({{accountId}}) details.",

        },

        //(1201-1300)-(5201-5300)
        "profile_event_label": {
            "facebook_page_details": "Socio1201: User({{user}})(ID: {{id}}) fetched facebook pages.",
            "facebook_page_details_failed": "Socio5201: User({{user}})(ID: {{id}}) cant able to fetch facebook pages.",

            "facebook_group_details": "Socio1202: User({{user}})(ID: {{id}}) fetched facebook group details of account({{profileId}}) of team({{teamId}}).",
            "facebook_group_details_failed": "Socio5202: User({{user}})(ID: {{id}}) cant able  to fetch facebook group details of account({{profileId}}) of team({{teamId}}).",

            "linkedIn_company_page_details": "Socio1203: User({{user}})(ID: {{id}}) fetched linkedIn company pages.",
            "linkedIn_company_page_details_failed": "Socio5203: User({{user}})(ID: {{id}}) cant able to fetch linkedIn company pages.",

            "youtube_channel_details": "Socio1204: User({{user}})(ID: {{id}}) fetched youtube channel data.",
            "youtube_channel_details_failed": "Socio5204: User({{user}})(ID: {{id}}) cant able to fetch youtube channel data.",

            "google_analytics_details": "Socio1205: User({{user}})(ID: {{id}}) fetched google analytics data.",
            "google_analytics_details_failed": "Socio5205: User({{user}})(ID: {{id}}) cant able to fetch google analytics data.",

            "short_url": "Socio1206: User({{user}})(ID: {{id}}) fetched short url for ({{url}}).",
            "short_url_failed": "Socio5206: User({{user}})(ID: {{id}}) cant able to fetch short url for ({{url}}).",

            "create_pinterest_board": "Socio1207: User({{user}})(ID: {{id}}) created a pinterest board.",
            "create_pinterest_board_failed": "Socio5207: User({{user}})(ID: {{id}}) cant able to create a pinterest board.",

            "fetch_pinterest_board": "Socio1208: User({{user}})(ID: {{id}}) fetched new pinterest boards of account({{profileId}}).",
            "fetch_pinterest_board_failed": "Socio5208: User({{user}})(ID: {{id}}) cant able to fetch new pinterest boards of account({{profileId}}).",

            "delete_pinterest_board": "Socio1209: User({{user}})(ID: {{id}}) deleted a pinterest board({{board}}).",
            "delete_pinterest_board_failed": "Socio5209: User({{user}})(ID: {{id}}) cant able to delete a pinterest board({{board}}).",

            "facebook_own_group_details": "Socio1210: User({{user}})(ID: {{id}}) fetched own facebook group details",
            "facebook_own_group_details_failed": "Socio5210: User({{user}})(ID: {{id}}) cant able to fetch own facebook group details",

            "instagram_business_details": "Socio1211: User({{user}})(ID: {{id}}) fetched instagram business details.",
            "instagram_business_details_failed": "Socio5211: User({{user}})(ID: {{id}}) can't able to fetch instagram business details.",

        },

        //(1301-1350)-(5301-5350)
        "payment_event_label": {

            "fetch_payment_redirect_url": "Socio1301: User({{user}})(ID: {{id}}) fetched payment redirect url for plan({{plan}}) of mode({{mode}}) with couponCode({{coupon}}).",
            "fetch_payment_redirect_url_failed": "Socio5301: User({{user}})(ID: {{id}}) cant able to fetch payment redirect url for plan({{plan}}) of mode({{mode}}) with couponCode({{coupon}}).",

            "payment_success": "Socio1302: User({{user}})(ID: {{id}}) paid successfully.",
            "payment_failed": "Socio5302: User({{user}})(ID: {{id}}) cant able to pay in mode({{mode}}).",
            "payment_under_process": "Socio1303: User(ID: {{id}}) payment is in under processing.",

            "get_last_payment_info": "Socio1304: User({{user}})(ID: {{id}}) fetched last payment data.",
            "get_last_payment_info_failed": "Socio5304: User({{user}})(ID: {{id}}) cant able to fetch last payment data.",

            "get_full_payment_history": "Socio1305: User({{user}})(ID: {{id}}) fetched full payments history.",
            "get_full_payment_history_failed": "Socio5305: User({{user}})(ID: {{id}}) cant able to fetch full payments history.",

            "get_payment_invoice": "Socio1306: User({{user}})(ID: {{id}}) downloaded last payment Invoice.",
            "get_payment_invoice_failed": "Socio5306: User({{user}})(ID: {{id}}) cant able to download last payment Invoice.",

        },

        //(1351-1450)-(5351-5450)
        "notify_event_lable": {
            "send_team_notification": "Socio1351: User({{user}})(ID: {{id}}) sent a team notification to team({{teamId}}).",
            "send_team_notification_failed": "Socio5351: User(ID: {{id}}) cant able to send a team notification to team({{teamId}}).",

            "send_user_notification": "Socio1352: User(ID: {{id}}) sent a user notification to team({{user}}).",
            "send_user_notification_failed": "Socio5352: User(ID: {{id}}) cant able to send a user notification to team({{user}}).",

            "get_user_notification": "Socio1353: User(ID: {{id}}) fetched notification of user({{user}}).",
            "get_user_notification_failed": "Socio5353: User(ID: {{id}}) cant able to fetch notification of user({{user}}).",
        },

        //(1451-1500)-(5451-5500)
        "emails_event_lable": {
            "email_expire": "Socio1451: Admin({{admin}})(ID: {{id}}) sent email to users whos account going to expire in a week.",
            "email_expire_failed": "Socio5451: Admin({{admin}})(ID: {{id}}) cant able to send mail to users whos account going to expire in a week.",

            "email_expired": "Socio1452: Admin({{admin}})(ID: {{id}}) sent mail to users whos account is expired.",
            "email_expired_failed": "Socio5452: Admin({{admin}})(ID: {{id}}) cant able to send mail to users whos account is expired.",

            "recent_login": "Socio1453: Admin({{admin}})(ID: {{id}})  sent mail to the last 3 days inactive users.",
            "recent_login_failed": "Socio5453: Admin({{admin}})(ID: {{id}}) cant able to send mail to the last 3 days inactive users.",

            "notification_email": "Socio1454: Admin({{admin}})(ID: {{id}}) successfully sent notifcation to all active users.",
            "notification_email_failed": "Socio5454: Admin({{admin}})(ID: {{id}}) failed to send notifcation to all active users.",

            "mails_sent_list": "Socio1455: Admin({{admin}})(ID: {{id}}) fetched sent mails of a perticular user({{user}}).",
            "mails_sent_list_failed": "Socio5455: Admin({{admin}})(ID: {{id}}) failed to fetch sent mails of a perticular user({{user}}).",
        },

        //(1501-1550)-(5501-5550)
        "app_insights_event_lable": {

            "get_all_realTime_users": "Socio1501: Admin({{admin}})(ID: {{id}}) fetched all real time users data.",
            "get_all_realTime_users_failed": "Socio5501: Admin({{admin}})(ID: {{id}}) cant able to fetch all real time users data.",

            "get_all_users": "Socio1502: Admin({{admin}})(ID: {{id}}) fetched all user list between {{startdate}} to {{enddate}}.",
            "get_all_users_failed": "Socio5502: Admin({{admin}})(ID: {{id}}) cant able to fetch user list between {{startdate}} to {{enddate}}.",

            "get_user_action_count": "Socio1503: Admin({{admin}})(ID: {{id}}) fetched action count of user({{user}}).",
            "get_user_action_count_failed": "Socio5503: Admin({{admin}})(ID: {{id}}) cant able to fetch action count of user({{user}}).",

            "get_user_activities": "Socio1504: Admin({{admin}})(ID: {{id}}) fetched activitites of user({{user}}).",
            "get_user_activities_failed": "Socio5504: Admin({{admin}})(ID: {{id}}) cant able to fetch activitites of user({{user}}).",

            "get_user_realTime_activities": "Socio1505: Admin({{admin}})(ID: {{id}}) fetched real time activitites of user({{user}}).",
            "get_user_realTime_activities_failed": "Socio5505: Admin({{admin}})(ID: {{id}}) cant able to fetch real time activitites of user({{user}}).",

            "get_user_activities_by_action": "Socio1506: Admin({{admin}})(ID: {{id}}) fetched activitites of user({{user}}) with action({{action}}).",
            "get_user_activities_by_action_failed": "Socio5506: Admin({{admin}})(ID: {{id}}) cant able to fetch activitites of user({{user}}) with action({{action}}).",

            "get_today_action_count": "Socio1507: Admin({{admin}})(ID: {{id}}) fetched todays action counts for all users.",
            "get_today_action_count_failed": "Socio5507: Admin({{admin}})(ID: {{id}}) cant able to fetch todays action count for all users.",

            "get_user_activities_byDate": "Socio1504: Admin({{admin}})(ID: {{id}}) fetched activitites of user({{user}}) between date {{startDate}} to {{endDate}}.",
            "get_user_activities_byDate_failed": "Socio5504: Admin({{admin}})(ID: {{id}}) cant able to fetch activitites of user({{user}}) between date {{startDate}} to {{endDate}}.",
        },

        //(1551-1650)-(5551-5650)
        "admin_event_lable": {

            "get_user_stats": "Socio1551: Admin({{admin}})(ID: {{id}}) fetched user stats.",
            "get_user_stats_failed": "Socio5551: Admin({{admin}})(ID: {{id}}) cant able to fetch user stats.",

            "get_monthly_user_stats": "Socio1551: Admin({{admin}})(ID: {{id}}) fetched user monthly stats.",
            "get_monthly_user_stats_failed": "Socio5551: Admin({{admin}})(ID: {{id}}) cant able to fetch user monthly stats.",

            "get_users": "Socio1553: Admin({{admin}})(ID: {{id}}) fetched all users.",
            "get_users_failed": "Socio5553: Admin({{admin}})(ID: {{id}}) cant able to fetch all users.",

            "user_payment_hystory": "Socio1554: Admin({{admin}})(ID: {{id}}) fetched user payment history of user({{user}}).",
            "user_payment_hystory_failed": "Socio5554: Admin({{admin}})(ID: {{id}}) cant able to fetch user payment history of user({{user}}).",

            "update_user_lock": "Socio1555: Admin({{admin}})(ID: {{id}}) updated user({{user}}) activation state.",
            "update_user_lock_failed": "Socio5555: Admin({{admin}})(ID: {{id}}) cant able to update user({{user}}) activation state.",

            "update_plan_for_trail": "Socio1556: Admin({{admin}})(ID: {{id}}) updated a plan({{planId}}) of trail period days({{days}}) for user({{user}}).",
            "update_plan_for_trail_failed": "Socio5556: Admin({{admin}})(ID: {{id}}) cant able to update a plan({{planId}}) of trail period days({{days}}) for user({{user}}).",

            "update_two_step": "Socio1557: Admin({{admin}})(ID: {{id}}) updated a user({{user}}) two step verification process to({{value}}).",
            "update_two_step_failed": "Socio5557: Admin({{admin}})(ID: {{id}}) updated a user({{user}}) two step verification process to({{value}}).",

            "get_packages": "Socio1558: Admin({{admin}})(ID: {{id}}) feteched all packages.",
            "get_packages_failed": "Socio5558: Admin({{admin}})(ID: {{id}}) cant able to fetch all packages.",

            "add_packages": "Socio1559: Admin({{admin}})(ID: {{id}}) added a package.",
            "add_packages_failed": "Socio5559: Admin({{admin}})(ID: {{id}}) cant able to add a package.",

            "edit_packages": "Socio1560: Admin({{admin}})(ID: {{id}}) edited a package({{package}}).",
            "edit_packages_failed": "Socio5560: Admin({{admin}})(ID: {{id}}) cant able to edit a package({{package}}).",

            "update_package_activation": "Socio1561: Admin({{admin}})(ID: {{id}}) updated package({{package}}) status to({{value}}).",
            "update_package_activation_failed": "Socio5561: Admin({{admin}})(ID: {{id}}) cant able to update package({{package}}) status to({{value}}).",

            "create_coupons": "Socio1562: Admin({{admin}})(ID: {{id}}) created a coupon({{coupon}}).",
            "create_coupons_failed": "Socio5562: Admin({{admin}})(ID: {{id}}) cant able to create a coupon({{coupon}}).",

            "change_coupon_status": "Socio1563: Admin({{admin}})(ID: {{id}}) changed coupon({{coupon}}) status{{status}}.",
            "change_coupon_status_failed": "Socio5563: Admin({{admin}})(ID: {{id}}) cant able to change coupon({{coupon}}) status{{status}}.",

            "get_coupons": "Socio1564: Admin({{admin}})(ID: {{id}}) fetched all coupons details.",
            "get_coupons_failed": "Socio5564: Admin({{admin}})(ID: {{id}}) cant able to fetch all coupons details.",

            "get_user_applied_coupons": "Socio1565: Admin({{admin}})(ID: {{id}}) fetched all coupons used by an user({{user}}).",
            "get_user_applied_coupons_failed": "Socio5565: Admin({{admin}})(ID: {{id}}) cant able to fetch all coupons used by an user({{user}}).",

            "get_unverified_payments": "Socio1566: Admin({{admin}})(ID: {{id}}) fetched all un-verified payments of payment mode({{type}}).",
            "get_unverified_payments_failed": "Socio5566: Admin({{admin}})(ID: {{id}}) cant able to fetch all un-verified payments of payment mode({{type}}).",

            "verify_payment": "Socio1567: Admin({{admin}})(ID: {{id}}) verified payment id({{payment}}) of user({{user}}).",
            "verify_payment_failed": "Socio5567: Admin({{admin}})(ID: {{id}}) cant able to verify payment id({{payment}}) of user({{user}}).",

            "recent_signup": "Socio1568: Admin({{admin}})(ID: {{id}}) fetched recent signup users with filtertype({{filter}})",
            "recent_signup_failed": "Socio5568: Admin({{admin}})(ID: {{id}}) cant able to fetch recent signup users with filtertype({{filter}})",

        }

    }
};
