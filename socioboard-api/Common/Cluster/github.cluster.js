import axios from 'axios';
import request from 'request';

function Github(github_api) {
  this.github_api = github_api;
  this.gitConfig = {
    clientId: this.github_api.client_id,
    clientSecret: this.github_api.client_secrets,
    redirect: this.github_api.redirect_url,
    proxy: true,
    scope: ['user:email'],
  };
}

Github.prototype.getGithubuserData = function (code) {
  return new Promise((resolve, reject) => {
    const body = {
      client_id: this.github_api.client_id,
      client_secret: this.github_api.client_secrets,
      code,
    };
    const opts = { headers: { accept: 'application/json' } };

    axios
      .post('https://github.com/login/oauth/access_token', body, opts)
      .then((res) => res.data.access_token)
      .then(async (_token) => {
        const config = {
          method: 'get',
          url: 'https://api.github.com/user',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${_token}`,
          },
        };

        const userData = await axios(config);

        resolve(userData);
      }).catch((error) => {
        throw new Error(error.message);
      });
  });
};

export default Github;
