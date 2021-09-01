export const phproutes = {
  boards: [{
    nodeapi: 'create-board',
    phproutes: 'boards/view-boards',
    subcategory: 'Created Board',
  },
  {
    nodeapi: 'get-all-boards',
    phproutes: 'boards/view-boards',
    subcategory: 'Viewed all boards list',
  }, {
    nodeapi: 'update-board',
    phproutes: 'boards/view-boards',
    subcategory: 'Updated the board details',
  },
  {
    nodeapi: 'delete-board',
    phproutes: 'boards/view-boards',
    subcategory: 'Deleted the board details',
  }],
  trends: [{
    nodeapi: 'get-giphy',
    phproutes: 'discovery/content_studio/dailymotion?pageId=1&keyword=news&rating=visited',
    subcategory: 'View giphy feeds',
  },
  {
    nodeapi: 'get-imgur',
    phproutes: 'discovery/content_studio/imgur',
    subcategory: 'Viewed imgur feeds',
  },
  {
    nodeapi: 'get-flickr',
    phproutes: 'discovery/content_studio/flickr',
    subcategory: 'Viewed flickr feeds',
  }, {
    nodeapi: 'get-daily-motion',
    phproutes: 'discovery/content_studio/dailymotion',
    subcategory: 'Viewed daily-motion feeds',
  },
  {
    nodeapi: 'get-news-api',
    phproutes: 'discovery/content_studio/news_api',
    subcategory: 'Viewed news-api feeds',
  },
  {
    nodeapi: 'get-pixabay',
    phproutes: 'discovery/content_studio/pixabay',
    subcategory: 'Viewed pixabay feeds',
  },
  {
    nodeapi: 'get-youtube',
    phproutes: 'discovery/youtube',
    subcategory: 'Viewed Youtube feeds',
  },
  {
    nodeapi: 'get-Twitter',
    phproutes: 'discovery/twitter',
    subcategory: 'Viewed Twitter feeds',
  },
  {
    nodeapi: 'get-giphy',
    phproutes: 'discovery/content_studio/giphy',
    subcategory: 'Viewed Giphy feeds',
  },
  {
    nodeapi: 'get-imgur',
    phproutes: 'discovery/content_studio/imgur',
    subcategory: 'Viewed Imgur feeds',
  },
  {
    nodeapi: 'get-flickr',
    phproutes: 'discovery/content_studio/flickr',
    subcategory: 'Viewed Flicker feeds',
  },
  {
    nodeapi: 'get-daily-motion',
    phproutes: 'discovery/content_studio/dailymotion',
    subcategory: 'Viewed Dailymotion feeds',
  },
  {
    nodeapi: 'get-news-api',
    phproutes: 'discovery/content_studio/news_api',
    subcategory: 'Viewed News-Api feeds',
  },
  {
    nodeapi: 'get-pixabay',
    phproutes: 'discovery/content_studio/pixabay',
    subcategory: 'Viewed Pixabay feeds',
  },
  ],
  feeds: [{
    nodeapi: 'get-rss-feeds',
    phproutes: 'discovery/rss-feeds',
    subcategory: 'Viewed RSS feeds',
  },
  {
    nodeapi: '​get-recent-rssurls',
    phproutes: 'discovery/rss-feeds',
    subcategory: 'Viewed RSS feeds',
  },
  {
    nodeapi: 'get-bookmarked-rssurls',
    phproutes: 'discovery/rss-feeds',
    subcategory: 'Viewed RSS feeds',
  },
  {
    nodeapi: 'update-rss-urls',
    phproutes: 'discovery/rss-feeds',
    subcategory: 'View RSS feeds',
  },
  {
    nodeapi: 'get-tweets',
    phproutes: 'feeds/twitter',
    subcategory: 'Viewed Twitter feeds',
  },
  {
    nodeapi: 'get-recent-feeds',
    phproutes: 'feeds/facebook',
    subcategory: 'Viewed Facebook feeds',
  },
  {
    nodeapi: 'get-recent-page-feeds',
    phproutes: 'feeds/facebook',
    subcategory: 'Viewed Facebook feeds',
  },
  {
    nodeapi: 'get-youtube-feeds',
    phproutes: 'feeds/youtube',
    subcategory: 'Viewed Youtube feeds',
  },
  ],
  user: [{
    nodeapi: 'change-password',
    phproutes: 'profile-update',
    subcategory: 'Updated password',
  },
  {
    nodeapi: 'hold-user',
    phproutes: 'profile-update',
    subcategory: 'View profile',
  },
  {
    nodeapi: 'get-user-info',
    phproutes: 'profile-update',
    subcategory: 'Updated User informations',
  },
  {
    nodeapi: 'update-profile-details',
    phproutes: 'profile-update',
    subcategory: 'Updated profile details',
  },
  {
    nodeapi: 'change-plan',
    phproutes: 'profile-update',
    subcategory: 'Changed Plan details',
  }],
  team: [{
    nodeapi: 'get-details',
    phproutes: 'view-teams',
    subcategory: 'Viewed all teams list',
  },
  {
    nodeapi: 'update-ratings',
    phproutes: 'view-teams',
    subcategory: 'Viewed all teams list',
  },
  {
    nodeapi: 'lock-profiles',
    phproutes: 'view-teams',
    subcategory: 'Viewed all teams list',
  },
  {
    nodeapi: 'update-feed-cron',
    phproutes: 'view-teams',
    subcategory: 'Viewed all teams list',
  },
  {
    nodeapi: 'create',
    phproutes: 'view-teams',
    subcategory: 'Created new team',
  },
  {
    nodeapi: 'edit',
    phproutes: 'view-teams',
    subcategory: 'Viewed all teams list',
  },
  {
    nodeapi: 'delete',
    phproutes: 'view-teams',
    subcategory: 'Deleted team detail',
  },
  {
    nodeapi: 'invite',
    phproutes: 'view-teams',
    subcategory: 'Invited member to team',
  },
  {
    nodeapi: 'accept-invitation',
    phproutes: 'view-teams',
    subcategory: 'Accepted team invitation',
  },
  {
    nodeapi: 'decline-team-invitation',
    phproutes: 'view-teams',
    subcategory: 'Declined team invitations',
  },
  {
    nodeapi: 'withdraw-invitation',
    phproutes: 'view-teams',
    subcategory: 'Withdrawn team invitation',
  },
  {
    nodeapi: 'remove-teamMember',
    phproutes: 'view-teams',
    subcategory: 'Removed member form team',
  },
  {
    nodeapi: 'leave',
    phproutes: 'view-teams',
    subcategory: 'Leaved the team',
  },
  {
    nodeapi: 'edit-member-permission',
    phproutes: 'view-teams',
    subcategory: 'Viewed all team list',
  },
  {
    nodeapi: 'get-team-details',
    phproutes: 'view-teams',
    subcategory: 'Viewed all team list',
  },
  {
    nodeapi: 'add-other-team-account',
    phproutes: 'view-teams',
    subcategory: 'Viewed all team list',
  },
  {
    nodeapi: 'lock-team',
    phproutes: 'view-teams',
    subcategory: 'View Teams',
  },
  {
    nodeapi: 'unlock-team',
    phproutes: 'view-teams',
    subcategory: 'View Teams',
  },
  ],
  upload: [{
    nodeapi: 'media',
    phproutes: 'imagelibary/private-images',
    subcategory: 'Viewed private-Image library',
  },
  {
    nodeapi: '​get-media-details',
    phproutes: 'imagelibary/public-images',
    subcategory: 'Viewed Public-Image library',
  },
  {
    nodeapi: 'delete-media',
    phproutes: 'imagelibary/private-images',
    subcategory: 'Viewed Public-Image library',
  },
  ],
  publish: [{
    nodeapi: 'get-tasks',
    phproutes: 'discovery/rss-feeds',
    subcategory: 'Viewed RSS feeds',
  },
  {
    nodeapi: 'publishPosts',
    phproutes: 'home/publishing/scheduling',
    subcategory: 'Published a post',
  },
  ],
  networkinsight: [{
    nodeapi: 'get-team-insight',
    phproutes: 'get-team-reports',
    subcategory: 'Viewed Team Reports',
  },
  {
    nodeapi: 'get-twitter-insight',
    phproutes: 'get-twitter-reports',
    subcategory: 'Viewed Twitter Reports',
  },
  {
    nodeapi: 'get-facebook-page-insight',
    phproutes: 'get-facebook-reports',
    subcategory: 'Viewed Facebook Reports',
  },
  {
    nodeapi: 'get-youtube-insight',
    phproutes: 'get-youtube-reports',
    subcategory: 'Viewed Youtube Reports',
  },
  ],
  schedule: [{
    nodeapi: 'create',
    phproutes: 'home/publishing/scheduling',
    subcategory: 'Scheduled Posts',
  },
  ],

};
