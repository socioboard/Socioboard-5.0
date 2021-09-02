import config from 'config';

export const SERVER = config.get('user_socioboard.host_url') ?? 'http://localhost:5000';

export const CHECK_EMAIL_AVAILABILITY = '/v1/check-email-availability';

export const CHECK_USERNAME_AVAILABILITY = '/v1/check-username-availability';

export const FORGOT_PASSWORD = '/v1/forgot-password';

export const LOGIN = '/v1/login';

export const REGISTER = '/v1/register';

export const VERIFY_EMAIL = '/v1/verify-email';

export const VERIFY_PASSWORD_TOKEN = '/v1/verify-password-token';

export const RESET_PASSWORD = '/v1/reset-password';

export const DIRECT_LOGIN_MAIL = '/v1/direct-login-mail';

export const VERIFY_DIRECT_LOGIN_TOKEN = '/v1/verify-direct-login-token';

export const DIRECT_LOGIN = '/v1/direct-login';

export const UN_HOLD_USER = '/v1/un-hold-user';

export const VERIFY_UN_HOLD_TOKEN = '/v1/verify-unhold-token';

export const SOCIAL_LOGIN = '/v1/social-login';

export const GET_MAIL_ACTIVATION_LINK = '/v1/get-mail-activation-link';

export const GET_PLAN_DETAILS = '/v1/get-plan-details';

export const FACEBOOK_CALLBACK = '/v1/facebook-callback';

export const GOOGLE_CALLBACK = '/v1/google-callback';

export const GITHUB_CALLBACK = '/v1/github-callback';

export const TWITTER_CALLBACK = '/v1/twitter-callback';

export const CHANGE_PASSWORD = '/v1/user/change-password';

export const DELETE_USER = '/v1/user/delete-user';

export const HOLD_USER = '/v1/user/hold-user';

export const GET_USER_INFO = '/v1/user/get-user-info';

export const UPDATE_PROFILE_DETAILS = '/v1/user/update-profile-details';

export const CHANGE_PLAN = '/v1/user/change-plan';

export const GET_DETAILS = '/v1/team/get-details';

export const GET_TEAM_SOCIAL_ACCOUNTS = '/v1/team/get-team-social-accounts';

export const GET_SOCIAL_PROFILES = '/v1/team/get-social-profiles';

export const GET_SOCIAL_PROFILES_BY_ID = '/v1/team/get-social-profiles-by-id';

export const SEARCH_SOCIAL_ACCOUNTS = '/v1/team/search-social-accounts';

export const UPDATE_RATINGS = '/v1/team/update-ratings';

export const LOCK_PROFILES = '/v1/team/lock-profiles';

export const UNLOCK_PROFILES = '/v1/team/unlock-profiles';

export const UPDATE_FEED_CRON = '/v1/team/update-feed-cron';

export const CREATE = '/v1/team/create';

export const EDIT = '/v1/team/edit';

export const DELETE = '/v1/team/delete';

export const INVITE = '/v1/team/invite';

export const GET_TEAM_INVITATIONS = '/v1/team/get-team-invitations';

export const ACCEPT_INVITATION = '/v1/team/accept-invitation';

export const DECLINE_TEAM_INVITATION = '/v1/team/decline-team-invitation';

export const WITHDRAW_INVITATION = '/v1/team/withdraw-invitation';

export const REMOVE_TEAM_MEMBER = '/v1/team/remove-teamMember';

export const LEAVE = '/v1/team/leave';

export const EDIT_MEMBER_PERMISSION = '/v1/team/edit-member-permission';

export const GET_TEAM_DETAILS = '/v1/team/get-team-details';

export const ADD_OTHER_TEAM_ACCOUNT = '/v1/team/add-other-team-account';

export const DELETE_TEAM_SOCIAL_PROFILE = '/v1/team/delete-team-social-profile';

export const GET_AVAILABLE_TEAM_MEMBERS = '/v1/team/get-available-team-members';

export const GET_AVAILABLE_INVITED_MEMBERS = '/v1/team/get-available-invited-members';

export const GET_AVAILABLE_SOCIAL_ACCOUNTS = '/v1/team/get-available-social-accounts';

export const LOCK_TEAM = '/v1/team/lock-team';

export const UNLOCK_TEAM = '/v1/team/unlock-team';

export const GET_SOCIAL_ACCOUNT_COUNT = '/v1/team/get-social-account-count';

export const SEARCH_TEAM = '/v1/team/search-team';

export const GET_PROFILE_REDIRECT_URL = '/v1/socialaccount/get-profile-redirect-url';

export const ADD_SOCIAL_PROFILE = '/v1/socialaccount/add-social-profile';

export const GET_YOUTUBE_CHANNELS = '/v1/socialaccount/get-youtube-channels';

export const GET_OWN_FACEBOOK_PAGES = '/v1/socialaccount/get-own-facebookpages';

export const GET_OWN_FACEBOOK_GROUPS = '/v1/socialaccount/get-own-facebookGroups';

export const GET_LINKEDIN_COMPANY_PROFILES = '/v1/socialaccount/get-LinkedInCompany-Profiles';

export const ADD_BULK_SOCIAL_PROFILE = '/v1/socialaccount/add-bulk-social-profile';

export const DELETE_SOCIAL_PROFILE = '/v1/socialaccount/delete-social-profile';

export const GET_RECENT_VISITED = '/v1/recentvisited/get-recent-visited';

export const DELETE_RECENT_VISITED = '/v1/recentvisited/delete-recent-visited';

export const CLEAR_RECENT_VISITED = '/v1/recentvisited/clear-recent-visited';

export const GET_TEAM_SCHEDULER_STATS = '/v1/teamreport/get-team-scheduler-stats';
