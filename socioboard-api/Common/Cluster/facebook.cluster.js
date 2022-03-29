import facebook from 'fb';
import config from 'config';
import requestPromise from 'request-promise';
import request from 'request';
import async from 'async';
import path, {dirname} from 'path';
import moment from 'moment';
import logger from '../../Publish/resources/Log/logger.log.js';
import sizeOf from 'image-size';
import {fileURLToPath} from 'url';
import fs from 'fs';
import resizeImg from 'resize-img';
import axios from'axios';
import qs from 'qs';

const fbversion = 'v3.3';

const __dirname = dirname(fileURLToPath(import.meta.url));

function Facebook(facebook_api) {
  this.facebook_api = facebook_api;
}

Facebook.prototype.addFacebookProfile = function (
  network,
  teamId,
  code,
  redirectUrl
) {
  return new Promise((resolve, reject) => {
    // Checking the input data, that code is having data or not
    if (!code) {
      reject('Facebook code is invalid!');
    } else {
      // Fetching access token from facebook using user code
      this.getProfileAccessToken(code, redirectUrl)
        .then(accessToken => {
          // Validating whether we got access token in response or not(any error)
          if (!accessToken) throw new Error('Cant able to fetch access token.');
          else {
            this.userProfileInfo(accessToken)
              .then(userDetails => {
                if (!userDetails) {
                  throw new Error('Cant able to fetch user details');
                } else {
                  // Formating the response
                  const user = {
                    UserName: userDetails.user_id,
                    FirstName: userDetails.first_name,
                    LastName: userDetails.last_name
                      ? userDetails.last_name
                      : '',
                    Email: userDetails.email,
                    SocialId: userDetails.user_id,
                    ProfilePicture: `https://graph.facebook.com/${userDetails.user_id}/picture?type=large`,
                    ProfileUrl: `https://facebook.com/${userDetails.user_id}`,
                    AccessToken: userDetails.access_token,
                    RefreshToken: userDetails.access_token,
                    FriendCount: userDetails.friend_count,
                    Info: '',
                    TeamId: teamId,
                    Network: network,
                  };
                  // Sending response

                  resolve(user);
                }
              })
              .catch(error => {
                throw new Error(error.message);
              });
          }
        })
        .catch(error => {
          reject(error.message);
        });
    }
  });
};

Facebook.prototype.userProfileInfo = function (accessToken) {
  // Fetching profile details with accessToken of a user
  const url = `https://graph.facebook.com/${fbversion}/me?fields=id,ids_for_apps,name,email,birthday,first_name,last_name,friends&access_token=${accessToken}`;

  return new Promise((resolve, reject) =>
    request.get(url, (error, response, body) => {
      if (error) {
        // Checking the request is having any error or not
        reject(error);
      } else {
        // Formating the body (the response of facebook call)
        const parsedBody = JSON.parse(body);
        const profileInfo = {
          user_id: parsedBody.id,
          name: parsedBody.name,
          email: parsedBody.email,
          birthday: parsedBody.birthday,
          first_name: parsedBody.first_name,
          last_name: parsedBody.last_name,
          friend_count: parsedBody.friends
            ? parsedBody.friends.summary
              ? parsedBody.friends.summary.total_count
              : '0'
            : '0',
          access_token: accessToken,
        };
        // Sending response

        resolve(profileInfo);
      }
    })
  );
};

Facebook.prototype.getProfileAccessToken = function (code, redirecturl) {
  return new Promise((resolve, reject) => {
    if (!code) {
      reject('Invalid code from facebook');
    } else {
      // Setting up the variables and links to request facebook Graph-api

      const postOptions = {
        method: 'GET',
        uri: `https://graph.facebook.com/${fbversion}/oauth/access_token`,
        // Setting JSON inputs to query
        qs: {
          client_id: this.facebook_api.app_id,
          redirect_uri: redirecturl,
          client_secret: this.facebook_api.secret_key,
          code,
        },
      };
      // Hitting graph-api with promise

      return requestPromise(postOptions)
        .then(response => {
          const parsedResponse = JSON.parse(response);

          resolve(parsedResponse.access_token);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

Facebook.prototype.getFbProfileStats = function (accessToken) {
  const url = `https://graph.facebook.com/${fbversion}/me/?fields=id,friends.summary(true),likes.summary(true),accounts.summary(true),groups,posts&access_token=${accessToken}`;
  //  var url = `https://graph.facebook.com/${fbversion}/me/?fields=id,friends.summary(true).summary(true),accounts.summary(true),groups,posts&access_token=${accessToken}`;

  return new Promise((resolve, reject) => {
    // Checking the input data, that "accessToken" is having data or not
    if (!accessToken) {
      reject(new Error('Access Token Missing'));
    } else {
      // Hitting facebook to get data
      return request.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          // Formating the body data to fetch necessary data
          const parsedData = JSON.parse(body);
          const updateDetail = {
            friendship_count: parsedData.friends
              ? parsedData.friends.summary.total_count
              : 0,
            page_count: parsedData.accounts
              ? parsedData.accounts.summary.total_count
              : 0,
            // group_count: parsedData?.TotalGroups, // not getting summary data
            profile_picture: `https://graph.facebook.com/${parsedData.id}/picture?type=large`,
          };
          // Sending response

          resolve(updateDetail);
        }
      });
    }
  });
};

Facebook.prototype.getOwnFacebookPages = function (code, redirectUrl) {
  return new Promise((resolve, reject) => {
    if (!code) {
      reject('Invalid code from facebook');
    } else {
      // Fetching access token from facebook using user code
      return this.getProfileAccessToken(code, redirectUrl)
        .then(accessToken => {
          // Validating whether we got access token in response or not(any error)
          if (!accessToken) {
            reject('Cant able to get the Facebook access token!');
          } else {
            // Fetching user pages from that user access token
            return this.userPageDetails(accessToken);
          }
        })
        .then(pageDetails => {
          resolve(pageDetails);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

Facebook.prototype.getOwnFacebookGroups = function (code, redirect_url) {
  return new Promise((resolve, reject) => {
    let userAccessToken = {};
    // Checking the input data, that code is having data or not

    if (!code) {
      reject(new Error('Invalid code from facebook'));
    } else {
      // Fetching access token from facebook using user code
      this.getProfileAccessToken(code, redirect_url)
        .then(accessToken => {
          userAccessToken = accessToken;
          // Fetching facebook groups from the facebook user accesstoken
          return this.userAdminGroupDetails(accessToken);
        })
        .then(groupDetails => {
          // Formating the response
          const groupInfo = {
            accessToken: userAccessToken,
            groupDetails,
          };

          // Sending response
          resolve(groupInfo);
        })
        .catch(error => {
          reject(error);
        });
    }
  });
};

// Fetching facebook page details using page accessToken
Facebook.prototype.userPageDetails = function (accessToken) {
  return new Promise((resolve, reject) => {
    // Checking the input data, that "accessToken" is having data or not
    if (!accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      request.get(
        `https://graph.facebook.com/${fbversion}/me/accounts?fields=access_token,link,name,id,picture.type(large){url},fan_count&access_token=${accessToken}`,
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            // Formating the response (data from the body to JSON)
            const parsedBody = JSON.parse(body);

            pagination(parsedBody, (error, result) => {
              // Checking whether it sent error in callback or not
              if (error || error != null) {
                reject(error);
              }
              const {data} = result;
              // Sending response

              resolve(data);
            });
          }
        }
      );
    }
  });
};

// Fetching posts from facebook of existing account
Facebook.prototype.getFacebookPosts = function (
  accessToken,
  socialId,
  facebookAppId,
  version
) {
  return new Promise((resolve, reject) => {
    if (!accessToken || !socialId || !facebookAppId || !version) {
      reject(new Error('Invalid Inputs'));
    } else {
      getFacebookFeeds(socialId, accessToken, (error, feedDetails) => {
        if (error != null || error) {
          reject(error);
        }
        const batchId = String(moment().unix());

        const postDetails = {
          feeds: [],
          batchId,
        };
        feedDetails?.forEach(feed => {
          const feedId = feed.id.replace(`${socialId}_`, '');
          const privacy = feed.privacy.value;
          const createdTime = moment(feed.created_time).utc();
          let feedMessage = feed.message ? feed.message : '';
          const feedLink = `https://www.facebook.com/${feedId}`;
          const mediaUrls = [];
          let isApplicationPost = false;
          let sharedUrl = '';
          if (feed.application) {
            const applicationId = feed.application.id;

            if (applicationId == facebookAppId) {
              isApplicationPost = true;
            }
          }
          if (feed.type == 'photo' || feed.type == 'album') {
            if (feed.attachments && feed.attachments.data.length > 0) {
              feed.attachments.data.forEach(data => {
                if (data.subattachments) {
                  data.subattachments.data.forEach(data => {
                    if (
                      data.type === 'photo' ||
                      'profile_media' ||
                      'cover_photo'
                    ) {
                      const media = data.media.image.src;
                      mediaUrls.push(media);
                    }
                  });
                } else if (
                  data.type === 'photo' ||
                  'profile_media' ||
                  'cover_photo'
                ) {
                  const media = data.media.image.src;
                  mediaUrls.push(media);
                } else if (data.type === 'video_inline') {
                  const media = data.url ?? data.media.image.src;
                  mediaUrls.push(media);
                }
              });
            }
          } else if (feed.type == 'video') {
            const media = feed.source ?? feed.attachments?.data[0]?.url;
            mediaUrls.push(media);
          } else if ((feed.type === 'status' || 'link') && feedMessage === '') {
            feedMessage =
              feed.attachments?.data[0]?.description ??
              feed.attachments?.data[0]?.title ??
              '';
          } else if (feed.type == 'share') {
            if (feed.attachments?.data[0]?.media?.source)
              sharedUrl = feed.attachments?.data[0]?.media?.source ?? '';
            else sharedUrl = feed.attachments?.data[0]?.url ?? '';
          }
          if (feed.type === 'link') {
            if (feed.attachments?.data[0]?.media?.source)
              sharedUrl = feed.attachments?.data[0]?.media?.source ?? '';
            else sharedUrl = feed.attachments?.data[0]?.url ?? '';
          }
          const feedObject = {
            postId: feedId,
            privacy,
            publishedDate: createdTime,
            postType: feed.type,
            description: feedMessage,
            postUrl: feedLink,
            isApplicationPost,
            mediaUrls,
            likeCount: feed.reactions ? feed.reactions.summary.total_count : 0,
            commentCount: feed.comments ? feed.comments.summary.total_count : 0,
            socialAccountId: socialId,
            batchId,
            version,
            sharedUrl,
          };

          postDetails.feeds.push(feedObject);
        });

        resolve(postDetails);
      });
    }
  });
};
// Fetching posts from facebook of existing account
Facebook.prototype.getFacebookPagePosts = function (
  accessToken,
  socialId,
  facebookAppId,
  version
) {
  return new Promise((resolve, reject) => {
    if (!accessToken || !socialId || !facebookAppId || !version) {
      reject(new Error('Invalid Inputs'));
    } else {
      getFacebookPagePosts(socialId, accessToken, (error, feedDetails) => {
        if (error != null || error) {
          reject(error);
        }
        const batchId = String(moment().unix());

        const postDetails = {
          feeds: [],
          batchId,
        };

        feedDetails?.forEach(feed => {
          const feedtype = feed.attachments?.data[0].type;
          const feedId = feed.id.replace(`${socialId}_`, '');
          const privacy = feed.privacy.value;
          const createdTime = moment(feed.created_time).utc();
          const feedMessage = feed.message ? feed.message : '';
          const feedLink = `https://www.facebook.com/${feedId}`;
          const mediaUrls = [];
          let isApplicationPost = false;
          let sharedUrl = '';
          if (feed.application) {
            const applicationId = feed.application.id;

            if (applicationId == facebookAppId) {
              isApplicationPost = true;
            }
          }
          if (feedtype == 'photo' || feedtype == 'album') {
            if (feed.attachments && feed.attachments.data.length > 0) {
              feed.attachments.data.forEach(data => {
                if (data.subattachments) {
                  data.subattachments.data.forEach(data => {
                    if (data.type == 'photo') {
                      const media = data.media.image.src;

                      mediaUrls.push(media);
                    }
                  });
                } else if (data.type == 'photo') {
                  const media = data.media.image.src;

                  mediaUrls.push(media);
                }
              });
            }
          } else if (feedtype == 'video') {
            const media = feed.source;

            mediaUrls.push(media);
          } else if (feedtype == 'video_inline') {
            feed.attachments.data.forEach(data => {
              mediaUrls.push(data.media.source);
            });
          } else if (feedtype == 'profile_media') {
            feed?.attachments?.data?.map(data => {
              mediaUrls.push(data?.media?.image?.src);
            });
          } else if (feedtype == 'cover_photo') {
            feed?.attachments?.data?.map(data => {
              mediaUrls.push(data?.media?.image?.src);
            });
          } else if (feedtype == 'share') {
            feed.attachments?.data[0]?.media?.source
              ? (sharedUrl = feed.attachments?.data[0]?.media?.source)
              : (sharedUrl = feed.attachments?.data[0]?.url ?? '');
          }
          const feedObject = {
            postId: feedId,
            privacy,
            publishedDate: createdTime,
            postType: feedtype,
            description: feedMessage,
            postUrl: feedLink,
            isApplicationPost,
            mediaUrls,
            likeCount: feed.reactions ? feed.reactions.summary.total_count : 0,
            commentCount: feed.comments ? feed.comments.summary.total_count : 0,
            socialAccountId: socialId,
            batchId,
            version,
            sharedUrl,
          };

          postDetails.feeds.push(feedObject);
        });

        resolve(postDetails);
      });
    }
  });
};

function getFacebookPagePosts(socialId, accessToken, callback) {
  facebook.setAccessToken(accessToken);
  // facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,comments.summary(true),type,application&limits=50`, (response) => {
  facebook.api(
    `${socialId}/feed?fields=privacy,message,attachments,created_time,reactions.summary(total_count),comments.summary(true),application&limits=50`,
    response => {
      if (!response || response.error) {
        callback(response.error, null);
      } else {
        pagination(response, (error, result) => {
          if (error || error != null) {
            callback(error, null);
          }
          const {data} = result;

          callback(null, data);
        });
      }
    }
  );
}

function getFacebookFeeds(socialId, accessToken, callback) {
  facebook.setAccessToken(accessToken);
  // facebook.api(`${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,comments.summary(true),type,application&limits=50`, (response) => {
  facebook.api(
    `${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,reactions.summary(total_count),comments.summary(true),type,application&limits=50`,
    response => {
      if (!response || response.error) {
        callback(response.error, null);
      } else {
        pagination(response, (error, result) => {
          if (error || error != null) {
            callback(error, null);
          }
          const {data} = result;

          callback(null, data);
        });
      }
    }
  );
}

let pagination = (data, callback) => {
  // Checking the input data, that data is having data and respected fields or not
  if (data && data.paging && data.paging.next) {
    request.get(data.paging.next, (error, response, body) => {
      const bodyResponse = JSON.parse(body);
      // Looping for each object from pagination

      async.forEachSeries(
        bodyResponse.data,
        (pageData, loop) => {
          data.data.push(pageData);
          loop();
        },
        (err, result) => {
          if (bodyResponse.paging != undefined) {
            data.paging.next = bodyResponse.paging.next;
            pagination(data, callback);
          } else {
            callback(null, data);
          }
        }
      );
    });
  } else {
    callback(null, data);
  }
};

Facebook.prototype.userAdminGroupDetails = function (accessToken) {
  return new Promise((resolve, reject) => {
    // Checking the input data, that "accessToken" is having data or not
    if (!accessToken) {
      reject(new Error('Invalid access token from facebook'));
    } else {
      request.get(
        `https://graph.facebook.com/${fbversion}/me/groups?fields=id,name,picture{url},member_count,administrator,member_request_count&access_token=${accessToken}`,
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            const parsedBody = JSON.parse(body);

            pagination(parsedBody, (error, result) => {
              // Checking whether it sent error in callback or not
              if (error || error != null) {
                reject(error);
              }
              const {data} = result;
              // Sending response

              resolve(data);
            });
          }
        }
      );
    }
  });
};

Facebook.prototype.likeFacebookPost = function (pageId, postId, accessToken) {
  return new Promise((resolve, reject) => {
    if (!pageId || !postId || !accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      facebook.setAccessToken(accessToken);
      facebook.api(
        `${pageId}_${postId}/likes?type=like&access_token=${accessToken}`,
        'post',
        response => {
          if (!response || response.error) reject(response.error);
          else resolve(response);
        }
      );
    }
  });
};

Facebook.prototype.commentFacebookPost = function (
  pageId,
  postId,
  comment,
  accessToken
) {
  return new Promise((resolve, reject) => {
    if (!pageId || !postId || !comment || !accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      facebook.setAccessToken(accessToken);
      const encodedComment = encodeURIComponent(comment);

      facebook.api(
        `${pageId}_${postId}/comments?message=${encodedComment}&acess_token=${accessToken}`,
        'post',
        response => {
          if (!response || response.error) {
            reject(response.error);
          } else {
            resolve(response);
          }
        }
      );
    }
  });
};

Facebook.prototype.getRecentFacebookFeeds = function (
  accessToken,
  socialId,
  since,
  facebookAppId,
  version
) {
  return new Promise((resolve, reject) => {
    if (!accessToken || !socialId || !since || !facebookAppId || !version) {
      reject(new Error('Invalid Inputs'));
    } else {
      getRecentFacebookFeeds(
        socialId,
        accessToken,
        since,
        (error, feedDetails) => {
          if (error != null || error) {
            reject(error);
          }
          const batchId = String(moment().unix());

          const postDetails = {
            feeds: [],
            batchId,
          };

          feedDetails.forEach(feed => {
            const feedtype = feed.attachments?.data[0].type;
            const feedId = feed.id.replace(`${socialId}_`, '');
            const privacy = feed.privacy.value;
            const createdTime = moment(feed.created_time).utc();
            const feedMessage = feed.message ? feed.message : '';
            const feedLink = `https://www.facebook.com/${feedId}`;
            const mediaUrls = [];
            let isApplicationPost = false;
            let sharedUrl = '';
            if (feed.application) {
              const applicationId = feed.application.id;

              if (applicationId == facebookAppId) {
                isApplicationPost = true;
              }
            }
            if (feedtype == 'photo' || feedtype == 'album') {
              if (feed.attachments && feed.attachments.data.length > 0) {
                feed.attachments.data.forEach(data => {
                  if (data.subattachments) {
                    data.subattachments.data.forEach(data => {
                      if (data.type == 'photo') {
                        const media = data.media.image.src;
                        mediaUrls.push(media);
                      }
                    });
                  } else if (data.type == 'photo') {
                    const media = data.media.image.src;
                    mediaUrls.push(media);
                  }
                });
              }
            } else if (feedtype == 'video') {
              const media = feed.source;
              mediaUrls.push(media);
            } else if (feedtype == 'share') {
              if (feed.attachments?.data[0]?.media?.source)
                sharedUrl = feed.attachments?.data[0]?.media?.source ?? '';
              else sharedUrl = feed.attachments?.data[0]?.url ?? '';
            }

            const feedObject = {
              postId: feedId,
              privacy,
              publishedDate: createdTime,
              postType: feedtype,
              description: feedMessage,
              postUrl: feedLink,
              isApplicationPost,
              mediaUrls,
              likeCount: feed.reactions
                ? feed.reactions.summary.total_count
                : 0,
              commentCount: feed.comments
                ? feed.comments.summary.total_count
                : 0,
              socialAccountId: socialId,
              sharedUrl,
              batchId,
              version,
            };

            postDetails.feeds.push(feedObject);
          });

          resolve(postDetails);
        }
      );
    }
  });
};

Facebook.prototype.getRecentFacebookPageFeeds = function (
  accessToken,
  socialId,
  since,
  facebookAppId,
  version
) {
  return new Promise((resolve, reject) => {
    if (!accessToken || !socialId || !since || !facebookAppId || !version) {
      reject(new Error('Invalid Inputs'));
    } else {
      getRecentFacebookPageFeeds(
        socialId,
        accessToken,
        since,
        (error, feedDetails) => {
          if (error != null || error) {
            reject(error);
          }
          const batchId = String(moment().unix());

          const postDetails = {
            feeds: [],
            batchId,
          };

          feedDetails?.forEach(feed => {
            const feedtype = feed.attachments?.data[0].type;
            const feedId = feed.id.replace(`${socialId}_`, '');
            const privacy = feed.privacy.value;
            const createdTime = moment(feed.created_time).utc();
            const feedMessage = feed.message ? feed.message : '';
            const feedLink = `https://www.facebook.com/${feedId}`;
            const mediaUrls = [];
            let isApplicationPost = false;
            let sharedUrl = '';
            if (feed.application) {
              const applicationId = feed.application.id;

              if (applicationId == facebookAppId) {
                isApplicationPost = true;
              }
            }
            if (feedtype == 'photo' || feedtype == 'album') {
              if (feed.attachments && feed.attachments.data.length > 0) {
                feed.attachments.data.forEach(data => {
                  if (data.subattachments) {
                    data.subattachments.data.forEach(data => {
                      if (data.type == 'photo') {
                        const media = data.media.image.src;

                        mediaUrls.push(media);
                      }
                    });
                  } else if (data.type == 'photo') {
                    const media = data.media.image.src;

                    mediaUrls.push(media);
                  }
                });
              }
            } else if (feedtype == 'video') {
              const media = feed?.source;

              mediaUrls.push(media);
            } else if (feedtype == 'video_inline') {
              feed.attachments.data.forEach(data => {
                mediaUrls.push(data.media.source);
              });
            } else if (feedtype == 'share') {
              if (feed.attachments?.data[0]?.media?.source)
                sharedUrl = feed.attachments?.data[0]?.media?.source ?? '';
              else sharedUrl = feed.attachments?.data[0]?.url ?? '';
            }

            const feedObject = {
              postId: feedId,
              privacy,
              publishedDate: createdTime,
              postType: feedtype,
              description: feedMessage,
              postUrl: feedLink,
              isApplicationPost,
              mediaUrls,
              likeCount: feed.reactions
                ? feed.reactions.summary.total_count
                : 0,
              commentCount: feed.comments
                ? feed.comments.summary.total_count
                : 0,
              socialAccountId: socialId,
              batchId,
              version,
              sharedUrl,
            };

            postDetails.feeds.push(feedObject);
          });

          resolve(postDetails);
        }
      );
    }
  });
};

// Fetching recent feeds from facebook
function getRecentFacebookFeeds(socialId, accessToken, since, callback) {
  // Changing the input time to Unix format
  const from = String(moment(since).unix());
  const currentUnixTime = String(moment().unix());
  // Setting access token

  facebook.setAccessToken(accessToken);
  // Calling graph-api for fetching feeds
  facebook.api(
    `${socialId}/feed?fields=link,privacy,message,source,attachments,created_time,description,reactions.summary(total_count),comments.summary(true),type,application&since=${from}&untill=${currentUnixTime}&limit=50`,
    response => {
      if (!response || response.error) {
        // Sending response back
        callback(response.error, null);
      } else {
        // Fetching data by paginations (checking we have new page data or not)
        pagination(response, (error, result) => {
          // Checking the callback contains error or not
          if (error || error != null) {
            callback(error, null);
          }
          const {data} = result;
          // Sending response back

          callback(null, data);
        });
      }
    }
  );
}
// Fetching recent feeds from facebook
function getRecentFacebookPageFeeds(socialId, accessToken, since, callback) {
  // Changing the input time to Unix format
  const from = String(moment(since).unix());
  const currentUnixTime = String(moment().unix());
  // Setting access token

  facebook.setAccessToken(accessToken);
  // Calling graph-api for fetching feeds
  facebook.api(
    `${socialId}/feed?fields=privacy,message,attachments,created_time,likes.summary(true),reactions.summary(total_count),comments.summary(true),application&since=${from}&untill=${currentUnixTime}&limit=50`,
    response => {
      if (!response || response.error) {
        // Sending response back
        callback(response.error, null);
      } else {
        // Fetching data by paginations (checking we have new page data or not)
        pagination(response, (error, result) => {
          // Checking the callback contains error or not
          if (error || error != null) {
            callback(error, null);
          }
          const {data} = result;
          // Sending response back

          callback(null, data);
        });
      }
    }
  );
}

Facebook.prototype.subscribeWebhooks = function (
  accessToken,
  socialId,
  subscribeFields
) {
  return new Promise((resolve, reject) => {
    request.post(
      `https://graph.facebook.com/${socialId}/subscribed_apps?subscribed_fields=${subscribeFields}&access_token=${accessToken}`,
      (error, response, body) => {
        if (error) {
        } else {
          const parsedBody = JSON.parse(body);

          if (parsedBody.success) {
            resolve(parsedBody);
          } else {
            resolve();
          }
        }
      }
    );
  });
};

Facebook.prototype.publishPost = async function (
  postDetails,
  accessToken,
  callback
) {
  const basePath = path.resolve(__dirname, '../../..');

  facebook.setAccessToken(accessToken);
  if (postDetails.postType == 'Text') {
    const fbPostData = {
      message: postDetails.message,
    };

    facebook.api(
      `/${postDetails.targetId}/feed`,
      'post',
      fbPostData,
      response => {
        if (!response || response.error) {
          callback({code: 400, status: 'failed', message: response});
        } else {
          callback({code: 200, status: 'success', message: response});
        }
      }
    );
  } else if (postDetails.postType == 'OldImage') {
    const imagePath = postDetails.mediaPath[0];
    const image = fs.createReadStream(`${basePath}/media/${imagePath}`);
    const fbPostData = {
      message: postDetails.message,
      Source: image,
    };

    facebook.api(
      `/${postDetails.targetId}/photos`,
      'post',
      fbPostData,
      response => {
        if (!response || response.error) {
          callback({code: 400, status: 'failed', message: response});
        } else {
          callback({code: 200, status: 'success', message: response});
        }
      }
    );
  } else if (postDetails.postType == 'Image') {
    const mediaIds = [];

    try {
      await Promise.all(
        postDetails.mediaPath.map(mediaUrl => {
          const image_1 = fs.createReadStream(`${basePath}/media/${mediaUrl}`);
          const fbPostData_2 = {
            message: `${postDetails.message} \n${postDetails.link ?? ''}`,
            Source: image_1,
            published: 'false',
          };

          return facebook
            .api(`/${postDetails.targetId}/photos`, 'post', fbPostData_2)
            .then(response_2 => {
              if (response_2.id) {
                mediaIds.push(response_2.id);
              }
            })
            .catch(error => {
              throw new Error(error.message);
            });
        })
      );
      if (mediaIds.length > 0) {
        const attachmentDetails = [];

        for (let index = 0; index < mediaIds.length; index++) {
          attachmentDetails.push(`{"media_fbid":"${mediaIds[index]}"}`);
        }
        const fbPostData_3 = {
          message: `${postDetails.message} \n${postDetails.link ?? ''}`,
          attached_media: attachmentDetails,
        };

        facebook.setAccessToken(accessToken);
        return facebook
          .api(`/${postDetails.targetId}/feed`, 'post', fbPostData_3)
          .then(response_3 => {
            callback({code: 200, status: 'success', message: response_3});
          })
          .catch(error_1 => {
            throw new Error(error_1.message);
          });
      }

      callback({
        code: 400,
        status: 'failed',
        message: "Can't able to post in facebook.",
      });
    } catch (error_2) {
      callback({code: 400, status: 'failed', message: error_2.message});
    }
  } else if (postDetails.postType == 'Link') {
    const fbPostData = {
      link: postDetails.link,
      message: postDetails.message,
    };

    facebook.api(
      `/${postDetails.targetId}/feed`,
      'post',
      fbPostData,
      response => {
        if (!response || response.error) {
          callback({code: 400, status: 'failed', message: response});
        } else {
          callback({code: 200, status: 'success', message: response});
        }
      }
    );
  } else if (postDetails.postType == 'Video') {
    const imagePath = postDetails.mediaPath[0];

    const video = fs.createReadStream(`${basePath}/media/${imagePath}`);
    const fbPostData = {
      description: `${postDetails.message} \n${postDetails.link ?? ''}`,
      Source: video,
    };

    facebook.api(
      `/${postDetails.targetId}/videos`,
      'post',
      fbPostData,
      response => {
        if (!response || response.error) {
          callback({code: 400, status: 'failed', message: response});
        } else {
          callback({code: 200, status: 'success', message: response});
        }
      }
    );
  } else {
    callback({code: 400, status: 'failed', error: 'Not a valid post.'});
  }
};

/**
 * TODO Publish Image/video InstaBusinessAccount
 * Function Publish Image/video InstaBusinessAccount
 * @param  {object} postDetails - Post details
 * @param  {string} accessToken - Insta Account token
 * @param  {number} social_id - Insta Account User Id
 * @return {object} return status of Insta Publish from callback
 */
Facebook.prototype.publishPostInsta = async function (
  postDetails,
  accessToken,
  social_id,
  callback
) {
  if (postDetails.postType == 'Image') {
    try {
      logger.info(`Insta Business Image post started....`);
      let base_image = config.get(`insta_base_path`) + postDetails.mediaPath[0];
      const dimensions = sizeOf(base_image)
      let updateimagPixel = await resizeImg(fs.readFileSync(base_image), {
        width: dimensions.width,
        height: dimensions.height,
      });
      let filename = `${String(moment().unix())}.jpg`;
      fs.writeFileSync(
        `${config.get(`insta_store_path`) + filename}`,
        updateimagPixel
      );
      let containerId = await new Promise((resolve, reject) => {
        let image_url = config.get(`insta_image_url`) + filename;
        postDetails.message = postDetails.message.replace('#', '%23');
        let containeUrl = `image_url=${image_url}&caption=${postDetails.message}+\n${postDetails.link ?? ''}&+access_token=${accessToken}`;
        request.post(
          {
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: `https://graph.facebook.com/${social_id}/media?`,
            body: containeUrl,
          },
          (error, response, body) => {
            if (error) {
              logger.error(
                `Error getting conatiner Id publishPostInsta Image ${error}`
              );
              reject(error);
            } else {
              let parsedResponse = JSON.parse(body);
              logger.info(
                `parsedResponse while feching the Image Publish Container Id ${JSON.stringify(
                  parsedResponse
                )}`
              );
              resolve(parsedResponse.id);
            }
          }
        );
      });
      let instapostId = await new Promise((resolve, reject) => {
        let publishUrl = `creation_id=${containerId}&access_token=${accessToken}`;
        request.post(
          {
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: `https://graph.facebook.com/${social_id}/media_publish?`,
            body: publishUrl,
          },
          (error, response, body) => {
            if (error) {
              logger.error(
                `Error getting Publish Id publishPostInsta Image ${error}`
              );
              reject(error);
            } else {
              let response = JSON.parse(body);
              logger.info(
                `response while feching the Image  Publish Id ${JSON.stringify(
                  response
                )}`
              );
              resolve(response.id);
            }
          }
        );
      });
      return instapostId;
    } catch (error) {
       logger.error(`Error while Publishing Image Insta Business ${error}`);
       throw new Error(error?.message)
    }
  } else if (postDetails.postType == 'Video') {
      logger.info(`Insta Business Video post started....`);
       try {
        const InstaVideoContainerId= await getInstaVideoContainerId(postDetails,social_id,accessToken)
        logger.info(`Insta Container Id ${InstaVideoContainerId} `)
        setTimeout(async () => {
          try {
            const InstaVideoPublishId= await  pushInstaVideo(InstaVideoContainerId,social_id,accessToken)
            logger.info(`Insta Publish Id ${InstaVideoPublishId}`)
             return InstaVideoPublishId;
          } catch (error) {
            logger.info(`Error while hitting Insta Publish API with container Id ${error}`)
            throw new Error(error?.message)
          }
        }, 30000);
       } catch (error) {
         logger.info(`Error in Insta publish video Publish ${error} `)
         throw new Error(error?.message)

       }
    } else {
    callback({code: 400, status: 'failed', error: 'Not a valid type.'});
   }
};


/**
 * TODO  get the video container id for  InstaBusinessAccount
 * Function get the video container id for  InstaBusinessAccount
 * @param {object} postDetails - Post details
 * @param {number} social_id - Insta Account User Id
 * @param {string} accessToken - Insta Account token
 * @return {number}  return video Container Id
 */
async function getInstaVideoContainerId(postDetails,social_id,accessToken){
  let conatinerId=  await new Promise((resolve,reject)=>{
    let link =config.get(`insta_media_url`) + `${postDetails.mediaPath[0]}`;
    let data = qs.stringify({
      video_url: link,
      access_token: `${accessToken}`,
      media_type: 'VIDEO',
      caption: `${postDetails?.message}+\n${postDetails?.link ?? ''}`
    });
    let configuration = {
      method: 'post',
      url: `https://graph.facebook.com/${social_id}/media`,
      headers: { 
        'content-type': 'application/x-www-form-urlencoded'
      },
      data : data
    };
     axios(configuration) 
     .then( (response)=> {
     resolve (response?.data?.id)
    })
    .catch((error)=> {
      logger.info(`Error in getting the insta Video Container Id ${error}`)
      reject(error)
    }); 
   })
   return conatinerId;
}

/**
 * TODO  get the video publish id for  InstaBusinessAccount
 * Function get the video publish id for  InstaBusinessAccount
 * @param {number} con_id - Insta video container id
 * @param {number} s_id - Insta Account User Id
 * @param {string} token - Insta Account token
 * @return {string}  return video publish Id
 */
async function pushInstaVideo(con_id,s_id,token){
  let publishId= await new Promise((resolve,reject)=>{
  let data = qs.stringify({
    access_token: `${token}`,
    creation_id: `${con_id}` 
  });
  let publishconfig = {
    method: 'post',
    url: `https://graph.facebook.com/${s_id}/media_publish`,
    headers: { 
      'content-type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
  axios(publishconfig)
  .then( (response)=> {
    logger.info(`Response of the Insta Video publish  with conatiner Id ${response} `)
    resolve (response?.data?.id)
  })
  .catch( (error)=> {
    logger.info(`Error in getting the insta Video Publish Id ${error}`)
    reject(error)
    });
  })
  return publishId;
}

/**
 * TODO  get the ShortCodeUrl for  InstaBusinessAccount
 * Function get the get the ShortCodeUrl for  InstaBusinessAccount
 * @param {number} social_id - Insta Account User Id
 * @param {string} accessToken - Insta Account token
 * @param {number} post_id - Insta video Post Id
 * @return {string}  return Post ShortCodeUrl
 */
Facebook.prototype.getShortCodeUrl= async function (social_id,accessToken,post_id){
  return new Promise ((resolve,reject)=>{
  let config = {
    method: 'get',
    url: `https://graph.facebook.com/${social_id}/media?fields=shortcode&access_token=${accessToken}`,
  };
    let res={}
    axios(config)
    .then((response)=> {
             response?.data?.data.map((t)=>{
              if(t?.id == post_id ){
                res.id=t?.id,
                res.url=`https://www.instagram.com/p/${t?.shortcode}`
              }
            })
            resolve(res)
        })
    .catch((error)=> {
      logger.info(`Error while getting the ShortCode Url ${error}`)
      reject(error?.message) 
  })
})
}

Facebook.prototype.fbPageInsights = function (
  accessToken,
  socialId,
  sinces,
  untill,
  dataPreset
) {
  let url = '';
  const since = new Date(sinces);

  since.setDate(since.getDate() - 1);
  const sinceunixTimestamp = Math.floor(new Date(since).getTime() / 1000);
  const untillunixTimestamp = Math.floor(new Date(untill).getTime() / 1000);

  if ((since && untill && since != -1) || untill != -1) {
    url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&since=${sinceunixTimestamp}&until=${untillunixTimestamp}&access_token=${accessToken}`;
  } else if (dataPreset) {
    url = `https://graph.facebook.com/${fbversion}/me/insights?pretty=0&metric=page_fan_adds%2Cpage_fan_removes%2Cpage_impressions%2Cpage_impressions_unique%2Cpage_impressions_by_story_type%2Cpage_impressions_organic%2Cpage_impressions_viral%2Cpage_impressions_paid%2Cpage_impressions_by_age_gender_unique%2Cpage_content_activity%2Cpage_content_activity_by_action_type%2Cpage_content_activity_by_age_gender_unique&date_preset=${dataPreset}&access_token=${accessToken}`;
  }

  return new Promise((resolve, reject) =>
    request.get(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        const parsedBody = JSON.parse(body);
        // Sending response

        resolve(parsedBody);
      }
    })
  );
};

Facebook.prototype.getFbPageStats = function (accessToken) {
  const url = `https://graph.facebook.com/${fbversion}/me?fields=fan_count,new_like_count,link,picture.type(large)&access_token=${accessToken}`;

  return new Promise((resolve, reject) => {
    // Checking the input data, that "accessToken" is having data or not
    if (!accessToken) {
      reject(new Error('Access Token Missing'));
    } else {
      // Hitting facebook  with the above url to get data
      return request.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          // Formating the body
          const result = JSON.parse(body);
          const updateDetail = {
            follower_count: result.fan_count ? result.fan_count : 0,
            profile_picture: result.picture ? result.picture.data.url : null,
            total_like_count: result.new_like_count ? result.new_like_count : 0,
          };
          // Sending response

          resolve(updateDetail);
        }
      });
    }
  });
};

Facebook.prototype.getInstaBusinessStats = function (accessToken) {
  const url = `https://graph.facebook.com/${fbversion}/me/?fields=access_token,connected_instagram_account,instagram_accounts.limit(20){id,follow_count,followed_by_count,has_profile_picture,username,profile_pic,media_count,is_private,is_published}&access_token=${accessToken}`;

  return new Promise((resolve, reject) =>
    // Hitting the url with get request to get all the Instagram business statistics
    request.get(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        // Formating the body to fetch the required fields
        const parsedBody = JSON.parse(body);
        const updateDetail = {
          follower_count:
            parsedBody?.instagram_accounts?.data[0]?.followed_by_count ?? 0,
          following_count:
            parsedBody?.instagram_accounts?.data[0]?.follow_count ?? 0,
          total_post_count:
            parsedBody?.instagram_accounts?.data[0]?.media_count ?? 0,
          profile_picture: parsedBody?.instagram_accounts?.data[0]?.profile_pic,
        };
        // Sending response
        resolve(updateDetail);
      }
    })
  );
};

/**
 * TODO get the Pages Connected With Insta
 * Function to get the Pages Connected With Insta
 * @param  {string} code - InstaBusinessAccount Auth Code
 * @param  {string} redirect_url - InstaBusinessAccount redirect Url
 * @return {object} Returns Pages Connected With Insta Details
 */
Facebook.prototype.getPagesConnectWithInsta = function (code, redirect_url) {
  return new Promise((resolve, reject) => {
    this.getProfileAccessToken(code, redirect_url)
      .then(accessToken => {
        return getPagesConnectWithInsta(accessToken);
      })
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        logger.error(`Error while getting getPagesConnectWithInsta ${error} `);
        reject(error);
      });
  });
};

/**
 * TODO get InstaBusinessAccount Details
 * Function to get the InstaBusinessAccount Details
 * @param  {string} accessToken - InstaBusinessAccount Accesss TOken
 * @return {object} Returns InstaBusinessAccount Details
 */
Facebook.prototype.getInstaBusinessAccount = function (accessToken) {
  let url = `https://graph.facebook.com/${fbversion}/me/?fields=access_token,connected_instagram_account,instagram_accounts.limit(20){id,follow_count,followed_by_count,has_profile_picture,username,profile_pic,media_count,is_private,is_published}&access_token=${accessToken}`;
  return new Promise((resolve, reject) => {
    return request.get(url, (error, response, body) => {
      if (error) {
        logger.error(`Error in getInstaBusinessAccount ${error} `);
        reject(error);
      } else {
        let parsedBody = JSON.parse(body);
        resolve(parsedBody);
      }
    });
  });
};

/**
 * TODO get Media Details From Instagram Business
 * Function to get Media Details From Instagram Business
 * @param  {string} accessToken - InstaBusinessAccount Accesss TOken
 * @param  {number} socialId - InstaBusinessAccount User Id
 * @return {object} Returns InstaBusiness Account Media Details
 */
Facebook.prototype.getMediasFromInstagram = function (accessToken, socialId) {
  return new Promise((resolve, reject) => {
    facebook.setAccessToken(accessToken);
    facebook.api(
      `${socialId}/media?fields=id,media_type,media_url,owner,timestamp,caption,comments_count,like_count,username,comments,ig_id,permalink`,
      response => {
        if (!response || response.error) {
          logger.error(`Error in getMediasFromInstagram ${response.error}`);
          reject(response.error);
        } else {
          let batchId = String(moment().unix());
          let postDetails = {
            feeds: [],
            batchId: batchId,
          };
          response.data.map(feed => {
            let feedObject = {
              postId: feed.id,
              captions: feed.caption ? feed.caption : '',
              mediaType: feed.media_type ? feed.media_type : '',
              mediaUrls: [feed.media_url ? feed.media_url : ''],
              publishedDate: moment(feed.timestamp).utc(),
              instagramId: feed.ig_id ? feed.ig_id : '',
              socialAccountId: socialId,
              ownerId: feed.owner && feed.owner.id ? feed.owner.id : '',
              ownerUserName: feed.username ? feed.username : '',
              likeCount: feed.like_count ? feed.like_count : 0,
              commentCount: feed.comments_count ? feed.comments_count : 0,
              createdDate: moment().utc(),
              permalink: feed.permalink ? feed.permalink : '',
              batchId: batchId,
              version: this.facebook_api.version,
            };
            postDetails.feeds.push(feedObject);
          });
          resolve(postDetails);
        }
      }
    );
  });
};

/**
 * TODO get the Pages Connected With Insta
 * Function to get the Pages Connected With Insta
 * @param  {string} accessToken - InstaBusinessAccount accessToken
 * @return {object} Returns Pages Connected With Insta Details
 */
function getPagesConnectWithInsta(accessToken) {
  let url = `https://graph.facebook.com/${fbversion}/me/accounts?fields=id,connected_instagram_account,access_token&access_token=${accessToken}`;
  return new Promise((resolve, reject) => {
    return request.get(url, (error, response, body) => {
      if (error) {
        logger.error(`Error while getting getPagesConnectWithInsta  ${error}`);
        reject(error);
      } else {
        let parsedBody = JSON.parse(body);
        resolve(parsedBody);
      }
    });
  });
}

/**
 * TODO get Publsh limit  From Instagram Business User
 * Function to get Publsh limit  From Instagram Business User
 * @param  {string} accessToken - InstaBusinessAccount Accesss TOken
 * @param  {number} userId - InstaBusinessAccount User Id
 * @return {object} Returns InstaBusiness User Publish Limit
 */
Facebook.prototype.getInstaBusinessPublishLimit = function (
  userId,
  accessToken
) {
  return new Promise((resolve, reject) => {
  try {
    let url = `https://graph.facebook.com/${userId}/content_publishing_limit?access_token=${accessToken}`;
    return request.get(url, (error, response, body) => {
      let parsedBody = JSON.parse(body);
      if (parsedBody?.error) {
        logger.error(`Error while getting getPagesConnectWithInsta  ${error}`);
        reject(parsedBody?.error?.message);
      } else {
        let quota_used = parsedBody?.data[0]?.quota_usage;
        let quota_left =
          config.get('instagram_business_api.maximum_post_per_day') -
          quota_used;
        logger.info(
          `getInstaBusinessPublishLimit resposne ${JSON.stringify(parsedBody)}`
        );
        resolve(quota_left);
      }
    });
  } catch (error) {
    reject(error?.message)
  }
});
};
/**
 * TODO get RecentInstaProfilePicture  From Instagram Business User
 * Function to get RecentInstaProfilePicture  From Instagram Business User
 * @param  {string} accessToken - InstaBusinessAccount Accesss TOken
 * @return {object} Returns InstaBusiness User Profile Picture
 */
Facebook.prototype.getRecentInstaProfilePicture = function (accessToken) {
  return new Promise((resolve, reject) => {
    let url = `https://graph.facebook.com/v11.0/me/?fields=instagram_accounts.limit(20){profile_pic}&access_token=${accessToken}`;
    return request.get(url, (error, response, body) => {
      if (error) {
        logger.error(`Error while getting getPagesConnectWithInsta  ${error}`);
        reject(error);
      } else {
        let parsedBody = JSON.parse(body);
        logger.info(
          `getRecentInstaProfilePicture  ${JSON.stringify(parsedBody)}`
        );
        let profie_pic = parsedBody?.instagram_accounts?.data[0]?.profile_pic;
        resolve(profie_pic);
      }
    });
  });
};
export default Facebook;
