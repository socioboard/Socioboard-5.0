// const request = require('request');
// const requestPromise = require('request-promise');
import request from 'request';
import requestPromise from 'request-promise';

function Pinterest(pinterest_api) {
  this.pinterest_api = pinterest_api;
}

Pinterest.prototype.addPinterestProfile = function addFacebook(network, teamId, code) {
  let userInformations = null;
  let accessTokens = null;

  return new Promise((resolve, reject) => {
    if (!code) {
      reject("Can't get code from pinterest!");
    } else {
      // Caliing function of getting accessToken by giving code as input
      return this.getAppAccessToken(code)
        .then((accessToken) => {
          accessTokens = accessToken;
          // After getting accessToken, sending it to get user profile details
          return this.userProfileInfo(accessToken);
        })
        .then((userDetails) => {
          // Formating the response
          const user = {
            UserName: userDetails.user_name,
            FirstName: userDetails.first_name,
            LastName: userDetails.last_name ? userDetails.last_name : '',
            Email: userDetails.email,
            SocialId: userDetails.user_id,
            ProfilePicture: userDetails.profile_pic_url,
            ProfileUrl: userDetails.profile_url,
            AccessToken: userDetails.access_token,
            RefreshToken: userDetails.access_token,
            FriendCount: userDetails.friend_count,
            Info: userDetails.info,
            TeamId: teamId,
            Network: network,
          };

          return user;
        })
        .then((user) => {
          userInformations = user;
          // Fetching user Boards with user accessToken
          return this.getBoards(accessTokens);
        })
        .then((boards) => {
          userInformations.Boards = boards;
          // Sending response
          resolve(userInformations);
        })
        .catch((error) => {
          if (error.message && error.message.includes('Authorization failed.')) reject(new Error('Authorization failed.'));
          else if (error.message && error.message.includes('You have exceeded your rate limit. Try again later.')) reject(new Error('You have exceeded your rate limit. Try again later.'));
          else reject(error);
        });
    }
  });
};

Pinterest.prototype.getAppAccessToken = function (code) {
  return new Promise((resolve, reject) => {
    // Hitting the pinterest api to get user accessToken by giving user code
    request.post({
      url: `https://api.pinterest.com/v1/oauth/token?grant_type=authorization_code&client_id=${this.pinterest_api.client_id}&client_secret=${this.pinterest_api.client_secret}&code=${code}`,
    }, (error, response, body) => {
      // Checking whether it sent error in callback or not
      if (error) {
        if (parsedBody.message && parsedBody.message.includes('You have exceeded your rate limit. Try again later.')) reject(new Error('You have exceeded your rate limit. Try again later.'));
        else reject(error);
      } else {
        var parsedBody = JSON.parse(body);

        if (parsedBody.message && parsedBody.message.includes('You have exceeded your rate limit. Try again later.')) reject(new Error('You have exceeded your rate limit. Try again later.'));
        // Sending response
        else resolve(parsedBody.access_token);
      }
    });
  });
};

Pinterest.prototype.userProfileInfo = function (accessToken) {
  return new Promise((resolve, reject) =>
  // Hitting the pinterest api to get user profile details by using user accessToken
    requestPromise(`https://api.pinterest.com/v1/users/me/?access_token=${accessToken}&fields=first_name%2Cid%2Clast_name%2Curl%2Cusername%2Cimage%2Ccounts%2Cbio%2Caccount_type`)
      .then((body) => {
        // Formating the response
        const parsedBody = JSON.parse(body);
        const parsedBodyData = parsedBody.data;
        const profileInfo = {
          user_id: parsedBodyData.id,
          user_name: parsedBodyData.username,
          email: '',
          birthday: '',
          profile_pic_url: parsedBodyData.image['60x60'].url,
          first_name: parsedBodyData.first_name,
          last_name: parsedBodyData.last_name,
          friend_count: parsedBodyData.counts.boards,
          info: JSON.stringify(parsedBodyData.counts),
          access_token: accessToken,
          profile_url: parsedBodyData.url,
        };
        // Sending response

        resolve(profileInfo);
      })
      .catch((error) => {
        reject(error);
      }));
};

Pinterest.prototype.getBoards = function (access_token) {
  return new Promise((resolve, reject) => {
    if (!access_token) {
      reject(new Error('Invalid access_token'));
    } else {
      request.get({
        // (creator deprecated) url: `https://api.pinterest.com/v1/me/boards?&access_token=${access_token}&fields=creator%2Cid%2Cname%2Cprivacy%2Curl`
        url: `https://api.pinterest.com/v1/me/boards?&access_token=${access_token}&fields=id%2Cname%2Cprivacy%2Curl`,
      }, (error, response, body) => {
        // Checking whether it sent error in callback or not
        const boardDetails = [];

        if (error) {
          // Sending response
          resolve(boardDetails);
        } else {
          // Formating the response
          const parsedBody = JSON.parse(body);
          const parsedBodyData = parsedBody.data;

          if (parsedBodyData) {
            parsedBodyData.forEach((board) => {
              // var admin_lastName = board.creator.last_name ? board.creator.last_name : '';
              const boardDetail = {
                board_url: board.url,
                privacy: board.privacy,
                board_id: board.id,
                board_name: board.name,
                board_admin_name: '(deprecated)',
                board_admin_url: '(deprecated)',
                board_admin_id: '(deprecated)',
              };

              boardDetails.push(boardDetail);
            });
            // Sending response
            resolve(boardDetails);
          } else {
            // Sending response
            resolve(boardDetails);
          }
        }
      });
    }
  });
};

Pinterest.prototype.userDetails = function (UserName, accessToken) {
  return new Promise((resolve, reject) => {
    if (!UserName || !accessToken) {
      reject(new Error('Invalid Inputs'));
    } else {
      request.get(`https://api.pinterest.com/v1/users/${UserName}/?access_token=${accessToken}&fields=first_name%2Cid%2Clast_name%2Curl%2Ccounts%2Cbio%2Cimage`, (error, respnse, body) => {
        // Checking whether it sent error in callback or not
        if (error) {
          reject(error);
        } else {
          // Formating the response
          const response = JSON.parse(body);
          const updateDetail = {
            follower_count: response.data.counts.followers,
            following_count: response.data.counts.following,
            profile_picture: response.data.image['60x60'].url,
            bio_text: response.data.bio,
            board_count: response.data.counts.boards,
          };
          // Sending response

          resolve(updateDetail);
        }
      });
    }
  });
};

export default Pinterest;
