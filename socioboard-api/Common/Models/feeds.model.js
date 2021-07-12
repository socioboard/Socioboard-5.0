import FacebookHelper from '../Cluster/facebook.cluster.js';
import TwitterLikeComment from '../Cluster/twitter.cluster.js';
import YoutubeLikeComment from '../Cluster/google.cluster.js';
import UserTeamAccount from '../Shared/userTeamAccounts.shared.js';
import config from 'config';
import TwitterMongoPostModel from '../Mongoose/models/twitterposts.js';
import YoutubeMongoPostModel from '../Mongoose/models/youtubepost.js';
import FacebookMongoPostModel from '../Mongoose/models/facebookposts.js';
import RssSearchedUrls from '../Mongoose/models/rsssearchedurls.js';
import moment from 'moment';
import db from '../Sequelize-cli/models/index.js';
const accountUpdateTable = db.social_account_feeds_updates;
const socialAccount = db.social_accounts;
const updateFriendsTable = db.social_account_friends_counts;
import logger from '../../Feeds/resources/log/logger.log.js';

class FeedModel {
  constructor() {
    Object.assign(this, UserTeamAccount);
    this.facebookHelper = new FacebookHelper(config.get('facebook_api'));
    this.twitterLikeComment = new TwitterLikeComment(config.get('twitter_api'));
    this.youtubeLikeComment = new YoutubeLikeComment(config.get('google_api'));
  }

  twitterLike(userId, accountId, teamId, tweetId, lang) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId) {
        reject(new Error(getMessage(4, lang)));
      } else {
        var socialAccounts;
        return this.getSocialAccount(4, accountId, userId, teamId)
          .then(socialAccount => {
            socialAccounts = socialAccount;
            return this.twitterLikeComment.likeTwitterPost(
              tweetId,
              socialAccount.access_token,
              socialAccount.refresh_token
            );
          })
          .then(response => {
            if (response.statusCode == 200) {
              //this.updateLikeCount(tweetId, 'increment')
              let twitterMongoPostModelObject = new TwitterMongoPostModel();
              twitterMongoPostModelObject
                .updateLike(tweetId, true)
                .then(() => {
                  twitterMongoPostModelObject.updateLikeCount(
                    tweetId,
                    'increment'
                  );
                })
                .then(() => {
                  resolve('Successfully liked.');
                })
                .catch(error => {
                  reject(new Error('Something went wrong!'));
                });
            } else {
              reject(new Error('Something went wrong!'));
            }
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  twitterDislike(userId, accountId, teamId, tweetId) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId) {
        reject(new Error('Invalid Inputs'));
      } else {
        var socialAccounts;
        return this.getSocialAccount(4, accountId, userId, teamId).then(
          socialAccount => {
            socialAccounts = socialAccount;
            return this.twitterLikeComment
              .unlikeTwitterPost(
                tweetId,
                socialAccount.access_token,
                socialAccount.refresh_token
              )
              .then(response => {
                if (response.statusCode == 200) {
                  // this.updateLikeCount(tweetId)
                  //  this.updateLikeedAccount(tweetId, socialAccounts, false)
                  var twitterMongoPostModelObject = new TwitterMongoPostModel();
                  twitterMongoPostModelObject
                    .updateLike(tweetId, false)
                    .then(() => {
                      twitterMongoPostModelObject.updateLikeCount(tweetId);
                    })
                    .then(() => {
                      resolve('Successfully disliked.');
                    })
                    .catch(error => {
                      throw new Error('Sorry! Something went wrong.');
                    });
                } else throw new Error('Sorry! Something went wrong.');
              })
              .catch(error => {
                reject(error);
              });
          }
        );
      }
    });
  }

  twitterComment(userId, accountId, teamId, tweetId, comment, username, lang) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId || !comment || !username) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.getSocialAccount(4, accountId, userId, teamId)
          .then(socialAccount => {
            return this.twitterLikeComment
              .commentTwitterPost(
                tweetId,
                comment,
                username,
                socialAccount.access_token,
                socialAccount.refresh_token
              )
              .then(response => {
                if (response.body) {
                  var parsedBody = JSON.parse(response.body);
                  logger.info(
                    'Success in parsing for twitter Id',
                    parsedBody.id_str
                  );
                  var result =
                    'Successfully posted and posted tweet id is ' +
                    parsedBody.id_str;
                  resolve(result);
                } else reject(new Error('Invalid Inputs'));
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            logger.ingo('Error while twt Comment', error);
            reject(error);
          });
      }
    });
  }

  twitterDeleteComment(userId, accountId, teamId, tweetId) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.getSocialAccount(4, accountId, userId, teamId).then(
          socialAccount => {
            return this.twitterLikeComment
              .deleteTwitterPostOrComment(
                tweetId,
                socialAccount.access_token,
                socialAccount.refresh_token
              )
              .then(response => {
                if (response.body) {
                  var twitterMongoPostModelObject = new TwitterMongoPostModel();
                  twitterMongoPostModelObject
                    .deletecomments(tweetId)
                    .then(response => {
                      if (!response)
                        throw new Error('Invalid commnetedTweetId');
                      resolve('Successfully deleted the comment.');
                    })
                    .catch(error => {
                      throw new Error(error);
                    });
                } else throw new Error('Sorry! Something went wrong.');
              })
              .catch(error => {
                reject(error);
              });
          }
        );
      }
    });
  }

  twtRetweet(userId, accountId, teamId, tweetId, lang) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId) {
        reject(new Error('Invalid Input'));
      } else {
        var socialAccounts;
        return this.getSocialAccount(4, accountId, userId, teamId)
          .then(socialAccount => {
            socialAccounts = socialAccount;
            return this.twitterLikeComment.retweetsPost(
              tweetId,
              socialAccount.access_token,
              socialAccount.refresh_token
            );
          })
          .then(response => {
            if (response) {
              this.updateCommentCount(tweetId, 'increment');
              // this.updateRetweetedaccount(tweetId, socialAccounts, true)
              resolve('Retweeted successfully');
            } else reject(new Error('Something went wrong!'));
          })
          .catch(error => {
            logger.info('Error while Retweet', error);
            reject(error);
          });
      }
    });
  }

  twtUnretweet(userId, accountId, teamId, tweetId) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId) {
        reject(new Error('Invalid Inputs'));
      } else {
        var socialAccounts;
        return this.getSocialAccount(4, accountId, userId, teamId)
          .then(socialAccount => {
            socialAccounts = socialAccount;
            return this.twitterLikeComment.unretweetPost(
              tweetId,
              socialAccount.access_token,
              socialAccount.refresh_token
            );
          })
          .then(response => {
            if (response) {
              this.updateCommentCount(tweetId);
              // this.updateRetweetedaccount(tweetId, socialAccounts, false)
              resolve('Successfully unretweeted.');
            } else throw new Error('Sorry! Something went wrong.');
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  updateCommentCount(tweetId, method) {
    try {
      var twitterMongoPostModelObject = new TwitterMongoPostModel();
      twitterMongoPostModelObject.updateCommentCount(tweetId, method);
      method
        ? twitterMongoPostModelObject.updateretweeted(tweetId, true)
        : twitterMongoPostModelObject.updateretweeted(tweetId, false);
    } catch (e) {}
  }

  twtRetweetWithComment(
    userId,
    accountId,
    teamId,
    tweetId,
    comment,
    username,
    lang
  ) {
    return new Promise((resolve, reject) => {
      if (!accountId || !tweetId || !comment || !username) {
        reject(new Error(getMessage(4, lang)));
      } else {
        return this.getSocialAccount(4, accountId, userId, teamId)
          .then(socialAccount => {
            return this.twitterLikeComment.twtRetweetWithComment(
              tweetId,
              socialAccount.access_token,
              socialAccount.refresh_token,
              comment,
              username
            );
          })
          .then(response => {
            if (response) {
              this.updateCommentCount(tweetId, 'increment');
              resolve('Successfully retweeted.');
            } else reject(new Error('Something went wrong!'));
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async fetchAllTweets(userId, accountId, teamId, lang) {
    var max_id;
    let previousMaxid;
    var i = 1;
    do {
      let result = await this.fetchAllTweetsinloop(
        userId,
        accountId,
        teamId,
        max_id,
        lang
      );
      previousMaxid = max_id;
      max_id = result.max_id;
    } while (max_id != previousMaxid);
    return 'Successfully fetched all tweets';
  }

  fetchAllTweetsinloop(userId, accountId, teamId, maxid, lang) {
    return new Promise((resolve, reject) => {
      if (!accountId) {
        reject(new Error(getMessage(4, lang)));
      } else {
        var max_id = 0;
        var socialAccountInfo = {};
        var twitterMongoPostModelObject = new TwitterMongoPostModel();
        return this.getSocialAccount(4, accountId, userId, teamId)
          .then(socialAccountDetails => {
            socialAccountInfo = socialAccountDetails;
            return this.twitterLikeComment.getAllTweets(
              socialAccountDetails.access_token,
              socialAccountDetails.refresh_token,
              socialAccountDetails.user_name,
              maxid
            );
          })
          .then(timelineTweets => {
            var size = 0;
            for (var count in timelineTweets) {
              if (timelineTweets.hasOwnProperty(count)) size += 1;
            }
            if (timelineTweets[timelineTweets.length - 1])
              max_id = timelineTweets[timelineTweets.length - 1].id_str;
            return this.twitterLikeComment.parseTweetDetails(
              timelineTweets,
              socialAccountInfo.social_id,
              config.get('twitter_api.app_name'),
              config.get('twitter_api.version'),
              socialAccountInfo.archived_status
            );
          })
          .then(tweets => {
            return twitterMongoPostModelObject.insertManyPosts(tweets.tweets);
          })
          .then(insertedData => {
            var data = {
              max_id: max_id,
              data: insertedData,
            };
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  facebookLike(userId, accountId, teamId, postId) {
    return new Promise((resolve, reject) => {
      if (!accountId || !postId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.getSocialAccount([2], accountId, userId, teamId)
          .then(socialAccount => {
            return this.facebookHelper.likeFacebookPost(
              socialAccount.social_id,
              postId,
              socialAccount.access_token
            );
          })
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  facebookComment(userId, accountId, teamId, postId, comment) {
    return new Promise((resolve, reject) => {
      if (!accountId || !postId || !comment) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
          .then(socialAccount => {
            return this.facebookHelper.commentFacebookPost(
              socialAccount.social_id,
              postId,
              comment,
              socialAccount.access_token
            );
          })
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getRecentFbFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      if (!Boolean(pageId)) {
        reject(new Error('Please validate the page id!'));
      } else {
        return this.isNeedToFetchRecentPost(
          accountId,
          config.get('facebook_api.update_time_frequency_value'),
          config.get('facebook_api.update_time_frequency_factor')
        )
          .then(isRunRecentPost => {
            if (isRunRecentPost) {
              var socialAccountInfo = {};
              var feeds = [];
              return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
                .then(socialAccountDetails => {
                  socialAccountInfo = socialAccountDetails;
                  return accountUpdateTable
                    .findOne({
                      where: {account_id: accountId},
                      attributes: ['updated_at'],
                      raw: true,
                    })
                    .then(updatedAccountData => {
                      if (updatedAccountData && updatedAccountData.updated_at)
                        return this.facebookHelper.getRecentFacebookFeeds(
                          socialAccountInfo.access_token,
                          socialAccountInfo.social_id,
                          updatedAccountData.updated_at,
                          config.get('facebook_api.app_id'),
                          config.get('facebook_api.version')
                        );
                      else
                        return this.facebookHelper.getFacebookPosts(
                          socialAccountInfo.access_token,
                          socialAccountInfo.social_id,
                          config.get('facebook_api.app_id'),
                          config.get('facebook_api.version')
                        );
                    });
                })
                .then(postDetails => {
                  if (
                    postDetails &&
                    postDetails.feeds &&
                    postDetails.feeds.length > 0
                  ) {
                    feeds = postDetails.feeds;
                    var facebookMongoPostModelObject =
                      new FacebookMongoPostModel();
                    return facebookMongoPostModelObject.insertManyPosts(
                      postDetails.feeds
                    );
                  } else return [];
                })
                .then(() => {
                  return this.createOrEditLastUpdateTime(
                    accountId,
                    socialAccountInfo.social_id
                  )
                    .then(() => {
                      return feeds;
                    })
                    .catch(error => {
                      throw error;
                    });
                })
                .catch(error => {
                  throw error;
                });
            }
          })
          .then(() => {
            return this.getFacebookFeeds(userId, accountId, teamId, pageId);
          })
          .then(feeds => resolve(feeds))
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getRecentFbPageFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      if (!Boolean(pageId)) {
        reject(new Error('Please validate the page id!'));
      } else {
        return this.isNeedToFetchRecentPost(
          accountId,
          config.get('facebook_api.update_time_frequency_value'),
          config.get('facebook_api.update_time_frequency_factor')
        )
          .then(isRunRecentPost => {
            if (isRunRecentPost) {
              var socialAccountInfo = {};
              var feeds = [];
              return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
                .then(socialAccountDetails => {
                  socialAccountInfo = socialAccountDetails;
                  return accountUpdateTable
                    .findOne({
                      where: {account_id: accountId},
                      attributes: ['updated_at'],
                      raw: true,
                    })
                    .then(updatedAccountData => {
                      if (updatedAccountData && updatedAccountData.updated_at)
                        return this.facebookHelper.getRecentFacebookPageFeeds(
                          socialAccountInfo.access_token,
                          socialAccountInfo.social_id,
                          updatedAccountData.updated_at,
                          config.get('facebook_api.app_id'),
                          config.get('facebook_api.version')
                        );
                      else
                        return this.facebookHelper.getFacebookPagePosts(
                          socialAccountInfo.access_token,
                          socialAccountInfo.social_id,
                          config.get('facebook_api.app_id'),
                          config.get('facebook_api.version')
                        );
                    });
                })
                .then(postDetails => {
                  if (
                    postDetails &&
                    postDetails.feeds &&
                    postDetails.feeds.length > 0
                  ) {
                    feeds = postDetails.feeds;
                    var facebookMongoPostModelObject =
                      new FacebookMongoPostModel();
                    return facebookMongoPostModelObject.insertManyPosts(
                      postDetails.feeds
                    );
                  } else return [];
                })
                .then(() => {
                  return this.createOrEditLastUpdateTime(
                    accountId,
                    socialAccountInfo.social_id
                  )
                    .then(() => {
                      return feeds;
                    })
                    .catch(error => {
                      throw error;
                    });
                })
                .catch(error => {
                  throw error;
                });
            }
          })
          .then(() => {
            return this.getFacebookFeeds(userId, accountId, teamId, pageId);
          })
          .then(feeds => resolve(feeds))
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getFacebookFeeds(userId, accountId, teamId, pageId) {
    return new Promise((resolve, reject) => {
      if (!Boolean(pageId)) {
        reject(new Error('Please validate the page id!'));
      } else {
        return this.getSocialAccount([1, 2, 3], accountId, userId, teamId)
          .then(socialAccountDetails => {
            var offset = (pageId - 1) * config.get('perPageLimit');
            var facebookMongoPostModelObject = new FacebookMongoPostModel();
            return facebookMongoPostModelObject.getSocialAccountPosts(
              socialAccountDetails.social_id,
              offset,
              config.get('perPageLimit')
            );
          })
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  youtubeLike(userId, accountId, teamId, videoId, rating) {
    return new Promise((resolve, reject) => {
      if (!accountId || !videoId || !rating) {
        reject(new Error('Invalid Inputs'));
      } else {
        var data = {videoId: videoId, rating: rating};
        return this.getSocialAccount(9, accountId, userId, teamId)
          .then(socialAccount => {
            return this.youtubeLikeComment.youtubeVideoLike(
              videoId,
              rating,
              socialAccount.refresh_token
            );
          })
          .then(response => {
            if (response.statusCode == 204) {
              var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
              return youtubeMongoPostModelObject
                .updateIsLike(data)
                .then(() => {
                  resolve(`Successfully ${rating}d.`);
                })
                .catch(error => {
                  reject(error);
                });
            } else
              throw new Error(
                `Sorry, Already ${rating}d by the specified account.`
              );
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  youtubeComment(userId, accountId, teamId, videoId, comment) {
    return new Promise((resolve, reject) => {
      if (!accountId || !videoId || !comment) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.getSocialAccount(9, accountId, userId, teamId)
          .then(socialAccount => {
            return this.youtubeLikeComment.youtubeVideoComment(
              videoId,
              comment,
              socialAccount.refresh_token
            );
          })
          .then(response => {
            var parsedData = JSON.parse(response);
            if (parsedData.id)
              resolve(
                `Successfully commented and comment id is ${parsedData.id}`
              );
            else throw new Error('Sorry! Something went wrong.');
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  youtubeReplyComment(userId, accountId, teamId, commentId, comment) {
    return new Promise((resolve, reject) => {
      if (!accountId || !commentId || !comment) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.getSocialAccount(9, accountId, userId, teamId)
          .then(socialAccount => {
            return this.youtubeLikeComment.youtubeCommentReply(
              commentId,
              comment,
              socialAccount.refresh_token
            );
          })
          .then(response => {
            var parsedData = JSON.parse(response);
            if (parsedData.id)
              resolve(
                `Successfully replied to a specified comment and comment id is ${parsedData.id}`
              );
            else throw new Error('Sorry! Something went wrong.');
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  async youtubeRecentFeeds(socialAccount) {
    var youtubeMongoPostModelObject = new YoutubeMongoPostModel();
    let response = await this.youtubeLikeComment.getYoutubeChannelsInfo(
      socialAccount.social_id,
      socialAccount.refresh_token
    );
    if (response) youtubeMongoPostModelObject.insertManyPosts(response);
    return response;
  }

  async addRssSearchUrls(userId, rssUrl, title, discription) {
    let dummyTitle;
    let rssSearchedUrls = new RssSearchedUrls();
    try {
      if (!title) {
        dummyTitle = rssUrl.split('https://');
        dummyTitle = dummyTitle[1].split('/');
        dummyTitle = dummyTitle[0];
        title = dummyTitle;
      }
    } catch (e) {}
    let posts = [];
    let post = {
      // title: dummyTitle || "",
      description: discription || '',
      rssUrl,
      updatedDate: moment.now(),
    };
    posts.push(post);
    let inserData = await rssSearchedUrls.insertManyPosts(posts, userId);
    let titles = await rssSearchedUrls.updateTitle(post, userId, title);
    return inserData;
  }

  async socialAccountStats(account_id) {
    let accounts = await socialAccount.findOne({
      where: {account_id},
      attributes: [
        'account_id',
        'first_name',
        'account_type',
        'profile_pic_url',
      ],
      raw: true,
    });
    let SocialAccountStats = [];
    var fields = [];
    switch (Number(accounts.account_type)) {
      case 1:
        fields = [
          'account_id',
          'friendship_count',
          'page_count',
          'profile_picture',
        ];
        break;
      case 2:
        fields = [
          'account_id',
          'follower_count',
          'total_like_count',
          'profile_picture',
        ];
        break;
      case 4:
        fields = [
          'account_id',
          'follower_count',
          'following_count',
          'total_like_count',
          'total_post_count',
          'bio_text',
          'profile_picture',
        ];
        break;
      case 5:
        fields = [
          'account_id',
          'friendship_count',
          'follower_count',
          'following_count',
          'total_post_count',
          'profile_picture',
        ];
        break;
      case 9:
        fields = [
          'account_id',
          'subscription_count',
          'total_post_count',
          'profile_picture',
        ];
        break;
      case 11:
        fields = [
          'account_id',
          'follower_count',
          'following_count',
          'board_count',
          'bio_text',
          'profile_picture',
        ];
        break;
      case 12:
        fields = [
          'account_id',
          'follower_count',
          'following_count',
          'total_post_count',
          'profile_picture',
        ];
        break;
      default:
        break;
    }

    if (accounts.account_type == 11) {
      pinterestIds.push(accounts.account_id);
    }

    if (fields.length > 0) {
      return updateFriendsTable
        .findOne({
          where: {account_id: accounts.account_id},
          attributes: fields,
          raw: true,
        })
        .then(resultData => {
          return resultData;
        })
        .catch(error => {
          logger.error(error.message);
        });
    }
    return SocialAccountStats;
  }
}
export default FeedModel;
