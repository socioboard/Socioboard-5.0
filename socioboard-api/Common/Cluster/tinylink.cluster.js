import logger from '../../User/resources/Log/logger.log.js';
import axios from 'axios';
import qs from 'qs'

class TinyLink {
/**
 * TODO generate the Tiny Url 
 * Function to generate the Tiny Url
 * @param {string} token - api token 
 * @param {string} url - Url to convert to TinyUrl
 * @return {string} Returns Tiny Url
 */
  async getTinyLink(token, url) {
    return new Promise((resolve, reject) => {
      let data = qs.stringify({
        'api_token': `${token}`,
        'url': `${url}`,
        'domain': 'tiny.one'
      });
      let config = {
        method: 'post',
        url: 'https://api.tinyurl.com/create',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: data
      };
      axios(config)
        .then((response) => {
          logger.info(`API Response of Tiny URL :${JSON.stringify(response.data)}`)
          let tinyUrl = response?.data?.data?.tiny_url
          resolve(tinyUrl)
        })
        .catch((error) => {
          logger.error(`Error while genearting the Tiny Url ${error.message}`)
          reject(error.message);
        });
    })

  }
}
export default new TinyLink();

