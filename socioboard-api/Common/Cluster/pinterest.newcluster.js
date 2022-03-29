import request from 'request';
import config from 'config';
import logger from '../../User/resources/Log/logger.log.js';
import requestPromise from 'request-promise';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
class Pinterest {
   
  /**
   * TODO To get the PinterestData
   * Function To get the PinterestData
   * @param {string} network - Pinterst Netwrok Id
   * @param {string} teamId - Pinterst Team Id
   * @param {string} code - Pinterst Auth code
   * @returns {object} Pinterest User Details
   */
  async getPinterestdata(network, teamId, code) {
    return new Promise((resolve, reject) => {
      return this.getAccessToken(code).then(
        async ({access_token: acctoken, refresh_token: reftoken}) => {
          let userdata = await this.getUserDetails(
            acctoken,
            reftoken,
            teamId,
            network
          );
          let boardData = await this.getBoards(userdata?.AccessToken);
          userdata.Boards = boardData;
          resolve(userdata);
        }
      );
    });
  }

  /**
   * TODO To get the Pinterest getAccessToken
   * Function To get the Pinterest getAccessToken
   * @param {string} code - Pinterst Auth code
   * @returns {object} Pinterest Access and Refresh token
   */
  async getAccessToken(code) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'POST',
        url: 'https://api.pinterest.com/v5/oauth/token',
        auth: {
          user: config.get(`pinterest.client_id`),
          password: config.get(`pinterest.client_secret`),
        },
        form: {
          'Content-Type': 'application/x-www-form-urlencoded',
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${config.get('pinterest.redirect_uri')}`,
        },
      };
      request(options, (error, res, body) => {
        if (error) {
          logger.error(`Pinterest getAccessToken ${error.message}`)
          reject(error);
        }
        const parsedData = JSON.parse(body);
        logger.info(`getAccessToken fetched data ${JSON.stringify(parsedData)} `)
        let tokens = {
          access_token: parsedData?.access_token,
          refresh_token: parsedData?.refresh_token,
        };
        resolve(tokens);
      });
    });
  }

  /**
   * TODO To get the Pinterest UserData
   * Function To get the Pinterest UserData
   * @param {string} accToken - Pinterest Access Token
   * @param {string} refreshToken - Pinterest Refresh Token
   * @param {string} TeamId - Team Id 
   * @param {string} Network - Network
   * @returns {object} Pinterest User Deatils
   */
  async getUserDetails(accToken, refreshToken, TeamId, Network) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'GET',
        url: 'https://api.pinterest.com/v5/user_account',
        headers: {
          Authorization: `Bearer ${accToken}`,
        },
      };
      request(options, (error, res, body) => {
        if (error) {
         logger.error(`Error in Pinterest getUserDetails ${error.message}`)
        reject(error)
       }
      const parsedData = JSON.parse(body);
      logger.info(`getUserDetails fetch data ${JSON.stringify(parsedData)}`)
      const userDetails = {
            UserName: parsedData?.username,
            FirstName: parsedData?.username,
            LastName: '',
            Email: '',
            SocialId: parsedData?.username,
            ProfilePicture: parsedData?.profile_image,
            ProfileUrl: `https://in.pinterest.com/${parsedData.username}`,
            AccessToken: accToken,
            RefreshToken: refreshToken,
            FriendCount: 0,
            Info: '',
            TeamId,
            Network
          };
      resolve(userDetails)
     })
   })
}


  /**
   * TODO To get the Pinterest Boards
   * Function To get the Pinterest Boards
   * @param {string} accToken - Pinterst Access Token
   * @returns {object} Pinterest Boards
   */
  async getBoards(accessToken) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'GET',
        url: 'https://api.pinterest.com/v5/boards',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      request(options, (error, res, body) => {
        if (error) {
          logger.error(`error while getBoards ${error.message} `)
          reject(error);
        }
        let boardDetails = [];
        const parsedData = JSON.parse(body);
        logger.info(`getBoardData Fetch details ${JSON.stringify(parsedData)}`)
        const parsedItems = parsedData?.items; // need check for if board exist or not
        if(parsedItems){
        parsedItems?.map(board => {
          let boardDetail = {
            privacy: board?.privacy,
            board_id: board?.id,
            board_name: board?.name,
            board_admin_name: board?.owner?.username,
            board_admin_url: `https://in.pinterest.com/${board?.owner?.username}`,
            board_admin_id: board?.owner?.username,
            board_url: `https://in.pinterest.com/${board?.owner?.username}/${board?.name}`,
          };
          boardDetails.push(boardDetail);
        });
        resolve(boardDetails);
      }});
    });
  }

  /**
   * TODO To get the Pinterest Pins
   * Function To get the Pinterest Pins
   * @param {string} socialId - Social Id
   * @param {string} boardId - Board ID
   * @param {string} accToken - Pinterst Access Token
   * @returns {object} Pinterest Pins
   */
  async getBoardPins(socialId,boardId,accessToken){
     return new Promise((resolve, reject) => {
        let postDetails = [];
        let  options = {
        method:'GET',
        url: `https://api.pinterest.com/v5/boards/${boardId}/pins`,
        headers:{
             Authorization: `Bearer ${accessToken}`,
         }
       }
       requestPromise(options)
       .then(async body =>{
         const parsedBody = JSON.parse(body);
         const promises = parsedBody?.items.map(async pin => {
         const data = {
              type: pin?.media?.media_type,
              postId: pin?.id,
              mediaUrl:pin?.media?.images?.originals?.url,
              postUrl: `https://in.pinterest.com/pin/${pin?.id}/`,
              publishedDate: pin?.created_at,
              captionText: pin?.title ?? '',
              socialId,
              userName: pin?.board_owner?.username,
              boardId:pin?.board_id,
              outgoingUrl: pin?.link ?? "",
              version:"v5.0"
            };
            return data 
         });
         postDetails =  Promise.all(promises);
       })
         .then(() => {
          resolve(postDetails);
        })
        .catch(error => {
          logger.error(`Error while getBoardPins ${error.message}`)
          reject(error);
        });

    })
}


  /**
   * TODO To post on Pinterest
   * Function To post on Pinterest
   * @param {object} postDetails -Post details
   * @param {string} board_id -Pinterest board id
   * @param {string} accessToken -Pinterest account access token
   */
  async publishPin(postDetails, board_id, accessToken) {
    return new Promise(async (resolve, reject) => {
      if (postDetails.postType === 'Image') {
        const basePath = path.resolve(__dirname, '../../..');
        const filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
        const extension = require('path').extname(filePath).substr(1);
        let options = {
          method: 'POST',
          url: 'https://api.pinterest.com/v5/pins',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            link: `${postDetails?.link}`,
            title: `${postDetails?.message}`,
            alt_text: `${postDetails?.message}`,
            board_id,
            media_source: {
              source_type: 'image_base64',
              content_type: `images/${extension}`,
              data: await this.base64_encode(filePath),
            },
          }),
        };
        request(options, function (error, response) {
          if (error) reject(error);
          resolve(JSON.parse(response.body));
        });
      }
    });
  }

  /**
   * TODO To convert image and video to base 64 file
   * FunctionTo convert image and video to base 64 file
   * @param {file} file -Media file
   */
  async base64_encode(file) {
    // read binary data
    let bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap, 'binary').toString('base64');
  }
}

export default Pinterest;
