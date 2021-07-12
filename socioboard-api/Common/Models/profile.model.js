import config from 'config';
import FacebookHelper from '../Cluster/facebook.cluster.js';
import db from '../Sequelize-cli/models/index.js';

import LinkedInHelper from '../Cluster/linkedin.cluster.js';
import GoogleHelper from '../Cluster/google.cluster.js';

const socialAccount = db.social_accounts;

class ProfileModel {
  constructor() {
    this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
    this.linkedInHelper = new LinkedInHelper(config.get('linkedIn_api'));
    this.googleHelper = new GoogleHelper(config.get('google_api'));
  }

  async getFacebookPages(code) {
    var pages = [];
    var pageIds = [];
    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Code is Invlaid'));
      } else {
        return this.facebookHelper
          .getOwnFacebookPages(code, config.get('profile_page_redirect_url'))
          .then(pageDetails => {
            if (!pageDetails) {
              throw new Error('Cant able to fetch page details');
            } else {
              pageDetails.forEach(function (page) {
                var pageObject = {
                  pageId: page.id,
                  pageUrl: page.link,
                  pageName: page.name,
                  accessToken: page.access_token,
                  profilePicture: page.picture.data.url,
                  fanCount: page.fan_count,
                  isAlreadyAdded: false,
                };
                pages.push(pageObject);
                pageIds.push(page.id);
              });
              return;
            }
          })
          .then(() => {
            return socialAccount.findAll({
              where: {social_id: pageIds},
              attributes: ['account_id', 'social_id'],
            });
          })
          .then(matchedPages => {
            matchedPages.forEach(page => {
              var matchedPage = pages.find(
                item => item.pageId == page.social_id
              );
              matchedPage.isAlreadyAdded = true;
            });
            resolve({pages: pages, availablePages: matchedPages});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async getOwnFacebookGroups(code) {
    var groups = [];
    var groupIds = [];
    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Code is Invlaid'));
      } else {
        // Fetching Facebook groups from facebook with auth code
        this.facebookHelper
          .getOwnFacebookGroups(
            code,
            config.get('facebook_api.fbprofile_add_redirect_url')
          )
          .then(groupInfo => {
            if (groupInfo.groupDetails) {
              groupInfo.groupDetails.forEach(function (group) {
                if (group.administrator) {
                  var groupObject = {
                    groupId: group.id,
                    groupName: group.name,
                    accessToken: groupInfo.accessToken,
                    profilePicture: group.picture.data.url,
                    memberCount: group.member_count,
                    isAlreadyAdded: false,
                  };
                  groups.push(groupObject);
                  groupIds.push(group.id);
                }
              });

              return socialAccount.findAll({
                where: {social_id: groupIds},
                attributes: ['account_id', 'social_id'],
              });
            } else {
              throw new Error('Cant able to fetch group information');
            }
          })
          .then(matchedGroups => {
            matchedGroups.forEach(page => {
              var matchedPage = groups.find(
                item => item.groupId == page.social_id
              );
              matchedPage.isAlreadyAdded = true;
            });
            resolve({groups: groups, availableGroups: matchedGroups});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async getcompanyProfileDetails(code) {
    var companies = [];
    var companyIds = [];

    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Code is Invalid'));
      } else {
        // Fetching linkedin company profile details using auth code
        return this.linkedInHelper
          .getCompanyProfileDetails(code)
          .then(response => {
            if (response.company_details && response.company_details.values) {
              response.company_details.values.forEach(function (company) {
                var companyObject = {
                  companyId: company.id,
                  companyName: company.name,
                  accessToken: response.access_token,
                  profileUrl: `https://www.linkedin.com/company/${company.id}`,
                  isAlreadyAdded: false,
                };
                companies.push(companyObject);
                companyIds.push(company.id);
              });

              return socialAccount.findAll({
                where: {social_id: companyIds},
                attributes: ['account_id', 'social_id'],
              });
            } else {
              throw new Error('Cant able to get linkedin company profiles!');
            }
          })
          .then(matchedPages => {
            matchedPages.forEach(page => {
              var matchedPage = companies.find(
                item => item.pageId == page.social_id
              );
              matchedPage.isAlreadyAdded = true;
            });
            resolve({company: companies, availablePages: matchedPages});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async getYoutubeChannels(code) {
    var channels = [];
    var channelIds = [];
    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Invalid Inputs'));
      } else {
        // Fetching youtube channels with auth code
        return this.googleHelper
          .getYoutubeChannels(code)
          .then(response => {
            var channelDetails = response.parsedBody;
            var tokens = response.tokens;

            if (channelDetails.items) {
              var etag = channelDetails.etag;
              channelDetails.items.forEach(channel => {
                // Formating the response in a structural way
                var channelDetails = {
                  channelId: channel.id,
                  channelName: channel.snippet.title,
                  channelImage: channel.snippet.thumbnails.default.url,
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token,
                  info: {
                    etag: etag,
                    channelDescription: channel.snippet.description,
                    publishedDate: channel.snippet.publishedAt,
                  },
                  friendshipCount: {
                    viewCount: channel.statistics.viewCount,
                    commentCount: channel.statistics.commentCount,
                    subscriberCount: channel.statistics.subscriberCount
                      ? channel.statistics.subscriberCount
                      : 0,
                    videoCount: channel.statistics.videoCount,
                    hiddenSubscriberCount:
                      channel.statistics.hiddenSubscriberCount,
                  },
                };
                channelIds.push(channel.id);
                channels.push(channelDetails);
              });

              return socialAccount.findAll({
                where: {social_id: channelIds},
                attributes: ['account_id', 'social_id'],
              });
            }
            return null;
          })
          .then(matchedChannels => {
            if (matchedChannels) {
              matchedChannels.forEach(channel => {
                var matchedChannel = channels.find(
                  item => item.channelId == channel.social_id
                );
                matchedChannel.isAlreadyAdded = true;
              });
              resolve({channels: channels, availableChannels: matchedChannels});
            } else {
              reject(new Error('Something went wrong'));
            }
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }
}

export default ProfileModel;
