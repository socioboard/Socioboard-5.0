import requestPromise from 'request-promise';
import axios from 'axios';
import MEDIUM_CONSTANTS from '../Constants/medium.constants.js';
import mediumService from '../../Feeds/core/medium/medium.service.js';

class Medium {
  async addMediumProfile(accessToken, teamId) {
    const { data } = await this.getProfileDetails(accessToken);

    return {
      UserName: data.username,
      FirstName: data.name,
      LastName: '',
      Email: '',
      SocialId: data.id,
      ProfilePicture: data.imageUrl,
      ProfileUrl: data.url,
      AccessToken: accessToken,
      RefreshToken: accessToken,
      FriendCount: '',
      Info: '',
      TeamId: teamId,
      Network: MEDIUM_CONSTANTS.ACCOUNT_TYPE,
    };
  }

  getProfileDetails(accessToken) {
    const options = {
      method: 'GET',
      uri: MEDIUM_CONSTANTS.API_URI.GET_USER_DETAILS,
      headers: this.getHeaders(accessToken),
      json: true,
    };

    return requestPromise(options);
  }

  getPublications(accessToken, userId) {
    const options = {
      method: 'GET',
      uri: mediumService.buildGetPublicationsLink(userId),
      headers: this.getHeaders(accessToken),
      json: true,
    };

    return requestPromise(options);
  }

  getPosts(userName) {
    const options = {
      method: 'GET',
      uri: mediumService.buildGetPostsLink(userName),
      json: true,
    };

    return requestPromise(options);
  }

  getUserId(userName) {
    const options = {
      method: 'GET',
      uri: mediumService.buildGetUserId(userName),
      json: true,
    };

    return requestPromise(options);
  }

  getFeeds(args) {
    const options = {
      method: 'POST',
      uri: MEDIUM_CONSTANTS.API_URI.GRAPHQL_URI,
      body: this.getFeedsRequestBody(args),
      json: true,
    };

    return requestPromise(options);
  }

  async getPostDetails(url) {
    const { data } = await axios({ url });

    return data;
  }

  createPost(accessToken, authorId, article) {
    const options = {
      method: 'POST',
      uri: mediumService.buildCreatePostLink(authorId),
      headers: this.getHeaders(accessToken),
      body: article,
      json: true,
    };

    return requestPromise(options);
  }

  createPostUnderPublication(accessToken, publicationId, article) {
    const options = {
      method: 'POST',
      uri: mediumService.buildCreatePostUnderPublicationLink(publicationId),
      headers: this.getHeaders(accessToken),
      body: article,
      json: true,
    };

    return requestPromise(options);
  }

  uploadImage(accessToken, formData) {
    const options = {
      method: 'post',
      url: MEDIUM_CONSTANTS.API_URI.UPLOAD_IMAGE,
      headers: {
        ...this.getHeaders(accessToken),
        ...formData.getHeaders(),
      },
      data: formData,
    };

    return axios(options);
  }

  getHeaders(accessToken) {
    return {
      authorization: `Bearer ${accessToken}`,
    };
  }

  getFeedsRequestBody({ userId, to, limit = 10 }) {
    const cursor = to ? String(to) : null;

    return {
      variables: {
        userId,
        pagingOptions: {
          limit,
          page: 1,
          source: 'latest',
          to: cursor,
          ignoredIds: [],
        },
      },
      query: MEDIUM_CONSTANTS.QRAPHQL_QUERIES.GET_USER_POSTS,
    };
  }
}

export default new Medium();
