// const twitterApi = require('node-twitter-api');
// var TwtAPi = require('twitter');
// const moment = require('moment');
// const path = require('path');
// const requestPromise = require('request-promise');

import twitterApi from 'node-twitter-api';
import TwtAPi from 'twitter';
import moment from 'moment';
import path, {dirname} from 'path';
import requestPromise from 'request-promise';
import Sentiment from 'sentiment';

import {fileURLToPath} from 'url';
import fs, {readFileSync} from 'fs';

// const logger = require('../utils/logger');
import {createRequire} from 'module';

import TwitterShared from '../../Common/Shared/twitter.shared.js';
import TWITTER_CONSTANTS from '../Constants/twitter.constants.js';

const sentiment = new Sentiment();

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// twitter_api is the config data of twitter from the route
function Twitter(twitter_api) {
  // Assiging twitter_api (twitter config) to this.twitter_api
  this.twitter_api = twitter_api;
  // Making a twitter object with config to hit twitter api
  this.twitterObj = new twitterApi({
    consumerKey: twitter_api.api_key,
    consumerSecret: twitter_api.secret_key,
    callback: twitter_api.redirect_url,
  });

  this.twitterLogin = new twitterApi({
    consumerKey: twitter_api.api_key,
    consumerSecret: twitter_api.secret_key,
    callback: twitter_api.login_redirect_url,
  });
  
  this.twitterObjInvite = new twitterApi({
    consumerKey: twitter_api.api_key,
    consumerSecret: twitter_api.secret_key,
    callback: twitter_api.invite_redirect_url,
  });

  this.twitterRq = new TwitterShared({
    consumerKey: twitter_api.api_key,
    consumerSecret: twitter_api.secret_key,
    callback: twitter_api.login_redirect_url,
    baseUrl: TWITTER_CONSTANTS.TWITTER_API_URL,
  });
}

Twitter.prototype.getTwitterClient = function (accessToken, accessTokenSecret) {
  // Making an interface with data to hit the twitter api
  const twitterClient = new TwtAPi({
    consumer_key: this.twitter_api.api_key,
    consumer_secret: this.twitter_api.secret_key,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret,
  });

  return twitterClient;
};

Twitter.prototype.addTwitterProfile = function (
  network,
  teamId,
  requestToken,
  requestSecret,
  verifier
) {
  let twitterAccessToken = null;

  return new Promise((resolve, reject) => {
    // Checking whether the input verifier is having value or not
    if (!verifier) {
      reject("Can't get verification code from twitter!");
    } else {
      return this.accessToken(requestToken, requestSecret, verifier)
        .then(response => {
          twitterAccessToken = response;

          return this.verifyCredentials(
            response.accessToken,
            response.accessSecret
          );
        })
        .then(userDetails => {
          // Formating the response
          const user = {
            UserName: userDetails.screen_name,
            FirstName: userDetails.name,
            LastName: userDetails.last_name ? userDetails.last_name : '',
            Email: userDetails.email ? userDetails.email : '',
            SocialId: userDetails.id,
            ProfilePicture: userDetails.profile_image_url_https.replace(
              '_normal',
              ''
            ),
            ProfileUrl: `https://twitter.com/${userDetails.screen_name}`,
            AccessToken: twitterAccessToken.accessToken,
            // For Twitter Refresh token is an accessSecret
            RefreshToken: twitterAccessToken.accessSecret,
            FriendCount: userDetails.friends_count,
            Info: '',
            TeamId: teamId,
            Network: network,
          };
          // Sending response

          resolve(user);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};
Twitter.prototype.addTwitterProfilebyLogin = function (
  requestToken,
  requestSecret,
  verifier
) {
  let twitterAccessToken = null;

  return new Promise((resolve, reject) => {
    // Checking whether the input verifier is having value or not
    if (!verifier) {
      reject("Can't get verification code from twitter!");
    } else {
      return this.accessToken(requestToken, requestSecret, verifier)
        .then(response => {
          twitterAccessToken = response;

          return this.verifyCredentials(
            response.accessToken,
            response.accessSecret
          );
        })
        .then(userDetails => {
          const data = {
            profile_deatils: userDetails,
            token: twitterAccessToken,
          };

          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

/**
 * TODO get the TwitterProfile for Invite
 * Function to get TwitterProfile for Invite
 * @param {string} network - name of network
 * @param {number} teamId - team Id
 * @param {string} requestToken - twitter accesstoken
 * @param {string} requestSecret - twitter Secret code
 * @param {string} verifier - twitter verifier code
 * @return {object} Returns Twitter profile details
 */
Twitter.prototype.addTwitterProfilebyInvite = function (
  network,
  teamId,
  requestToken,
  requestSecret,
  verifier
) {
  let twitterAccessToken = null;
  return new Promise((resolve, reject) => {
    if (!verifier) {
      reject("Can't get verification code from twitter!");
    } else {
      return this.accessToken(requestToken, requestSecret, verifier)
        .then(response => {
          twitterAccessToken = response;
          return this.verifyCredentials(
            response.accessToken,
            response.accessSecret
          );
        })
        .then(userDetails => {
          let user = {
            UserName: userDetails?.screen_name,
            FirstName: userDetails?.name,
            LastName: userDetails.last_name ? userDetails.last_name : '',
            Email: userDetails.email ? userDetails.email : '',
            SocialId: userDetails?.id,
            ProfilePicture: userDetails?.profile_image_url_https,
            ProfileUrl: `https://twitter.com/intent/user?user_id=${userDetails.id}`,
            AccessToken: twitterAccessToken?.accessToken,
            RefreshToken: twitterAccessToken?.accessSecret,
            FavCount: userDetails?.favourites_count,
            FriendCount: userDetails?.friends_count,
            Info: '',
            TeamId: teamId,
            Network: network,
          };
          resolve(user);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};


Twitter.prototype.requestToken = function () {
  return new Promise((resolve, reject) => {
    this.twitterObj.getRequestToken((error, requestToken, requestSecret) => {
      // Checking whether it sent error in callback or not
      if (error) reject(error);
      else {
        const response = {
          requestToken,
          requestSecret,
        };
        // Sending response

        resolve(response);
      }
    });
  });
};

/**
 * TODO get the Twitter Request token for Invite
 * Function to get the Twitter Request token for Invite
 * @return {object} Returns Twitter request Token and requestSecret
 */
 Twitter.prototype.requestTokenInvite = function () {
  return new Promise((resolve, reject) => {
    this.twitterObjInvite.getRequestToken(function (
      error,
      requestToken,
      requestSecret
    ) {
      if (error) reject(error);
      else {
        let response = {
          requestToken: requestToken,
          requestSecret: requestSecret,
        };
        resolve(response);
      }
    });
  });
};


Twitter.prototype.requestTokenLogin = function () {
  return new Promise((resolve, reject) => {
    this.twitterLogin.getRequestToken((error, requestToken, requestSecret) => {
      // Checking whether it sent error in callback or not
      if (error) reject(error);
      else {
        const response = {
          requestToken,
          requestSecret,
        };
        // Sending response

        resolve(response);
      }
    });
  });
};

Twitter.prototype.accessToken = function (token, secret, verifier) {
  return new Promise((resolve, reject) => {
    this.twitterObj.getAccessToken(
      token,
      secret,
      verifier,
      (error, accessToken, accessSecret) => {
        // Checking whether it sent error in callback or not
        if (error) reject(error);
        else {
          const response = {
            accessToken,
            accessSecret,
          };
          // Sending response

          resolve(response);
        }
      }
    );
  });
};

Twitter.prototype.verifyCredentials = function (accessToken, accessSecret) {
  return new Promise((resolve, reject) => {
    this.twitterObj.verifyCredentials(
      accessToken,
      accessSecret,
      (error, user) => {
        // Checking whether it sent error in callback or not
        if (error) {
          reject(error);
        } else {
          resolve(user);
        }
      }
    );
  });
};

Twitter.prototype.parseTweetDetails = function (
  timelineTweets,
  socialId,
  appName,
  version,
  archived_status
) {
  const dataForDownload = [];
  const dataForSentimentAnalysis = [];

  return new Promise((resolve, reject) => {
    if (!timelineTweets || !socialId || !appName || !version) {
      reject(new Error('Invalid Inputs'));
    } else {
      try {
        const batchId = String(moment().unix());
        const postDetails = {
          count: 0,
          tweets: [],
          batchId,
        };

        timelineTweets.forEach(tweet => {
          const source = !!tweet.source.includes(appName);
          let mediaUrls = [];
          const hashtags = [];
          const mentions = [];
          const quoteDetails = {};
          const replayDetails = {};
          const retweetDetails = {};
          let isReplayTweet = false;
          let isReTweet = false;
          let sentimentData = 0;
          const archiveStatus = archived_status;
          let favoriteCount = 0;
          const urls = [];
          quoteDetails.quoteTweetUrl = '';
          favoriteCount = tweet.favorite_count;

          if (tweet.extended_entities) {
            if (tweet.extended_entities.media) {
              tweet.extended_entities.media.forEach(media => {
                let mediaUrl;

                if (media.type == 'photo') {
                  mediaUrl = media.media_url_https;
                } else if (media.type == 'video') {
                  media.video_info.variants.forEach(variants => {
                    if (variants.content_type == 'video/mp4')
                      if (variants.bitrate == 832000) mediaUrl = variants.url;
                  });
                } else if (media.type == 'animated_gif') {
                  media.video_info.variants.forEach(variants => {
                    if (variants.content_type == 'video/mp4')
                      mediaUrl = variants.url;
                  });
                }

                const medias = {
                  type: media.type,
                  url: mediaUrl,
                };

                mediaUrls.push(medias);
              });

              const d = {
                tweetId: tweet.id_str,
                mediaDetails: mediaUrls,
              };

              dataForDownload.push(d);
            } else {
              mediaUrls = [];
            }
          }

          if (tweet.is_quote_status) {
            if (tweet.quoted_status) {
              quoteDetails.quoteTweetId = tweet.quoted_status_id_str;
              quoteDetails.quoteTweetText =
                tweet.quoted_status.full_text.replace(/\r?\n|\r/g, ' ');
              let quoteTweetMediaUrls = [];

              if (tweet.quoted_status.extended_entities) {
                if (tweet.quoted_status.extended_entities.media) {
                  tweet.quoted_status.extended_entities.media.forEach(media => {
                    quoteTweetMediaUrls.push(media.media_url_https);
                  });
                }
              } else if (tweet.quoted_status.entities.media) {
                tweet.quoted_status.entities.media.forEach(media => {
                  quoteTweetMediaUrls.push(media.media_url_https);
                });
              } else {
                quoteTweetMediaUrls = [];
              }
              quoteDetails.quoteTweetMediaUrls = quoteTweetMediaUrls;

              if (tweet.quoted_status_permalink) {
                quoteDetails.quoteTweetUrl =
                  tweet.quoted_status_permalink.expanded;
              }
            }
          }

          let text = '' || tweet.full_text.replace(/\r?\n|\r/g, ' ');

          const SentimentAnalysisdata = {
            text,
            tweetId: tweet.id_str,
          };

          dataForSentimentAnalysis.push(SentimentAnalysisdata);

          if (tweet.in_reply_to_status_id != null) {
            (isReplayTweet = true),
              (replayDetails.replayTweetId = tweet.in_reply_to_status_id_str),
              (replayDetails.replayTweetUserId = tweet.in_reply_to_user_id_str),
              (replayDetails.replayTweetScreenName =
                tweet.in_reply_to_screen_name);
          }

          if (tweet.retweeted_status != null) {
            (isReTweet = true),
              (favoriteCount = tweet.retweeted_status.favorite_count);
            (retweetDetails.retweetTweetId = tweet.retweeted_status.id_str),
              (retweetDetails.retweetTweetUrl = `https://twitter.com/${tweet.retweeted_status.user.screen_name}/status/${tweet.retweeted_status.id_str}`),
              (retweetDetails.retweetTweetText =
                tweet.retweeted_status.full_text),
              (retweetDetails.postedAccountScreenName =
                tweet.retweeted_status.user.screen_name);
            text = `RT @${
              retweetDetails.postedAccountScreenName
            }: ${tweet.retweeted_status.full_text.replace(/\r?\n|\r/g, ' ')}`;
          }

          const sentScroe = sentiment.analyze(text).comparative;

          if (sentScroe == 0) {
            sentimentData = 0;
          } else if (sentScroe > 0) {
            sentimentData = 1;
          } else {
            sentimentData = -1;
          }

          if (tweet.entities.user_mentions) {
            tweet.entities.user_mentions.forEach(mention => {
              mentions.push(`@${mention.screen_name}`);
            });
          }
          if (tweet.entities.hashtags) {
            if (tweet.entities.hashtags.length > 0) {
              tweet.entities.hashtags.forEach(hashtag => {
                hashtags.push(`#${hashtag.text}`);
              });
            }
          }
          if (tweet?.entities?.urls) {
            if (tweet?.entities?.urls?.length > 0) {
              tweet?.entities?.urls?.map(x => {
                let data = {
                  url: x?.url ?? '',
                  expanded_url: x?.expanded_url ?? '',
                };
                urls.push(data);
              });
            }
          }

          const tweetDetails = {
            tweetId: tweet.id_str,
            publishedDate: tweet.created_at,
            descritpion: text,
            mediaUrls,
            hashtags,
            mentions,
            retweetCount: tweet.retweet_count,
            favoriteCount,
            accountId: socialId,
            postedAccountId: tweet.user.id_str,
            postedAccountScreenName: tweet.user.screen_name,
            isApplicationPost: source,
            tweetUrl: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
            quoteDetails,
            replayDetails,
            retweetStatus: retweetDetails,
            isReplayTweet,
            isReTweet,
            isQuoted: tweet.is_quote_status,
            isLiked: tweet.favorited,
            retweeted: tweet.retweeted,
            batchId,
            version,
            // serverMediaUrl:[],
            // sentiment: sentimentData,
            archivedStatus: archiveStatus,
            urls,
          };

          postDetails.tweets.push(tweetDetails);
        });

        postDetails.count = postDetails.tweets.length;
        //  this.downloadMediaPosts(dataForDownload)
        // this.checkAndStoreSentimentValue(dataForSentimentAnalysis)
        resolve(postDetails);
      } catch (error) {
        reject(error);
      }
    }
  });
};

// For getting user tweets
Twitter.prototype.getUserTweets = function (
  socialId,
  accessToken,
  refreshToken,
  userName
) {
  return new Promise((resolve, reject) =>
    // Fetching timeline tweets from twitter
    this.getTimeLineTweets(accessToken, refreshToken, userName)
      .then(timelineTweets =>
        // Formating the response of timeline tweets
        this.parseTweetDetails(
          timelineTweets,
          socialId,
          this.twitter_api.app_name,
          this.twitter_api.version
        )
      )
      .then(tweets => {
        // Sending response
        resolve(tweets);
      })
      .catch(error => {
        reject(error);
      })
  );
};

// For getting twitter timeline tweets
Twitter.prototype.getTimeLineTweets = function (
  accessToken,
  accessTokenSecret,
  screenName,
  lastTweetId
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret || !screenName) {
      reject(new Error('Invalid Inputs'));
    } else {
      const parameters = {screen_name: screenName, count: '200'};

      if (lastTweetId) parameters.since_id = lastTweetId;

      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      return twitterClient
        .get('statuses/user_timeline', parameters)
        .then(repsonse => {
          // Sending response
          resolve(repsonse);
        })
        .catch(error => {
          reject(error[0]);
        });
    }
  });
};

// For getting twitter home timeline tweets
Twitter.prototype.getHomeTimeLineTweets = function (
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient
        .get('statuses/home_timeline', {})
        .then(repsonse => {
          // Sending response
          resolve(repsonse);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// For getting twitter mentioned tweets (user tagged tweets)
Twitter.prototype.getMentionTimeLineTweets = function (
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient
        .get('statuses/mentions_timeline', {})
        .then(repsonse => {
          // Sending response
          resolve(repsonse);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// For formating the user details response into a proper syntax
function userProfileParser(userDetails) {
  return new Promise((resolve, reject) => {
    try {
      const profiles = {
        nextCursor: userDetails.next_cursor,
        previousCursor: userDetails.previous_cursor,
      };
      const profileDetails = [];
      // Formating the userDetails

      userDetails.users.forEach(user => {
        const profile = {
          id: user.id_str,
          name: user.name,
          screenName: user.screen_name,
          followerCount: user.followers_count,
          followingCount: user.friends_count,
          statusCount: user.statuses_count,
          isVerifiedUser: user.verified,
          profilePicUrl: user.profile_image_url_https,
        };

        profileDetails.push(profile);
      });
      profiles.users = profileDetails;
      // Sending response
      resolve(profiles);
    } catch (error) {
      reject(error);
    }
  });
}

// For formating the user profile details without cursor values
function userProfileParserWithoutCursor(userDetails) {
  return new Promise((resolve, reject) => {
    try {
      const profileDetails = [];

      userDetails.forEach(user => {
        const profile = {
          id: user.id_str,
          name: user.name,
          screenName: user.screen_name,
          followerCount: user.followers_count,
          followingCount: user.friends_count,
          statusCount: user.statuses_count,
          isVerifiedUser: user.verified,
          profilePicUrl: user.profile_image_url_https,
        };

        profileDetails.push(profile);
      });
      // Sending response
      resolve(profileDetails);
    } catch (error) {
      reject(error);
    }
  });
}

// To get the twitter follower count
Twitter.prototype.getFollowersList = function (
  accessToken,
  accessTokenSecret,
  cursorValue
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );
      const queryString = {
        count: 200,
        include_user_entities: false,
        skip_status: true,
      };

      if (cursorValue) {
        queryString.cursor = Number(cursorValue);
      }
      twitterClient
        .get('followers/list', queryString)
        .then(response => userProfileParser(response))
        .then(result => {
          // Sending response
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// For Fetching the twitter following list
Twitter.prototype.getFollowingsList = function (
  accessToken,
  accessTokenSecret,
  cursorValue
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );
      const queryString = {
        count: 200,
        include_user_entities: false,
        skip_status: true,
      };

      if (cursorValue) {
        queryString.cursor = Number(cursorValue);
      }

      twitterClient
        .get('friends/list', queryString)
        .then(repsonse => userProfileParser(repsonse))
        .then(result => {
          // Sending response
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// For, fetching the stats of an twitter account
Twitter.prototype.getLookupList = function (
  accessToken,
  accessTokenSecret,
  screenName
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );
      const queryString = {screen_name: screenName};

      return twitterClient
        .get('users/lookup', queryString)
        .then(response => {
          const updateDetails = {
            follower_count: response[0]?.followers_count,
            following_count: response[0]?.friends_count,
            total_like_count: response[0]?.favourites_count,
            total_post_count: response[0]?.statuses_count,
            profile_picture: response[0]?.profile_image_url_https,
            bio_text: response[0]?.description,
            user_mentions: response[0]?.status?.entities?.user_mentions?.length,
            retweet_count: response[0]?.status?.retweet_count,
            favorite_count: response[0]?.favourites_count,
          };
          resolve(updateDetails);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// For fetching tweets by keyword
Twitter.prototype.getTweetsByKeyword = function (
  accessToken,
  accessTokenSecret,
  keyword
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret || !keyword) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient
        .get('search/tweets', {q: keyword})
        .then(repsonse => {
          // Sending response
          resolve(repsonse);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// For fetching the tweets with keyword by an twitter account
Twitter.prototype.searchUser = function (
  keyword,
  pageId,
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!keyword || !pageId || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterOauth = {
        consumer_key: this.twitter_api.api_key,
        consumer_secret: this.twitter_api.secret_key,
        token: accessToken,
        token_secret: accessTokenSecret,
      };

      const request_options = {
        url: `https://api.twitter.com/1.1/users/search.json?q=${encodeURIComponent(
          keyword
        )}&page=${pageId}&count=20&include_entities=false`,
        oauth: twitterOauth,
        resolveWithFullResponse: true,
      };

      return requestPromise
        .get(request_options)
        .then(result => {
          if (result.statusCode == 200) {
            const value = JSON.parse(result.body);

            return userProfileParserWithoutCursor(value);
          }

          return null;
        })
        .then(result => {
          if (result) {
            // Sending response
            resolve(result);
          }
          // Sending response
          else {
            resolve([]);
          }
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

Twitter.prototype.directMessage = function (
  messageDetails,
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!messageDetails || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      const twitterOauth = {
        consumer_key: this.twitter_api.api_key,
        consumer_secret: this.twitter_api.secret_key,
        token: accessToken,
        token_secret: accessTokenSecret,
      };

      const request_options = {
        url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
        oauth: twitterOauth,
        resolveWithFullResponse: true,
      };

      if (messageDetails.messageType == 'Text') {
        const message = {
          event: {
            type: 'message_create',
            message_create: {
              target: {recipient_id: messageDetails.recipientId},
              message_data: {text: messageDetails.text},
            },
          },
        };

        request_options.body = JSON.stringify(message);

        return requestPromise
          .post(request_options)
          .then(response => {
            // Sending response
            resolve({
              code: 200,
              status: 'success',
              response: 'Message has been sent.',
            });
          })
          .catch(error => {
            reject(error);
          });
      }
      if (messageDetails.messageType == 'Image') {
        const filePath = `media/images/${messageDetails.media}`;
        const extenstion = require('path').extname(filePath).substr(1);

        return uploadMediaPromise(
          twitterClient,
          filePath,
          `image/${extenstion}`
        )
          .then(mediaId => {
            const message = {
              event: {
                type: 'message_create',
                message_create: {
                  target: {recipient_id: messageDetails.recipientId},
                  message_data: {
                    text: messageDetails.text,
                    attachment: {
                      type: 'media',
                      media: {id: mediaId},
                    },
                  },
                },
              },
            };

            request_options.body = JSON.stringify(message);

            return requestPromise
              .post(request_options)
              .then(response => {
                // Sending response
                resolve({
                  code: 200,
                  status: 'success',
                  response: 'Message has been sent.',
                });
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      }
      if (messageDetails.messageType == 'Video') {
        const filePath = `media/videos/${messageDetails.media}`;
        const extenstion = require('path').extname(filePath).substr(1);

        return uploadMediaPromise(
          twitterClient,
          filePath,
          `video/${extenstion}`
        )
          .then(mediaId => {
            const message = {
              event: {
                type: 'message_create',
                message_create: {
                  target: {recipient_id: messageDetails.recipientId},
                  message_data: {
                    text: messageDetails.text,
                    attachment: {
                      type: 'media',
                      media: {id: mediaId},
                    },
                  },
                },
              },
            };

            request_options.body = JSON.stringify(message);

            return requestPromise
              .post(request_options)
              .then(response => {
                // Sending response
                resolve({
                  code: 200,
                  status: 'success',
                  response: 'Message has been sent.',
                });
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      }
    }
  });
};

Twitter.prototype.publishTweets = function (
  postDetails,
  accessToken,
  accessTokenSecret
) {
  const basePath = path.resolve(__dirname, '../../..');

  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!postDetails || !accessToken || !accessTokenSecret) {
      reject({code: 400, status: 'failed', message: 'Invalid Inputs'});
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      if (postDetails.postType == 'Text') {
        twitterClient.post(
          'statuses/update',
          {status: postDetails.message},
          (error, tweet, response) => {
            // Checking whether it sent error in callback or not
            if (error) {
              reject({code: 400, status: 'failed', message: error});
            } else {
              // Sending response
              resolve({code: 200, status: 'success', message: tweet});
            }
          }
        );
      } else if (postDetails.postType == 'OldImage') {
        const filePath = `${basePath}/media/${postDetails.mediaPath}`;
        const extenstion = require('path').extname(filePath).substr(1);

        uploadMedia(
          twitterClient,
          filePath,
          `image/${extenstion}`,
          (error, mediaId) => {
            if (error) {
              reject({code: 400, status: 'failed', message: error});
            } else {
              const status = {
                status: postDetails.message,
                media_ids: mediaId,
              };

              twitterClient.post(
                'statuses/update',
                status,
                (error, tweet, response) => {
                  // Checking whether it sent error in callback or not
                  if (error) {
                    reject({code: 400, status: 'failed', message: error});
                  } else {
                    // Sending response
                    resolve({code: 200, status: 'success', message: tweet});
                  }
                }
              );
            }
          }
        );
      } else if (postDetails.postType == 'Image') {
        const erroredImages = [];
        let mediaIds = '';

        return Promise.all(
          postDetails.mediaPath.map(media => {
            const filePath = `${basePath}/media/${media}`;
            const extenstion = require('path').extname(filePath).substr(1);

            return uploadMediaPromise(
              twitterClient,
              filePath,
              `image/${extenstion}`
            )
              .then(mediaId => {
                if (mediaIds === '') {
                  mediaIds = mediaId;
                } else {
                  mediaIds = `${mediaIds},${mediaId}`;
                }
              })
              .catch(errorMediaPath => {
                erroredImages.push(errorMediaPath);
              });
          })
        )
          .then(() => {
            let message = null;

            if (postDetails.link && postDetails.link != '')
              message = `${postDetails.message} \n${postDetails.link}`;
            else message = `${postDetails.message}`;
            const status = {
              // status: postDetails.message,
              status: message,
              media_ids: mediaIds,
            };

            return twitterClient.post(
              'statuses/update',
              status,
              (error, tweet, response) => {
                // Checking whether it sent error in callback or not
                if (error) {
                  reject({code: 400, status: 'failed', message: error});
                } else {
                  // Sending response
                  resolve({
                    code: 200,
                    status: 'success',
                    message: tweet,
                    failedMediaPath: erroredImages,
                  });
                }
              }
            );
          })
          .catch(error => {
            reject({code: 400, status: 'failed', message: error.message});
          });
      } else if (postDetails.postType == 'Link') {
        const status = {
          status: `${postDetails.message} - \r\n ${postDetails.link}`,
        };

        twitterClient.post(
          'statuses/update',
          status,
          (error, tweet, response) => {
            // Checking whether it sent error in callback or not
            if (error) {
              reject({code: 400, status: 'failed', message: error});
            } else {
              // Sending response
              resolve({code: 200, status: 'success', message: tweet});
            }
          }
        );
      } else if (postDetails.postType == 'Video') {
        const filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
        const extenstion = require('path').extname(filePath).substr(1);

        uploadMedia(
          twitterClient,
          filePath,
          `video/${extenstion}`,
          (error, mediaId) => {
            if (error) {
              reject({code: 400, status: 'failed', message: error});
            } else {
              const status = {
                status: `${postDetails.message} \n${postDetails.link}`,
                media_ids: mediaId,
              };

              twitterClient.post(
                'statuses/update',
                status,
                (error, tweet, response) => {
                  // Checking whether it sent error in callback or not
                  if (error) {
                    reject({code: 400, status: 'failed', message: error});
                  } else {
                    // Sending response
                    resolve({code: 200, status: 'success', message: tweet});
                  }
                }
              );
            }
          }
        );
      } else {
        reject({code: 400, status: 'failed', error: 'Not a valid post.'});
      }
    }
  });
};

Twitter.prototype.publishPost = function (
  postDetails,
  accessToken,
  accessTokenSecret,
  callback
) {
  const basePath = path.resolve(__dirname, '../../..');
  const twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

  if (postDetails.postType == 'Text') {
    twitterClient.post(
      'statuses/update',
      {status: postDetails.message},
      (error, tweet, response) => {
        // Checking whether it sent error in callback or not
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: tweet});
        }
      }
    );
  } else if (postDetails.postType == 'OldImage') {
    const filePath = `${basePath}/media/${postDetails.mediaPath}`;
    const extenstion = require('path').extname(filePath).substr(1);

    uploadMedia(
      twitterClient,
      filePath,
      `image/${extenstion}`,
      (error, mediaId) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          const status = {
            status: postDetails.message,
            media_ids: mediaId,
          };

          twitterClient.post(
            'statuses/update',
            status,
            (error, tweet, response) => {
              // Checking whether it sent error in callback or not
              if (error) {
                callback({code: 400, status: 'failed', message: error});
              } else {
                callback({code: 200, status: 'success', message: tweet});
              }
            }
          );
        }
      }
    );
  } else if (postDetails.postType == 'Image') {
    const erroredImages = [];
    let mediaIds = '';

    return Promise.all(
      postDetails.mediaPath.map(media => {
        const filePath = `${basePath}/media/${media}`;
        const extenstion = require('path').extname(filePath).substr(1);

        return uploadMediaPromise(
          twitterClient,
          filePath,
          `image/${extenstion}`
        )
          .then(mediaId => {
            if (mediaIds == '') {
              mediaIds = mediaId;
            } else {
              mediaIds = `${mediaIds},${mediaId}`;
            }
          })
          .catch(errorMediaPath => {
            erroredImages.push(errorMediaPath);
          });
      })
    )
      .then(() => {
        const status = {
          status: postDetails.message,
          media_ids: mediaIds,
        };

        return twitterClient.post(
          'statuses/update',
          status,
          (error, tweet, response) => {
            // Checking whether it sent error in callback or not
            if (error) {
              callback({code: 400, status: 'failed', message: error});
            } else {
              callback({
                code: 200,
                status: 'success',
                message: tweet,
                failedMediaPath: erroredImages,
              });
            }
          }
        );
      })
      .catch(error => {
        callback({code: 400, status: 'failed', message: error.message});
      });
  } else if (postDetails.postType == 'Link') {
    const status = {
      status: postDetails.link,
    };

    twitterClient.post('statuses/update', status, (error, tweet, response) => {
      // Checking whether it sent error in callback or not
      if (error) {
        callback({code: 400, status: 'failed', message: error});
      } else {
        callback({code: 200, status: 'success', message: tweet});
      }
    });
  } else if (postDetails.postType == 'Video') {
    const filePath = `${basePath}/media/${postDetails.mediaPath}`;
    const extenstion = require('path').extname(filePath).substr(1);

    uploadMedia(
      twitterClient,
      filePath,
      `video/${extenstion}`,
      (error, mediaId) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          const status = {
            status: postDetails.message,
            media_ids: mediaId,
          };

          twitterClient.post(
            'statuses/update',
            status,
            (error, tweet, response) => {
              // Checking whether it sent error in callback or not
              if (error) {
                callback({code: 400, status: 'failed', message: error});
              } else {
                callback({code: 200, status: 'success', message: tweet});
              }
            }
          );
        }
      }
    );
  } else {
    callback({code: 400, status: 'failed', error: 'Not a valid post.'});
  }
};

function uploadMediaPromise(twitterClient, mediaPath, mediaType) {
  const mediaData = require('fs').readFileSync(mediaPath);
  const mediaSize = require('fs').statSync(mediaPath).size;

  // // let mediaData = readFileSync(mediaPath);
  // let mediaData = readFileSync(new URL(mediaPath))
  // // mediaData = path.normalize(mediaData)

  // const mediaSize = fs.statSync(mediaPath).size;

  return new Promise((resolve, reject) => {
    initUpload() // Declare that you wish to upload some media
      .then(appendUpload) // Send the data for the media
      .then(finalizeUpload) // Declare that you are done uploading chunks
      .then(mediaId => {
        // Sending response
        resolve(mediaId);
      })
      .catch(error => {
        reject(mediaPath);
      });
  });

  function initUpload() {
    //  logger.info(`\n Init Upload... \n `);
    return makePost('media/upload', {
      command: 'INIT',
      total_bytes: mediaSize,
      media_type: mediaType,
    })
      .then(data => data.media_id_string)
      .catch(() => {
        //   logger.info("init error");
      });
  }

  function appendUpload(mediaId) {
    // logger.info(`\n Append Upload... \n `);
    // logger.info(`\n Media Id ${mediaId} \n `);
    return makePost('media/upload', {
      command: 'APPEND',
      media_id: mediaId,
      media: mediaData,
      segment_index: 0,
    })
      .then(data => mediaId)
      .catch(() => {
        //  logger.info("append error");
      });
  }

  function finalizeUpload(mediaId) {
    //  logger.info(`\n Finalize Upload... \n `);
    //  logger.info(`\n Media Id ${mediaId} \n `);
    return makePost('media/upload', {
      command: 'FINALIZE',
      media_id: mediaId,
    })
      .then(data => mediaId)
      .catch(() => {
        //   logger.info('finalize error');
      });
  }

  function makePost(endpoint, params) {
    return new Promise((resolve, reject) => {
      twitterClient.post(endpoint, params, (error, data, response) => {
        if (error) {
          //   logger.info(` Error on Make Post : ${error}`);
          //   logger.info(` Response on Make Post : ${JSON.stringify(response)}`);
          reject(error);
        } else {
          //  logger.info(`\n`, "done uploading!", `\n`);
          // Sending response
          resolve(data);
          //  logger.info(data);
        }
      });
    });
  }
}

function uploadMedia(twitterClient, mediaPath, mediaType, callback) {
  // const mediaType = 'image/gif'; // `'video/mp4'` is also supported
  const mediaData = require('fs').readFileSync(mediaPath);
  const mediaSize = require('fs').statSync(mediaPath).size;

  initUpload() // Declare that you wish to upload some media
    .then(appendUpload) // Send the data for the media
    .then(finalizeUpload) // Declare that you are done uploading chunks
    .then(mediaId => {
      callback(null, mediaId);
      // You now have an uploaded movie/animated gif
      // that you can reference in Tweets, e.g. `update/statuses`
      // will take a `mediaIds` param.
    })
    .catch(error => {
      callback(error, null);
    });

  /**
   * Step 1 of 3: Initialize a media upload
   * @return Promise resolving to String mediaId
   */
  function initUpload() {
    //  logger.info(`\n Init Upload... \n `);
    return makePost('media/upload', {
      command: 'INIT',
      total_bytes: mediaSize,
      media_type: mediaType,
    }).then(data => data.media_id_string);
  }

  /**
   * Step 2 of 3: Append file chunk
   * @param String mediaId    Reference to media object being uploaded
   * @return Promise resolving to String mediaId (for chaining)
   */
  function appendUpload(mediaId) {
    //  logger.info(`\n Append Upload... \n `);
    //  logger.info(`\n Media Id ${mediaId} \n `);
    return makePost('media/upload', {
      command: 'APPEND',
      media_id: mediaId,
      media: mediaData,
      segment_index: 0,
    })
      .then(data => mediaId)
      .catch(error => {
        // logger.info(`${error}, Eror in video appendUpload`);
      });
  }

  /**
   * Step 3 of 3: Finalize upload
   * @param String mediaId   Reference to media
   * @return Promise resolving to mediaId (for chaining)
   */
  function finalizeUpload(mediaId) {
    //   logger.info(`\n Finalize Upload... \n `);
    //   logger.info(`\n Media Id ${mediaId} \n `);
    return makePost('media/upload', {
      command: 'FINALIZE',
      media_id: mediaId,
    })
      .then(data => mediaId)
      .catch(error => {
        // logger.info(`${error}, Eror in video finalizeUpload`);
      });
  }

  /**
   * (Utility function) Send a POST request to the Twitter API
   * @param String endpoint  e.g. 'statuses/upload'
   * @param Object params    Params object to send
   * @return Promise         Rejects if response is error
   */
  function makePost(endpoint, params) {
    return new Promise((resolve, reject) => {
      twitterClient.post(endpoint, params, (error, data, response) => {
        if (error) {
          // logger.info(` Error on Make Post : ${error}`);
          // logger.info(` Response on Make Post : ${JSON.stringify(response)}`);
          reject(error);
        } else {
          // Sending response
          resolve(data);
        }
      });
    });
  }
}

// For retweeting a tweet to a particular tweet
Twitter.prototype.retweetPost = function (
  tweetId,
  accessToken,
  accessTokenSecret,
  callback
) {
  const twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

  twitterClient.post(
    `statuses/retweet/${tweetId}`,
    {},
    (error, tweet, response) => {
      // Checking whether it sent error in callback or not
      if (error) {
        callback({code: 400, status: 'failed', message: error});
      } else {
        callback({code: 200, status: 'success', message: tweet});
      }
    }
  );
};

Twitter.prototype.getGeoLocationDetails = function (
  keyword,
  location,
  accessToken,
  accessTokenSecret,
  callback
) {
  const twitterClient = this.getTwitterClient(accessToken, accessTokenSecret);

  twitterClient.get(
    'search/tweets',
    {q: keyword, geocode: location},
    (error, location, response) => {
      // Checking whether it sent error in callback or not
      if (error) {
        callback({code: 400, status: 'failed', message: error});
      } else {
        callback({code: 200, status: 'success', message: location});
      }
    }
  );
};

// For making like to a specified post
Twitter.prototype.likeTwitterPost = function (
  tweetId,
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!tweetId || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient.post(
        'favorites/create',
        {id: tweetId},
        (error, tweet, response) => {
          // Checking whether it sent error in callback or not
          if (error) {
            reject(error[0]);
          } else {
            // Sending response
            resolve(response);
          }
        }
      );
    }
  });
};

// For unLike specified twitter post
Twitter.prototype.unlikeTwitterPost = function (
  tweetId,
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!tweetId || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient.post(
        'favorites/destroy',
        {id: tweetId},
        (error, tweet, response) => {
          // Checking whether it sent error in callback or not
          if (error) {
            reject(error);
          } else {
            // Sending response
            resolve(response);
          }
        }
      );
    }
  });
};

Twitter.prototype.commentTwitterPost = function (
  tweetId,
  comment,
  username,
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    if (
      !tweetId ||
      !comment ||
      !accessToken ||
      !accessTokenSecret ||
      !username
    ) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );
      const status = `@${username} ${comment}`;

      twitterClient.post(
        'statuses/update/',
        {
          status,
          in_reply_to_status_id: tweetId,
          // username: '@VashiForever'
        },
        (error, tweet, response) => {
          if (error) {
            reject(error[0]);
          } else {
            resolve(response);
          }
        }
      );
    }
  });
};

// For deleting a specified twitter post
Twitter.prototype.deleteTwitterPostOrComment = function (
  tweetId,
  accessToken,
  accessTokenSecret
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!tweetId || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient.post(
        'statuses/destroy/',
        {
          id: tweetId,
        },
        (error, tweet, response) => {
          // Checking whether it sent error in callback or not
          if (error) {
            reject(error);
          } else {
            // Sending response
            resolve(response);
          }
        }
      );
    }
  });
};

// For creating or deleting the twitter subscriptions
Twitter.prototype.updateSubscriptions = function (
  accessToken,
  accessTokenSecret,
  isSubscribe
) {
  return new Promise((resolve, reject) => {
    const twitterOauth = {
      consumer_key: this.twitter_api.api_key,
      consumer_secret: this.twitter_api.secret_key,
      token: accessToken,
      token_secret: accessTokenSecret,
    };
    const request_options = {
      url: `https://api.twitter.com/1.1/account_activity/all/${this.twitter_api.webhook_environment}/subscriptions.json`,
      oauth: twitterOauth,
      resolveWithFullResponse: true,
    };

    if (isSubscribe) {
      // If account is adding then, we are requesting for twitter subscription
      requestPromise
        .post(request_options)
        .then(response => {
          if (response.statusCode == 204) {
            // Sending response
            resolve('Subscription added.');
          } else {
            // Sending response
            resolve('Not Subscription.');
          }
        })
        .catch(response => {
          reject(response.error);
        });
    } else {
      // If account is deleting then, we are deleting the subscription
      requestPromise
        .delete(request_options)
        .then(response => {
          if (response.statusCode == 204) {
            // Sending response
            resolve('Subscription deleted.');
          } else {
            // Sending response
            resolve('Not able to delete Subscription.');
          }
        })
        .catch(response => {
          reject(response.error);
        });
    }
  });
};

Twitter.prototype.getAllTweets = function (
  accessToken,
  accessTokenSecret,
  screenName,
  lastTweetId
) {
  return new Promise(async (resolve, reject) => {
    if (!accessToken || !accessTokenSecret || !screenName) {
      reject(new Error('Invalid Inputs'));
    } else {
      const parameters = {
        screen_name: screenName,
        count: '200',
        tweet_mode: 'extended',
      };

      if (lastTweetId) parameters.max_id = lastTweetId;
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      try {
        const repsonse = await twitterClient.get(
          'statuses/user_timeline',
          parameters
        );

        resolve(repsonse);
      } catch (error) {
        reject(error[0]);
      }
    }
  });
};

Twitter.prototype.retweetsPost = function (
  tweetId,
  accessToken,
  accessTokenSecret,
  callback
) {
  return new Promise((resolve, reject) => {
    if (!tweetId || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient.post(
        `statuses/retweet/${tweetId}`,
        (error, tweet, response) => {
          if (error) {
            reject(error[0]);
          } else {
            resolve(response);
          }
        }
      );
    }
  });
};

Twitter.prototype.unretweetPost = function (
  tweetId,
  accessToken,
  accessTokenSecret,
  callback
) {
  return new Promise((resolve, reject) => {
    if (!tweetId || !accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );

      twitterClient.post(
        `statuses/unretweet/${tweetId}`,
        {},
        (error, tweet, response) => {
          if (error) {
            reject(error[0]);
          } else {
            resolve(response);
          }
        }
      );
    }
  });
};

Twitter.prototype.twtRetweetWithComment = function (
  tweetId,
  accessToken,
  accessTokenSecret,
  comment,
  username,
  callback
) {
  return new Promise((resolve, reject) => {
    if (
      !tweetId ||
      !comment ||
      !accessToken ||
      !accessTokenSecret ||
      !username
    ) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );
      const status = `https://twitter.com/${username}/status/${tweetId}`;

      twitterClient.post(
        'statuses/update/',
        {
          status: comment,
          attachment_url: status,
          // username: '@VashiForever'
        },
        (error, tweet, response) => {
          if (error) {
            reject(error[0]);
          } else {
            resolve(response);
          }
        }
      );
    }
  });
};

Twitter.prototype.fetchTweetsKeywords = function (
  twitterdata,
  keywords,
  max_id,
  since_id
) {
  return new Promise((resolve, reject) => {
    if (!twitterdata.access_token || !twitterdata.access_secret) {
      reject(new Error('There is some Error while fetching the Twitter Creds'));
    } else {
      const twitterClient = this.getTwitterClient(
        twitterdata.access_token,
        twitterdata.access_secret
      );
      const params = {q: keywords, count: '200', tweet_mode: 'extended'};

      if (max_id) params.max_id = max_id;
      if (since_id) params.since_id = since_id;

      twitterClient.get('search/tweets', params, (error, jsonOut, response) => {
        if (!error) {
          resolve(jsonOut);
        } else {
          reject(error);
        }
      });
    }
  });
};
Twitter.prototype.parseTweetDetailsForKeyword = function (jsonOut) {
  return new Promise((resolve, reject) => {
    if (!jsonOut) {
      reject(new Error('Error in getting the Twitter Details'));
    } else {
      const postDetails = {
        count: 0,
        tweets: [],
        max_id_str: 0,
      };

      if (jsonOut.statuses.length != 0) {
        jsonOut.statuses.map(tweet => {
          let mediaUrls = [];
          const hashtags = [];
          const mentions = [];
          const quoteDetails = {};
          const replayDetails = {};
          const retweetDetails = {};
          let isReplayTweet = false;
          let isReTweet = false;
          let sentimentData = 0;

          quoteDetails.quoteTweetUrl = '';
          // fetch for the media Url
          if (tweet.extended_entities) {
            if (tweet.extended_entities.media) {
              tweet.extended_entities.media.map(media => {
                let mediaUrl;

                if (media.type == 'photo') {
                  mediaUrl = media.media_url_https;
                } else if (media.type == 'video') {
                  media.video_info.variants.map(variants => {
                    if (variants.content_type == 'video/mp4')
                      if (variants.bitrate == 832000) mediaUrl = variants.url;
                  });
                } else if (media.type == 'animated_gif') {
                  media.video_info.variants.map(variants => {
                    if (variants.content_type == 'video/mp4')
                      mediaUrl = variants.url;
                  });
                }

                const medias = {
                  type: media.type,
                  url: mediaUrl,
                };

                mediaUrls.push(medias);
              });
            } else {
              mediaUrls = [];
            }
          }

          if (tweet.is_quote_status) {
            if (tweet.quoted_status) {
              quoteDetails.quoteTweetId = tweet.quoted_status_id;
              quoteDetails.quoteTweetText = tweet.quoted_status.text;
              let quoteTweetMediaUrls = [];

              if (tweet.quoted_status.extended_entities) {
                if (tweet.quoted_status.extended_entities.media) {
                  tweet.quoted_status.extended_entities.media.map(media => {
                    quoteTweetMediaUrls.push(media.media_url_https);
                  });
                }
              } else if (tweet.quoted_status.entities.media) {
                tweet.quoted_status.entities.media.map(media => {
                  quoteTweetMediaUrls.push(media.media_url_https);
                });
              } else {
                quoteTweetMediaUrls = [];
              }
              quoteDetails.quoteTweetMediaUrls = quoteTweetMediaUrls;
              if (tweet.quoted_status.entities.urls.length > 0) {
                quoteDetails.quoteTweetUrl =
                  tweet.quoted_status.entities.urls[0].expanded_url;
              }
            }
          }

          const text = '' || tweet.full_text.replace(/\r?\n|\r/g, ' ');
          const sentScroe = sentiment.analyze(text).comparative;

          if (sentScroe == 0) {
            sentimentData = 0;
          } else if (sentScroe > 0) {
            sentimentData = 1;
          } else {
            sentimentData = -1;
          }

          if (tweet.in_reply_to_status_id != null) {
            (isReplayTweet = true),
              (replayDetails.replayTweetId = tweet.in_reply_to_status_id_str),
              (replayDetails.replayTweetUserId = tweet.in_reply_to_user_id_str),
              (replayDetails.replayTweetScreenName =
                tweet.in_reply_to_screen_name);
          }

          if (tweet.retweeted_status != null) {
            (isReTweet = true),
              (retweetDetails.retweetTweetId = tweet.retweeted_status.id_str),
              (retweetDetails.retweetTweetUrl = `https://twitter.com/${tweet.retweeted_status.user.screen_name}/status/${tweet.retweeted_status.id_str}`),
              (retweetDetails.retweetTweetText =
                tweet.retweeted_status.full_text),
              (retweetDetails.postedAccountScreenName =
                tweet.retweeted_status.user.screen_name);
          }

          if (tweet.entities.user_mentions) {
            tweet.entities.user_mentions.map(mention => {
              mentions.push(`@${mention.screen_name}`);
            });
          }
          if (tweet.entities.hashtags) {
            if (tweet.entities.hashtags.length > 0) {
              tweet.entities.hashtags.map(hashtag => {
                hashtags.push(`#${hashtag.text}`);
              });
            }
          }
          if (mediaUrls.length == 0) {
            mediaUrls = null;
          }

          const tweetDetails = {
            tweetId: tweet.id_str,
            publishedDate: tweet.created_at,
            description: text,
            mediaUrls,
            hashtags,
            mentions,
            retweetCount: tweet.retweet_count,
            favoriteCount: tweet.favorite_count,
            // accountId: socialId,
            postedAccountId: tweet.user.id_str,
            postedAccountScreenName: tweet.user.screen_name,
            postedAccountProfilePic: tweet.user.profile_image_url_https,
            //   isApplicationPost: source,
            tweetUrl: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
            quoteDetails,
            replayDetails,
            retweetStatus: retweetDetails,
            isReplayTweet,
            isReTweet,
            isLiked: tweet.favorited,
            //  batchId: batchId,
            //  version: version,
            sentiment: sentimentData,
          };

          postDetails.tweets.push(tweetDetails);
        });
      }
      postDetails.count = postDetails.tweets.length;
      try {
        var maxId = jsonOut.search_metadata.next_results.split('?max_id=');
        var max = maxId[1].split('&q=');

        postDetails.max_id = max[0];
        var maxId = jsonOut.search_metadata.refresh_url.split('?since_id=');
        var max = maxId[1].split('&q=');

        postDetails.since_id = max[0];
      } catch (error) {
        reject(error);
      }
      resolve(postDetails);
    }
  });
};
// For making follow to a specified account
Twitter.prototype.followTwitterId = function (
  accessToken,
  accessTokenSecret,
  screen_name
) {
  return new Promise((resolve, reject) => {
    // Checking whether the inputs are having values or not
    if (!accessToken || !accessTokenSecret) {
      reject(new Error('Invalid Inputs'));
    } else {
      const twitterClient = this.getTwitterClient(
        accessToken,
        accessTokenSecret
      );
      const queryString = {screen_name};

      twitterClient.post(
        'friendships/create',
        queryString,
        (error, tweet, response) => {
          // Checking whether it sent error in callback or not
          if (error) {
            reject(error[0]);
          } else {
            // Sending response
            resolve(response);
          }
        }
      );
    }
  });
};

Twitter.prototype.getTrends = function (creds, woeid) {
  return this.twitterRq.getRequest('trends/place', creds, {id: woeid});
};

Twitter.prototype.getTrendsAvailable = function (creds) {
  return this.twitterRq.getRequest('trends/available', creds);
};

Twitter.prototype.searchTwitterUsers = function (creds, {query, page, count}) {
  return this.twitterRq.getRequest('users/search', creds, {
    q: query,
    page,
    count,
  });
};

Twitter.prototype.getUserTweetsByUserName = function (
  creds,
  args
) {
  return this.twitterRq.getRequest('statuses/user_timeline', creds, args);
};

Twitter.prototype.followUser = function (creds, args) {
  return this.twitterRq.postRequest('friendships/create', creds, args);
};

Twitter.prototype.unfollowUser = function (creds, args) {
  return this.twitterRq.postRequest('friendships/destroy', creds, args);
};

Twitter.prototype.getUserDetails = function (creds, args) {
  return this.twitterRq.getRequest('users/show', creds, args);
};

Twitter.prototype.getUserFollowers = function (
  {token, secret, userName: screen_name, count},
  cursor
) {
  return this.twitterRq.getRequest(
    'followers/list',
    {token, secret},
    {screen_name, count, cursor}
  );
};

Twitter.prototype.getUserFriends = function (
  {token, secret, userName: screen_name, count},
  cursor
) {
  return this.twitterRq.getRequest(
    'friends/list',
    {token, secret},
    {screen_name, count, cursor}
  );
};

export default Twitter;
