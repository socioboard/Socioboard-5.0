import request from 'request';
import logger from '../../User/resources/Log/logger.log.js';
import requestPromise from 'request-promise';
import db from '../Sequelize-cli/models/index.js';
const socialAccount = db.social_accounts;
import {createRequire} from 'module';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const requires = createRequire(import.meta.url);

class Tumbler {
  /**
   * TODO To get Temp Tumblr Token
   * Function To get Temp Tumblr Token
   * @param {string} keyValue - Tumblr ConsumerKey
   * @param {string} secretValue - Tumblr ConsumerSecKey
   * @returns {object} Tumblr Temp Tokens
   */
  async getTokens(keyValue, secretValue) {
    return new Promise((resolve, reject) => {
      let oauth = {
        consumer_key: keyValue,
        consumer_secret: secretValue,
      };
      let url = 'https://www.tumblr.com/oauth/request_token';
      request.post({url: url, oauth: oauth}, (error, response, body) => {
        if (error) {
          logger.error(
            `Error while Fetching the Tumblr Tokens ${error.message}`
          );
          reject(error);
        }
        logger.info(`Response of Tumblr request Token ${body}`);
        let temp1 = body?.split('&');
        let auth_token = temp1[0]?.split('=')[1];
        let auth_secret = temp1[1]?.split('=')[1];
        let tokens = {auth_token, auth_secret};
        resolve(tokens);
      });
    });
  }

  /**
   * TODO To get Tumblr Blog Details
   * Function To get Tumblr Blog Details
   * @param {string} consumerKey - Tumblr ConsumerKey
   * @param {string} consumerSecret - Tumblr ConsumerSecKey
   * @param {string} reqToken - Tumblr Temp Token
   * @param {string} reqSecret - Tumblr Temp Secret
   * @param {string} verifier - Tumblr verifier code
   * @returns {object} Tumblr Blog Deatils
   */
  async addTumblrProfile(
    consumerKey,
    consumerSecret,
    reqToken,
    reqSecret,
    verifier
  ) {
    return new Promise((resolve, reject) => {
      return this.getAccessToken(
        consumerKey,
        consumerSecret,
        reqToken,
        reqSecret,
        verifier
      )
        .then(async ({token: oAuth_token, token_secret: oAuth_secret}) => {
          let userDetails = await this.getBlogdetails(
            consumerKey,
            consumerSecret,
            oAuth_token,
            oAuth_secret
          );
          resolve(userDetails);
        })
        .catch(error => {
          logger.error(`Error while addTumblrProfile ${error.message}`);
          reject(error);
        });
    });
  }

  /**
   * TODO To get Tumblr Access Token
   * Function get Tumblr Access Token
   * @param {string} consumerKey - Tumblr ConsumerKey
   * @param {string} consumerSecret - Tumblr ConsumerSecKey
   * @param {string} token - Tumblr Temp Token
   * @param {string} token_secret - Tumblr Temp Secret
   * @param {string} verifier - Tumblr verifier code
   * @returns {object} Tumblr Auth Tokens
   */
  async getAccessToken(
    consumer_key,
    consumer_secret,
    token,
    token_secret,
    verifier
  ) {
    return new Promise((resolve, reject) => {
      request.get(
        'https://www.tumblr.com/oauth/access_token?',
        {
          oauth: {
            consumer_key,
            consumer_secret,
            token,
            token_secret,
            verifier,
          },
        },
        (error, res, body) => {
          if (error) {
            logger.error(
              `Error while Fetching the Tumblr Access Token ${error.message}`
            );
          }
          logger.info(`Response of Tumblr AccessToken request ${body}`);
          let temp1 = body.split('&');
          let token = temp1[0].split('=')[1];
          let token_secret = temp1[1].split('=')[1];
          let tokens = {token, token_secret};
          resolve(tokens);
        }
      );
    });
  }

  /**
   * TODO To get Tumblr User Data
   * Function get Tumblr User Data
   * @param {string} consumer_key - Tumblr ConsumerKey
   * @param {string} consumer_secret - Tumblr ConsumerSecKey
   * @param {string} token - Tumblr Auth Token
   * @param {string} token_secret - Tumblr Auth Secret
   * @returns {object} Tumblr User Details
   */
  async getTumblrUserdata(consumer_key, consumer_secret, token, token_secret) {
    return new Promise(async (resolve, reject) => {
      let blogsArr = [];
      let blogIds = [];
      return request.get(
        'https://api.tumblr.com/v2/user/info?',
        {
          oauth: {
            consumer_key,
            consumer_secret,
            token,
            token_secret,
          },
        },
        (error, res, body) => {
          const parsedData = JSON.parse(body);
          try {
            parsedData?.response?.user?.blogs?.map(blog => {
              let blogData = {
                UserName: blog?.name,
                FirstName: blog?.title,
                LastName: '',
                Email: '',
                SocialId: blog?.uuid,
                ProfilePicture: blog?.avatar[0]?.url,
                ProfileUrl: blog?.url,
                CoverPicurl: blog?.theme?.header_image ?? '',
                AccessToken: token,
                RefreshToken: token_secret,
                FriendCount: blog?.followers ?? 0,
                Info: blog?.description ?? '',
                isAlreadyAdded: false,
              };
              blogsArr.push(blogData);
              blogIds.push(blog?.uuid);
            });
            resolve({blogs: blogsArr, blogIds});
          } catch (error) {
            logger.error(
              `Error while parsing the getTumblrUserdata ${error.message}`
            );
          }
        }
      );
    }).catch(error => {
      logger.error(`Error while getTumblrUserdata ${error.message}`);
      reject(error);
    });
  }

  /**
   * TODO To get Tumblr Blog Details
   * Function get Tumblr Blog Details
   * @param {string} consumer_key - Tumblr ConsumerKey
   * @param {string} consumer_secret - Tumblr ConsumerSecKey
   * @param {string} token - Tumblr Auth Token
   * @param {string} token_secret - Tumblr Auth Secret
   * @returns {object} Tumblr Blogs Details with already availableBlogs
   */
  async getBlogdetails(consumer_key, consumer_secret, token, token_secret) {
    let {blogIds, blogs} = await this.getTumblrUserdata(
      consumer_key,
      consumer_secret,
      token,
      token_secret
    );
    let matchedBlogs = await socialAccount.findAll({
      where: {social_id: blogIds},
      attributes: ['account_id', 'social_id'],
    });
    await matchedBlogs.map(blog => {
      const matchedBlog = blogs.find(item => item.SocialId == blog.social_id);
      matchedBlog.isAlreadyAdded = true;
    });
    return {blogs, availableBlogs: matchedBlogs};
  }

  /**
   * TODO To get Tumblr Blog Post Details
   * Function get Tumblr Blog Post Details
   * @param {string} consumer_key - Tumblr ConsumerKey
   * @param {string} socialId - Tumblr User UUID
   * @returns {object} Tumblr Blogs Post Details
   */
  async getBlogPostDetails(consumer_key, socialId) {
    return new Promise((resolve, reject) => {
      let postDetails = [];
      const url = `https://api.tumblr.com/v2/blog/${socialId}/posts?api_key=${consumer_key}`;
      return requestPromise
        .get(url)
        .then(async body => {
          const parsedBody = JSON.parse(body);
          const promises = parsedBody?.response?.posts.map(async post => {
            const permalink = await this.getpermalink(post);
            const data = {
              type: post?.type,
              postId: post?.id,
              postStringId: post?.id_string, //new
              mediaUrl: post?.post_url,
              publishedDate: post?.date,
              isUserLiked: post?.can_like,
              captionText: post?.summary ?? '',
              likeCount: '',
              commentCount: '',
              permalink,
              locationName: '',
              locationId: '',
              socialId,
              userName: post?.blog_name,
              version: 'v5.0',
            };
            return data;
          });
          postDetails = await Promise.all(promises);
        })
        .then(() => {
          resolve(postDetails);
        })
        .catch(error => {
          logger.error(`Error while getBlogPostDetails ${error.message}`);
          reject(error);
        });
    });
  }

  /**
   * TODO To get media Permalink
   * Function get media Permalink
   * @param {object} post - Tumblr Post Details
   * @returns {string} Tumblr media Permalink
   */
  async getpermalink(post) {
    let postType = post?.type;
    let permaLink = '';
    if (postType == 'photo') {
       post?.photos.map(async x=>{
         permaLink=x.original_size?.url
       })
     return permaLink;
    } else if (postType == 'video') {
      return (permaLink = post?.video_url);
    } else if (postType == 'audio') {
      return (permaLink = post?.audio_url);
    } else if (postType == 'link') {
      return (permaLink = post?.url);
    } else {
      return permaLink;
    }
  }

  /**
   * TODO To post on Tumblr
   * Function To post on Tumblr
   * @param {object} postDetails -Post details
   * @param {string} consumer_key -Tumblr consumer key
   * @param {string} consumer_secret -Tumblr consumer secret
   * @param {string} token -Tumblr account access token
   * @param {string} token_secret -Tumblr account refresh token
   * @param {number} uuid -Social id
   */
  async postOnTumblr(
    postDetails,
    consumer_key,
    consumer_secret,
    uuid,
    token,
    token_secret
  ) {
    let formData;
    if (postDetails.postType === 'Text')
      formData = {
        type: `${postDetails.postType}`,
        body: `${postDetails.message}`,
      };
    if (postDetails.postType === 'Link') {
      formData = {
        type: `link`,
        url: `${postDetails.link}`,
        description: `${postDetails.message}`,
      };
    }
    if (postDetails.postType === 'Image') {
      const basePath = path.resolve(__dirname, '../../..');
      const filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
      formData = {
        type: `photo`,
        url: `${postDetails.link}`,
        caption: `${postDetails.message}\n${postDetails.link ?? ''}`,
        data64: await this.base64_encode(filePath),
      };
    }
    if (postDetails.postType === 'Video') {
      const basePath = path.resolve(__dirname, '../../..');
      const filePath = `${basePath}/media/${postDetails.mediaPath[0]}`;
      formData = {
        type: `video`,
        url: `${postDetails.link}`,
        caption: `${postDetails.message}\n${postDetails.link ?? ''}`,
        data64: await this.base64_encode(filePath),
      };
    }
    return new Promise(async (resolve, reject) => {
      request.post(
        `https://api.tumblr.com/v2/blog/${uuid}/post`,
        {
          oauth: {
            consumer_key,
            consumer_secret,
            token,
            token_secret,
          },
          formData,
        },
        (error, response, body) => {
          try {
            if (!error) resolve(JSON.parse(body));
          } catch (error) {}
        }
      );
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

  /**
   * TODO To Get Recent Tumblr Blog Stats
   * Function To Get Recent Tumblr Blog Stats
   * @param {number} channelId -LinkedIn page Id.
   * @param {string} refreshToken -Access Token
   * @param {object} filerTime -Time
   * @returns {object} LinkedIn Page Stats
   */
  async getBlogStats(consumer_key, consumer_secret, token, token_secret, uuid) {
    return new Promise(async (resolve, reject) => {
      return request.get(
        `https://api.tumblr.com/v2/blog/${uuid}/info`,
        {
          oauth: {
            consumer_key,
            consumer_secret,
            token,
            token_secret,
          },
        },
        (error, res, body) => {
          const parsedData = JSON.parse(body);
          let data = {
            follower_count: parsedData?.response?.blog?.followers ?? 0,
            total_like_count: parsedData?.response?.blog?.likes ?? 0,
            total_post_count: parsedData?.response?.blog?.total_posts ?? 0,
            bio_text: parsedData?.response?.blog?.description ?? '',
            profile_picture: parsedData?.response?.blog?.avatar[0]?.url ?? '',
            cover_picture:
              parsedData?.response?.blog?.theme?.header_image ?? '',
          };

          resolve(data);
        }
      );
    }).catch(error => {});
  }
}
export default new Tumbler();
