// const request = require('request');
// const requestPromise = require('request-promise');
import request from 'request';
import requestPromise from 'request-promise';
import {createRequire} from 'module';
import path, {dirname} from 'path';
import moment from 'moment';
import {fileURLToPath} from 'url';
import fs from 'fs';
import axios from 'axios';
import logger from '../../Publish/resources/Log/logger.log.js';
import config from 'config';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));

function LinkedIn(linkedIn_api) {
  this.linkedIn_api = linkedIn_api;
  this.LinkedInApiConfig = require('node-linkedin')(
    linkedIn_api.client_id,
    linkedIn_api.client_secret,
    linkedIn_api.redirect_url_page
  );
  this.scope = [
    'r_emailaddress',
    'w_organization_social',
    'r_basicprofile',
    'r_liteprofile',
    'r_organization_social',
    'rw_organization_admin',
    'w_member_social',
  ];
}

LinkedIn.prototype.getOAuthUrl = function (state, redirectUrl) {
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
    this.linkedIn_api.client_id
  }&redirect_uri=${redirectUrl}&scope=${config.get('linkedIn_api.scope')}`;
};
LinkedIn.prototype.addLinkedInProfile = function (
  network,
  teamId,
  code,
  redirectUrl
) {
  let accessTokenData;
  return new Promise((resolve, reject) => {
    if (!code) {
      reject("Can't get code from linkedIn!");
    } else {
      // Calling a function to fetch the accessToken by giving user code
      return this.getProfileAccessToken(code, redirectUrl)
        .then(response => {
          accessTokenData = response;
          // Checking whether it gave user accessToken or not
          if (!response.access_token)
            throw new Error("Can't get access token from linkedIn!");
          // Fetching user profile details with user accessToken
          else {
            return this.getProfileDetails(response.access_token);
          }
        })
        .then(userDetails => {
          // Formating the details
          const user = {
            UserName: userDetails.user_id,
            FirstName: userDetails.first_name,
            LastName: userDetails.last_name ? userDetails.last_name : '',
            Email: userDetails.email,
            SocialId: userDetails.user_id,
            ProfilePicture: userDetails.picture_url
              ? userDetails.picture_url
              : 'https://i.imgur.com/fdzLeWY.png',
            ProfileUrl: userDetails.profile_url,
            AccessToken: userDetails.access_token,
            RefreshToken: accessTokenData.refresh_token,
            FriendCount: userDetails.friend_count,
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

LinkedIn.prototype.getProfileAccessToken = function (code, redirectUrl) {
  return new Promise((resolve, reject) => {
    const postParameters = {
      method: 'POST',
      uri: 'https://www.linkedin.com/oauth/v2/accessToken',
      // Making a JSON object of inputs in request
      qs: {
        grant_type: 'authorization_code',
        client_id: this.linkedIn_api.client_id,
        client_secret: this.linkedIn_api.client_secret,
        redirect_uri: redirectUrl,
        code,
      },
      json: true,
    };
    // Hitting linkedin api to get access token

    return requestPromise(postParameters)
      .then(response => {
        // Sending response
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * TODO To get Company Page Access Token
 * Function to To get Company Page Access Token
 * @param  {string} code -Code from linkedIn redirect url
 * @returns {string} access_token -Access token of a page
 */
LinkedIn.prototype.getCompanyPageAccessToken = function (code, redirectUrl) {
  return new Promise((resolve, reject) => {
    const postParameters = {
      method: 'POST',
      uri: 'https://www.linkedin.com/oauth/v2/accessToken',
      // Making a JSON object of inputs in request
      qs: {
        grant_type: 'authorization_code',
        client_id: this.linkedIn_api.client_id,
        client_secret: this.linkedIn_api.client_secret,
        redirect_uri: redirectUrl,
        code,
      },
      json: true,
    };
    // Hitting linkedin api to get access token

    return requestPromise(postParameters)
      .then(response => {
        // Sending response
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

LinkedIn.prototype.getProfileDetails = function (accessToken) {
  return new Promise((resolve, reject) => {
    let profileDetails;

    if (!accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      const requestInfo = {
        method: 'GET',
        uri: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),emailAddress,vanityName,headline)',
        headers: {Authorization: `Bearer ${accessToken}`},
      };
      // Hitting linkedin api to get profile details with accessToken

      return requestPromise(requestInfo)
        .then(details => {
          // Formating the response into JSON
          profileDetails = JSON.parse(details);
          // Formating whole JSON into required object
          const requestInfo = {
            method: 'GET',
            uri: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            headers: {Authorization: `Bearer ${accessToken}`},
          };

          return requestPromise(requestInfo);
        })
        .then(result => {
          const data = JSON.parse(result);

          return ParseProfileInfo(profileDetails, accessToken, data);
        })
        .then(profileInfo => {
          // Sending response
          resolve(profileInfo);
        })
        .catch(error => {
          // Checking the error of no profile pic
          if (
            error.message.includes(
              "Cannot read property 'displayImage' of undefined"
            )
          ) {
            const requestInfo = {
              method: 'GET',
              uri: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),emailAddress,vanityName,headline)',
              headers: {Authorization: `Bearer ${accessToken}`},
            };
            // Hitting linkedin api to get profile details with accessToken

            return requestPromise(requestInfo)
              .then(details => {
                // Formating the response into JSON
                profileDetails = JSON.parse(details);
                // Formating whole JSON into required object
                const requestInfo = {
                  method: 'GET',
                  uri: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
                  headers: {Authorization: `Bearer ${accessToken}`},
                };

                return requestPromise(requestInfo);
              })
              .then(result => {
                const data = JSON.parse(result);

                return ParseProfileInfo(profileDetails, accessToken, data);
              })
              .then(profileInfo => {
                // Sending response
                resolve(profileInfo);
              })
              .catch(error => {
                reject(error);
              });
          }
          reject(error);
        });
    }
  });
};

function ParseProfileInfo(profileDetails, accessToken, data) {
  return new Promise((resolve, reject) => {
    // logger.info("Informations");
    // logger.info(profileDetails);
    // Formating the response in a structural object useful to insert into DB
    const profileInfo = {
      user_id: profileDetails.id,
      email: data
        ? data.elements[0]['handle~'].emailAddress
          ? data.elements[0]['handle~'].emailAddress
          : ''
        : '',
      // birthday: response.birthday,
      first_name: profileDetails.firstName.localized.en_US,
      last_name: profileDetails.lastName.localized.en_US
        ? profileDetails.lastName.localized.en_US
        : '',
      profile_url: profileDetails.vanityName
        ? `https://www.linkedin.com/in/${profileDetails.vanityName}`
        : '',
      picture_url: profileDetails.profilePicture
        ? profileDetails.profilePicture['displayImage~'].elements[3]
            .identifiers[0].identifier
          ? profileDetails.profilePicture['displayImage~'].elements[3]
              .identifiers[0].identifier
          : ''
        : '',
      // coverpic_url: profileDetails.backgroundPicture ? profileDetails.backgroundPicture['displayImage~'].elements[3].identifiers[0].identifier ? profileDetails.backgroundPicture['displayImage~'].elements[3].identifiers[0].identifier : "" : '',
      friend_count: '0',
      access_token: accessToken,
      info: profileDetails.headline ? profileDetails.headline : '',
    };
    // Sending response

    resolve(profileInfo);
  });
}

LinkedIn.prototype.getV1OAuthUrl = function (state) {
  // return this.LinkedInApiConfig.auth.authorize(this.scope, state);
  return this.LinkedInApiConfig.auth.authorize(this.scope);
};
LinkedIn.prototype.getOAuthLinkedPageUrl = function (redirectUrl) {
  return `https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=${
    this.linkedIn_api.client_id
  }&redirect_uri=${redirectUrl}&scope=${config.get('linkedIn_api.scope')}`;
};

LinkedIn.prototype.getCompanyProfileDetails = function (code, redirectUrl) {
  let accessTokenData;
  return new Promise((resolve, reject) =>
    this.getCompanyPageAccessToken(code, redirectUrl)
      .then(response => {
        accessTokenData = response;
        if (!response.access_token)
          throw new Error("Can't get access token from linkedIn!");
        else {
          let uri = `https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organizationalTarget~(id,name,vanityName,localizedName,logoV2(original~:playableStreams))))&count=50&start=0`;
          const linkedInCompanyPages = {
            method: 'GET',
            uri,
            headers: {
              Authorization: `Bearer ${response.access_token}`,
              'X-Restli-Protocol-Version': '2.0.0',
            },
          };
          return requestPromise(linkedInCompanyPages)
            .then(response => {
              resolve({
                response: JSON.parse(response),
                access_token: accessTokenData.access_token,
                refresh_token: accessTokenData.refresh_token,
              });
            })
            .catch(error => {
              reject(error);
            });
        }
      })
      .catch(error => {
        reject(error);
      })
  );
};

LinkedIn.prototype.publishPostOnCompany = function (
  postDetails,
  accessToken,
  callback
) {
  const linkedin = this.LinkedInApiConfig.init(accessToken);

  if (postDetails.postType == 'Text') {
    linkedin.companies.share(
      postDetails.targetId,
      {
        comment: postDetails.message,
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else if (postDetails.postType == 'Image') {
    linkedin.companies.share(
      postDetails.targetId,
      {
        content: {
          title: postDetails.message,
          description: '',
          'submitted-url': postDetails.mediaPath,
          'submitted-image-url': postDetails.mediaPath,
        },
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else if (postDetails.postType == 'Video') {
    linkedin.companies.share(
      postDetails.targetId,
      {
        content: {
          title: postDetails.message,
          description: '',
          'submitted-url': postDetails.mediaInfos.media_url,
          'submitted-image-url': postDetails.mediaInfos.thumbnail_url,
        },
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else if (postDetails.postType == 'Link') {
    linkedin.companies.share(
      postDetails.targetId,
      {
        content: {
          'submitted-url': postDetails.link,
        },
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else {
    callback({code: 400, status: 'failed', error: 'Not a valid post.'});
  }
};

function uploadImages(url, accessToken, imagePath) {
  try {
    const basePath = path.resolve(__dirname, '../../..');
    const filePath = `${basePath}/media/${imagePath}`;
    const extenstion = require('path').extname(filePath).substr(1);

    return new Promise((resolve, reject) => {
      const formData = {
        file: {
          value: require('fs').createReadStream(filePath),
          options: {
            filename: filePath,
            contentType: `images/${extenstion}`,
          },
        },
      };

      const postParameter = {
        method: 'POST',
        uri: url,
        // host: `api.linkedin.com`,
        headers: {
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': `images/${extenstion}`,
          Accept: '*/*',
          'Content-Type': 'application/octet-stream',
        },
        formData: {
          image: fs.createReadStream(filePath),
        },
        resolveWithFullResponse: true,
      };

      return requestPromise(postParameter)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  } catch (error) {
    logger.info(error);
  }
}

function registerMedia(accessToken, target, userName) {
  return new Promise((resolve, reject) => {
    const postParameter = {
      method: 'POST',
      uri: 'https://api.linkedin.com/v2/assets?action=registerUpload',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: {
        registerUploadRequest: {
          owner: `urn:li:${target}:${userName}`,
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          serviceRelationships: [
            {
              identifier: 'urn:li:userGeneratedContent',
              relationshipType: 'OWNER',
            },
          ],
          supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
        },
      },
      json: true,
    };

    return requestPromise(postParameter)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function uploadVideo(url, accessToken, imagePath) {
  try {
    const basePath = path.resolve(__dirname, '../../..');
    const filePath = `${basePath}/media/${imagePath}`;
    const extenstion = require('path').extname(filePath).substr(1);

    return new Promise((resolve, reject) => {
      const formData = {
        file: {
          value: require('fs').createReadStream(filePath),
          options: {
            filename: filePath,
            contentType: `images/${extenstion}`,
          },
        },
      };
      const postParameter = {
        method: 'POST',
        uri: url,
        // host: `api.linkedin.com`,
        headers: {
          // 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': `images/${extenstion}`,
          Accept: '*/*',
          'Content-Type': 'application/octet-stream',
        },
        formData: {
          image: fs.createReadStream(filePath),
        },
        resolveWithFullResponse: true,
      };

      return requestPromise(postParameter)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  } catch (error) {
    logger.info(error);
  }
}

function registerMediaVideo(accessToken, target, userName) {
  return new Promise((resolve, reject) => {
    const postParameter = {
      method: 'POST',
      uri: 'https://api.linkedin.com/v2/assets?action=registerUpload',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: {
        registerUploadRequest: {
          owner: `urn:li:${target}:${userName}`,
          recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
          serviceRelationships: [
            {
              identifier: 'urn:li:userGeneratedContent',
              relationshipType: 'OWNER',
            },
          ],
        },
      },
      json: true,
    };

    return requestPromise(postParameter)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
}

LinkedIn.prototype.publishPost = function (
  target,
  postDetails,
  accessToken,
  userName
) {
  return new Promise((resolve, reject) => {
    const linkedin = this.LinkedInApiConfig.init(accessToken);

    if (postDetails.postType == 'Text') {
      if (postDetails.postType == 'Text') {
        var postParameters = {
          method: 'POST',
          uri: 'https://api.linkedin.com/v2/shares',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json',
          },
          body: {
            owner: `urn:li:${target}:${userName}`,
            text: {text: postDetails.message},
            distribution: {
              linkedInDistributionTarget: {anyOne: true},
            },
          },
          json: true,
        };

        return requestPromise(postParameters)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      }
    } else if (postDetails.postType == 'Image') {
      const basePath = path.resolve(__dirname, '../../..');
      const filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
      const contentType = require('path').extname(filePath).substr(1);
      let imageData;
      let asset;
      const promise = fs.promises.readFile(filePath);

      promise
        .then(buffer => {
          imageData = buffer;

          return registerMedia(accessToken, target, userName);
        })
        .then(result => {
          const url =
            result.value.uploadMechanism[
              'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
            ].uploadUrl;
          const assetId = result.value.asset.replace(
            'urn:li:digitalmediaAsset:',
            ''
          );

          asset = result.value.asset;

          return axios.put(url, imageData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': contentType,
            },
          });
        })
        .then(() => {
          const postParameters = {
            method: 'POST',
            uri: 'https://api.linkedin.com/v2/shares',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'content-type': 'application/json',
            },
            body: {
              owner: `urn:li:${target}:${userName}`,
              text: {
                text: `${postDetails.message} \n${postDetails.link ?? ''}`,
              },
              distribution: {
                linkedInDistributionTarget: {anyOne: true},
              },
              content: {
                contentEntities: [
                  {
                    entity: `${asset}`,
                  },
                ],
                shareMediaCategory: 'IMAGE',
              },
            },
            json: true,
          };

          return requestPromise(postParameters)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        });
    } else if (postDetails.postType == 'Video') {
      const basePath = path.resolve(__dirname, '../../..');
      const filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
      const contentType = require('path').extname(filePath).substr(1);
      let imageData;
      let asset;
      const promise = fs.promises.readFile(filePath);

      promise
        .then(buffer => {
          imageData = buffer;

          return registerMediaVideo(accessToken, target, userName);
        })
        .then(result => {
          const url =
            result.value.uploadMechanism[
              'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
            ].uploadUrl;
          const assetId = result.value.asset.replace(
            'urn:li:digitalmediaAsset:',
            ''
          );
          asset = result.value.asset;
          return axios.put(url, imageData, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Type': contentType,
            },
          });
        })
        .then(() =>
          axios.get(
            `https://api.linkedin.com/v2/assets/${asset.replace(
              'urn:li:digitalmediaAsset:',
              ''
            )}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
              },
            }
          )
        )
        .then(response => {
          const {status} = response.data.recipes[0];
          resolve({asset, status});
        })
        .catch(error => reject(error));
    } else if (postDetails.postType == 'Link') {
      var postParameters = {
        method: 'POST',
        uri: 'https://api.linkedin.com/v2/shares',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        body: {
          owner: `urn:li:${target}:${userName}`,
          // "text": { "text": postDetails.message, },
          content: {
            contentEntities: [
              {
                entity: 'urn:li:article:0',
                entityLocation: postDetails.link,
                // "thumbnails": [
                //     {
                //         "imageSpecificContent": {},
                //         "resolvedUrl": "https://www.example.com/image.jpg"
                //     }
                // ]
              },
            ],
            // "description": postDetails.message,
            title: postDetails.message,
          },
          distribution: {
            linkedInDistributionTarget: {anyOne: true},
          },
        },
        json: true,
      };

      return requestPromise(postParameters)
        .then(response => {
          resolve(response.body);
        })
        .catch(error => {
          reject(error);
        });
    } else {
      reject({code: 400, status: 'failed', error: 'Not a valid post.'});
    }
  });
};

LinkedIn.prototype.publishV1PostOnProfile = function (
  postDetails,
  accessToken,
  callback
) {
  const linkedin = this.LinkedInApiConfig.init(accessToken);

  if (postDetails.postType == 'Text') {
    linkedin.people.share(
      {
        comment: postDetails.message,
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else if (postDetails.postType == 'Image') {
    linkedin.people.share(
      {
        content: {
          title: postDetails.message,
          description: '',
          'submitted-url': postDetails.mediaPath,
          'submitted-image-url': postDetails.mediaPath,
        },
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else if (postDetails.postType == 'Video') {
    linkedin.people.share(
      {
        content: {
          title: postDetails.message,
          description: '',
          'submitted-url': postDetails.mediaInfos.media_url,
          'submitted-image-url': postDetails.mediaInfos.thumbnail_url,
        },
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else if (postDetails.postType == 'Link') {
    linkedin.people.share(
      {
        content: {
          'submitted-url': postDetails.link,
        },
        visibility: {code: 'anyone'},
      },
      (error, share) => {
        if (error) {
          callback({code: 400, status: 'failed', message: error});
        } else {
          callback({code: 200, status: 'success', message: share});
        }
      }
    );
  } else {
    callback({code: 400, status: 'failed', error: 'Not a valid post.'});
  }
};

LinkedIn.prototype.getCompanyUpdates = function (companyId, accessToken) {
  return new Promise((resolve, reject) => {
    if (!companyId || !accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      const linkedin = this.LinkedInApiConfig.init(accessToken);

      linkedin.companies.updates(companyId, (error, updates) => {
        if (error) {
          reject(error);
        } else {
          resolve(updates);
        }
      });
    }
  });
};

LinkedIn.prototype.getCompanyInsights = function (
  accessToken,
  socialId,
  since,
  untill
) {
  return new Promise((resolve, reject) => {
    const report = {};
    const statusUpdateUrl = `https://api.linkedin.com/v1/companies/${socialId}/company-statistics?time-granularity=day&start-timestamp=${since}&format=json&oauth2_access_token=${accessToken}`;

    request.get(statusUpdateUrl, (error, response, body) => {
      if (error) reject(error);
      else {
        report.companyStatistics = JSON.parse(body);
      }
      const followerUpdateUrl = `https://api.linkedin.com/v1/companies/${socialId}/historical-follow-statistics?time-granularity=day&start-timestamp=${since}&end-timestamp=${untill}&format=json&oauth2_access_token=${accessToken}`;

      request.get(followerUpdateUrl, (error, response, body) => {
        if (error) reject(error);
        else {
          report.companyFollowersStatistics = JSON.parse(body);
          resolve(report);
        }
      });
    });
  });
};

/**
 * TODO To share video to liked In after upload got finished
 * Function to share video to liked In after upload got finished
 * @param  {string} accessToken -Access token of linkedin account
 * @param  {string} target -Target for linkedin api Person or company
 * @param  {string} userName -LinkedIn account username
 * @param  {string} asset -Asset id return by register media api
 * @param  {string} status -Media upload status returned by linkedin
 * @param  {string} message -Media description
 */
LinkedIn.prototype.shareUploadVideo = function (
  accessToken,
  target,
  userName,
  asset,
  status,
  message
) {
  return new Promise((resolve, reject) => {
    const postParameters = {
      method: 'POST',
      uri: 'https://api.linkedin.com/v2/ugcPosts',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: {
        author: `urn:li:${target}:${userName}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            media: [
              {
                media: `${asset}`,
                status,
              },
            ],
            shareCommentary: {
              attributes: [],
              text: message,
            },
            shareMediaCategory: 'VIDEO',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      json: true,
    };

    setTimeout(async () => {
      try {
        const response = await requestPromise(postParameters);
        resolve(response);
      } catch (error) {}
    }, 20000);
  });
};

/**
 * TODO To Get LinkedIn Page Feeds
 * Function To Get LinkedIn Page Feeds
 * @param  {string} companyId -LinkedIn page Id.
 * @param {string} accessToken -Access token of a page
 * @param {string} start -Pagination for LinkedIn api
 * @returns {object} LinkedIn page feeds
 */
LinkedIn.prototype.getCompanyFeeds = function (
  companyId,
  accessToken,
  start = 0
) {
  return new Promise((resolve, reject) => {
    if (!companyId || !accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      let request = require('request');
      let options = {
        method: 'GET',
        url: `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn%3Ali%3Acompany%3A${companyId})&count=100&projection=(paging,elements*(name,localizedName,id,firstPublishedAt,vanityName,created,specificContent(reactions,com.linkedin.ugc.ShareContent(shareMediaCategory,shareCommentary,media(*(media~:playableStreams,originalUrl,description,title))))))&start=${start}`,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
          Authorization: `Bearer ${accessToken}`,
        },
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        response = parseFeedsData(JSON.parse(response.body), companyId);
        resolve(response);
      });
    }
  });
};

/**
 * TODO To Parse LinkedIn Page Feeds
 * Function To Parse LinkedIn Page Feeds
 * @param  {string} companyId -LinkedIn page Id.
 * @param {object} response -Response from LinkedIn
 * @returns {object} LinkedIn page feeds
 */
function parseFeedsData(response, companyId) {
  let feeds = [];
  let total = response?.paging?.total ?? 0;
  response?.elements?.map(x => {
    let feed = {};
    if (
      !x.specificContent?.[
        'com.linkedin.ugc.ShareContent'
      ]?.media[0]?.media?.includes('poll')
    ) {
      feed.shareMediaCategory =
        x.specificContent?.['com.linkedin.ugc.ShareContent']
          ?.shareMediaCategory ?? '';
      feed.description =
        x.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary
          ?.text ?? '';
      feed.mediaTitle =
        x.specificContent?.['com.linkedin.ugc.ShareContent']?.media[0]?.title
          ?.text ?? '';
      feed.hashtag = x.specificContent?.[
        'com.linkedin.ugc.ShareContent'
      ]?.shareCommentary?.attributes?.map(y =>
        y?.value?.[
          'com.linkedin.common.HashtagAttributedEntity'
        ]?.hashtag?.replace('urn:li:hashtag:', '')
      );
      let mediaUrl = [];
      if (
        x.specificContent?.['com.linkedin.ugc.ShareContent']
          ?.shareMediaCategory == 'VIDEO'
      )
        x.specificContent?.['com.linkedin.ugc.ShareContent']?.media[0]?.[
          'media~'
        ]?.elements?.map(y => {
          if (y?.identifiers[0]?.mediaType == 'video/mp4') {
            if (y?.identifiers[0]?.identifier?.includes('-720p'))
              mediaUrl.push(y?.identifiers[0]?.identifier);
          }
        });
      feed.sharedUrl = '';
      if (
        x.specificContent?.['com.linkedin.ugc.ShareContent']
          ?.shareMediaCategory == 'ARTICLE'
      )
        feed.sharedUrl =
          x.specificContent?.['com.linkedin.ugc.ShareContent']?.media[0]
            ?.originalUrl ?? '';
      feed.publishedAt = moment(x?.firstPublishedAt) ?? '';

      if (
        x.specificContent?.['com.linkedin.ugc.ShareContent']
          ?.shareMediaCategory == 'IMAGE'
      )
        x.specificContent?.['com.linkedin.ugc.ShareContent']?.media?.map(y =>
          mediaUrl.push(y?.originalUrl)
        );
      feed.postId = x?.id;
      feed.postUrl = `https://www.linkedin.com/feed/update/${x?.id}`;
      feed.mediaUrl = mediaUrl;
      feed.socialId = companyId;
      feeds.push(feed);
    }
  });
  return {total, feeds};
}

/**
 * TODO To Get LinkedIn Page Followers Counts
 * Function To Get LinkedIn Page Followers Counts
 * @param  {string} companyId -LinkedIn page Id.
 * @param {string} refreshToken -Response from LinkedIn
 * @returns {object} LinkedIn Page Followers Counts
 */
LinkedIn.prototype.linkedInPageStats = function (channelId, refreshToken) {
  return new Promise((resolve, reject) => {
    let options = {
      method: 'GET',
      url: `https://api.linkedin.com/v2/networkSizes/urn:li:organization:${channelId}?edgeType=CompanyFollowedByMember`,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    };
    request(options, function (error, response) {
      if (!error)
        resolve({
          follower_count: JSON.parse(response?.body)?.firstDegreeSize ?? '0',
        });
    });
  });
};

/**
 * TODO To Get Recent LinkedIn Follower Stats
 * Function To Get Recent LinkedIn Follower Stats
 * @param  {number} channelId -LinkedIn page Id.
 * @param {string} refreshToken -Access Token
 * @param {object} filerTime -Time
 * @returns {object} LinkedIn Follower Stats
 */
LinkedIn.prototype.getFollowerStats = function (
  channelId,
  refreshToken,
  filerTime
) {
  return new Promise((resolve, reject) => {
    let options = {
      method: 'GET',
      url: `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn%3Ali%3Aorganization%3A${channelId}&timeIntervals=(timeRange:(start:${filerTime.since},end:${filerTime.untill}),timeGranularityType:DAY)&count=100`,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    };
    request(options, function (error, response) {
      if (!error) resolve({data: JSON.parse(response?.body)});
    });
  });
};

/**
 * TODO To Get Recent LinkedIn Page Stats
 * Function To Get Recent LinkedIn Page Stats
 * @param  {number} channelId -LinkedIn page Id.
 * @param {string} refreshToken -Access Token
 * @param {object} filerTime -Time
 * @returns {object} LinkedIn Page Stats
 */
LinkedIn.prototype.getPageStats = function (
  channelId,
  refreshToken,
  filerTime
) {
  return new Promise((resolve, reject) => {
    let options = {
      method: 'GET',
      url: `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn%3Ali%3Aorganization%3A${channelId}&timeIntervals=(timeRange:(start:${filerTime.since},end:${filerTime.untill}),timeGranularityType:DAY)&count=300`,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    };
    request(options, function (error, response) {
      if (!error) resolve({data: JSON.parse(response?.body)});
      reject(error);
    });
  });
};

/**
 * TODO To get access token from refresh token
 * Function To get access token from refresh token
 * @param {string} refreshToken -Refresh Token
 * @returns {object} LinkedIn AccessToken
 */
LinkedIn.prototype.getAccessTokenFromRefreshToken = function (refreshToken) {
  return new Promise(async resolve => {
    let options = {
      method: 'POST',
      url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=refresh_token&client_id=${this.linkedIn_api.client_id}&client_secret=${this.linkedIn_api.client_secret}&refresh_token=${refreshToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    try {
      let response = await requestPromise(options);
      resolve({accessToken: JSON.parse(response)?.access_token});
    } catch (e) {}
  });
};

/**
 * TODO To get linkedin profile pic url for profile
 * Function To get linkedin profile pic url for profile
 * @param  {string} refresh_token - Social Account refresh token
 * @return {object} linked in profile url
 */
LinkedIn.prototype.getLinkedInProfilePic = async function (refresh_token) {
  try {
    const requestInfo = {
      method: 'GET',
      uri: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),emailAddress,vanityName,headline)',
      headers: {Authorization: `Bearer ${refresh_token}`},
    };
    let profileDetails = await requestPromise(requestInfo);
    profileDetails = JSON.parse(profileDetails);
    let data = {
      profile_pic_url: profileDetails.profilePicture
        ? profileDetails?.profilePicture['displayImage~']?.elements[3]
            ?.identifiers[0]?.identifier ?? ''
        : '',
      info: profileDetails?.headline?.localized?.en_US ?? '',
    };
    return data;
  } catch (e) {}
};

export default LinkedIn;
