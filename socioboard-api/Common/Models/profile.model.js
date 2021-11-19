import config from 'config';
import FacebookHelper from '../Cluster/facebook.cluster.js';
import db from '../Sequelize-cli/models/index.js';

import LinkedInHelper from '../Cluster/linkedin.cluster.js';
import GoogleHelper from '../Cluster/google.cluster.js';
import logger from '../../Publish/resources/Log/logger.log.js';

const socialAccount = db.social_accounts;

class ProfileModel {
  constructor() {
    this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
    this.linkedInHelper = new LinkedInHelper(config.get('linkedIn_api'));
    this.googleHelper = new GoogleHelper(config.get('google_api'));
  }

  async getFacebookPages(code,invite) {
    const pages = [];
    const pageIds = [];

    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Code is Invlaid'));
      } else {
         let redirecturl = "";
         if(invite == 1 ? redirecturl = config.get('profile_page_invite_redirect_url') : redirecturl = config.get('profile_page_redirect_url') )
          return this.facebookHelper
          .getOwnFacebookPages(code, redirecturl)
          .then(pageDetails => {
            if (!pageDetails) {
              throw new Error('Cant able to fetch page details');
            } else {
              pageDetails.forEach(page => {
                const pageObject = {
                  pageId: page.id,
                  pageUrl: page.link,
                  pageName: page.name,
                  accessToken: page.access_token,
                  profilePicture: `https://graph.facebook.com/${page.id}/picture?type=large&access_token=${page.access_token}`,
                  fanCount: page.fan_count,
                  isAlreadyAdded: false,
                  isInvite:invite
                 };
                pages.push(pageObject);
                pageIds.push(page.id);
              });
            }
          })
          .then(() =>
            socialAccount.findAll({
              where: {social_id: pageIds},
              attributes: ['account_id', 'social_id'],
            })
          )
          .then(matchedPages => {
            matchedPages.forEach(page => {
              const matchedPage = pages.find(
                item => item.pageId == page.social_id
              );

              matchedPage.isAlreadyAdded = true;
            });
            resolve({pages, availablePages: matchedPages});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async getOwnFacebookGroups(code) {
    const groups = [];
    const groupIds = [];

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
              groupInfo.groupDetails.forEach(group => {
                if (group.administrator) {
                  const groupObject = {
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
            }
            throw new Error('Cant able to fetch group information');
          })
          .then(matchedGroups => {
            matchedGroups.forEach(page => {
              const matchedPage = groups.find(
                item => item.groupId == page.social_id
              );

              matchedPage.isAlreadyAdded = true;
            });
            resolve({groups, availableGroups: matchedGroups});
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async getcompanyProfileDetails(code,invite) {
    const companies = [];
    const companyIds = [];
    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Code is Invalid'));
      } else {
        // Fetching linkedin company profile details using auth code
         let redirecturl = "";
        if(invite == 1 ? redirecturl = config.get('linkedIn_api.invite_redirect_url_page') : redirecturl= config.get('linkedIn_api.redirect_url_page'))
         return this.linkedInHelper
          .getCompanyProfileDetails(code,redirecturl)
          .then(data => {
            const {response, access_token, refresh_token} = data;
            if (response.elements.length != 0) {
              response.elements.forEach(company => {
                let profilePicture = '';
                company['organizationalTarget~']?.logoV2?.[
                  'original~'
                ]?.elements.map(x => {
                  if (
                    x.data['com.linkedin.digitalmedia.mediaartifact.StillImage']
                      .displaySize.width === 400
                  )
                    profilePicture = x.identifiers[0].identifier;
                });
                const companyObject = {
                  companyId: company['organizationalTarget~']?.id,
                  companyName: company['organizationalTarget~']?.vanityName,
                  accessToken: access_token,
                  refresh_token,
                  profilePicture,
                  profileUrl: `https://www.linkedin.com/company/${company['organizationalTarget~']?.vanityName}`,
                  isAlreadyAdded: false,
                  isInvite:invite
             };

                companies.push(companyObject);
                companyIds.push(company['organizationalTarget~']?.id);
              });

              return socialAccount.findAll({
                where: {social_id: companyIds},
                attributes: ['account_id', 'social_id'],
              });
            }
            throw new Error(
              'Currently No LinkedIn Pages Found For This Account'
            );
          })
          .then(matchedPages => {
            matchedPages.forEach(page => {
              const matchedPage = companies.find(
                item => item.companyId == page.social_id
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

  /**
   * TODO get the Youtube channel Details
   * Function to get the Youtube channel Details
   * @param  {string} code - Youtube Auth Code
   * @return {object} Returns Channel Details
   */
  async getYoutubeChannels(code,invite) {
    const channels = [];
    const channelIds = [];

    return new Promise((resolve, reject) => {
      if (!code) {
        reject(new Error('Invalid Inputs'));
      } else {
        let redirecturl = "";
        if(invite == 1 ? redirecturl = config.get('google_api.google_profile_add_invite_redirect_url') : redirecturl= config.get('google_api.google_profile_add_redirect_url'))
        return this.googleHelper
          .getYoutubeChannels(code,redirecturl)
          .then(response => {
            const channelDetails = response.parsedBody;
            const {tokens} = response;

            if (channelDetails?.items) {
              const {etag} = channelDetails;

              channelDetails.items.map(channel => {
                const channelDetails = {
                  channelId: channel.id,
                  channelName: channel.snippet.title,
                  channelImage: channel.snippet.thumbnails.default.url,
                  accessToken: tokens.access_token,
                  refreshToken: tokens.refresh_token,
                  info: {
                    etag,
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
                   isInvite:invite
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
              matchedChannels.map(channel => {
                const matchedChannel = channels.find(
                  item => item.channelId == channel.social_id
                );

                matchedChannel.isAlreadyAdded = true;
              });
              resolve({channels, availableChannels: matchedChannels});
            } else {
              logger.error('getYoutubeChannels: Channel not found');
              reject(new Error('Channel not found'));
            }
          })
          .catch(error => {
            logger.error('getYoutubeChannels: Error in fetching Youtube Data');
            reject(error);
          });
      }
    });
  }

  /**
   * TODO get the InstaBusinessAccount Details
   * Function to get the InstaBusinessAccount Details
   * @param  {string} code - InstaBusinessAccount Auth Code
   * @return {object} Returns InstaBusinessAccount Details
   */
  async getInstaBusinessAccount(code,invite) {
    return new Promise((resolve, reject) => {
      let instagramAccounts = [];
      let instagramIds = [];
      let instagramAddedPages = [];
      if (!code) {
        reject(new Error('Invalid Inputs'));
      } else {
       let redirecturl = "";
        if(invite == 1 ? redirecturl = config.get('instagram_business_api.business_invite_redirect_url') : redirecturl= config.get('instagram_business_api.business_redirect_url'))
        this.facebookHelper
          .getPagesConnectWithInsta(
            code,
            redirecturl
          )
          .then(pageDetails => {
            logger.info(`Page Details: ${JSON.stringify(pageDetails)}`);
            if (pageDetails.data) {
              return Promise.all(
                pageDetails.data.map(page => {
                  if (
                    page.connected_instagram_account &&
                    page.connected_instagram_account.id
                  ) {
                    let pageObject = {
                      pageId: page.id,
                      social_id: page.connected_instagram_account.id,
                      accessToken: page.access_token,
                    };
                    instagramAddedPages.push(pageObject);
                  }
                })
              );
            }
          })
          .then(() => {
            logger.info(
              `Added Instagram Pages : ${JSON.stringify(instagramAddedPages)}`
            );
            return Promise.all(
              instagramAddedPages.map(businessAccount => {
                // Getting instagram business profile details
                return this.facebookHelper
                  .getInstaBusinessAccount(businessAccount.accessToken)
                  .then(instaAccounts => {
                    logger.info(
                      `Response Instagram Info : ${JSON.stringify(
                        instaAccounts
                      )}`
                    );
                    let business_accountId;
                    if (
                      instaAccounts.connected_instagram_account &&
                      instaAccounts.connected_instagram_account.id
                    ) {
                      business_accountId =
                        instaAccounts.connected_instagram_account.id;
                    }
                    return Promise.all(
                      instaAccounts.instagram_accounts.data.map(profile => {
                        let instaAcc = {
                          userName: profile.username,
                          social_id: business_accountId,
                          businessAccountId: business_accountId,
                          accessToken: businessAccount.accessToken,
                          info: {
                            instagram_id: profile.id,
                            follow_count: profile.follow_count,
                            followed_by_count: profile.followed_by_count,
                            has_profile_picture: profile.has_profile_picture,
                            media_count: profile.media_count,
                            is_private: profile.is_private,
                            is_published: profile.is_published,
                          },
                          profile_pic: profile.profile_pic
                            ? profile.profile_pic
                            : '',
                          fanCount: profile.followed_by_count,
                          isAlreadyAdded: false,
                          isInvite:invite

                        };

                        logger.info(`Insta Account-- ${instaAcc} `);
                        instagramAccounts.push(instaAcc);
                        instagramIds.push(instaAcc.social_id);
                      })
                    ).catch(error => {
                      logger.info(
                        `Error on fetching insta profiles by fb pages. Message: ${error}`
                      );
                    });
                  })
                  .catch(error => {
                    logger.info(
                      `Error on fetching insta profiles by fb pages.Message: ${error}`
                    );
                  });
              })
            );
          })
          .then(() => {
            return socialAccount.findAll({
              where: {social_id: instagramIds},
              attributes: ['account_id', 'social_id'],
            });
          })
          .then(matchedPages => {
            matchedPages.forEach(page => {
              let matchedPage = instagramAccounts.find(
                item => item.social_id == page.social_id
              );
              matchedPage.isAlreadyAdded = true;
            });
            resolve({pages: instagramAccounts, availablePages: matchedPages});
          })
          .catch(error => {
            logger.info(
              `Error on fetching insta profiles by fb pages.Message: ${error}`
            );
            reject(error);
          });
      }
    });
  }
}

export default ProfileModel;
