import FormData from 'form-data';
import fs from 'fs';
import parser from 'fast-xml-parser';
import cheerio from 'cheerio';
import mediumCluster from '../../../Common/Cluster/medium.cluster.js';
import MEDIUM_CONSTANTS from '../../../Common/Constants/medium.constants.js';

class MediumService {
  async initUploadFolder(uploadFolderPath) {
    fs.mkdirSync(uploadFolderPath, { recursive: true });
  }

  deleteFile(path) {
    if (!path) {
      return;
    }

    fs.unlinkSync(path);
  }

  getProfileDetails(accessToken) {
    return mediumCluster.getProfileDetails(accessToken);
  }

  getPublications(accessToken, userId) {
    return mediumCluster.getPublications(accessToken, userId);
  }

  getPosts(userName) {
    return mediumCluster.getPosts(userName);
  }

  async getUserId(userName) {
    const response = await mediumCluster.getUserId(userName);

    return response.feed.link.split('-')[1];
  }

  async getFeeds(args) {
    const response = await mediumCluster.getFeeds(args);

    const result = [];

    response.data.user.latestStreamConnection.stream.forEach((item) => {
      if (item.itemType.post) {
        const post = {
          id: item.itemType.post.id,
          url: item.itemType.post.mediumUrl,
          createdAt: item.itemType.post.createdAt,
        };

        result.push(post);
      }
    });

    const nextPagingInfo = response.data.user.latestStreamConnection.pagingInfo;
    const nextId = nextPagingInfo && nextPagingInfo.next
      ? nextPagingInfo.next.to
      : undefined;

    return {
      posts: result,
      next: nextId,
    };
  }

  createPost(accessToken, authorId, article) {
    return mediumCluster.createPost(accessToken, authorId, article);
  }

  createPostUnderPublication(accessToken, publicationId, article) {
    return mediumCluster.createPostUnderPublication(accessToken, publicationId, article);
  }

  async uploadImage(accessToken, file) {
    const formData = new FormData();

    formData.append('image', fs.createReadStream(file.path));

    const { data: image } = await mediumCluster.uploadImage(accessToken, formData);

    return image.data;
  }

  async getPostsFromXml(xmlData) {
    const parsedData = await parser.parse(xmlData);

    return parsedData.rss.channel.item;
  }

  async completePosts(response, finalPosts = []) {
    const anIncompletePost = response.posts.shift();

    if (anIncompletePost) {
      const postContent = await mediumCluster.getPostDetails(anIncompletePost.url);

      const res = this.fillRemainingPostInfo(anIncompletePost, postContent);

      finalPosts.push(res);

      return this.completePosts(response, finalPosts);
    }

    response.posts = finalPosts;

    return response;
  }

  fillRemainingPostInfo(post, partialHTMLFromPost) {
    const finishedPost = post;

    const postPage = cheerio.load(partialHTMLFromPost);

    finishedPost.description = postPage('meta[property="og:description"]').attr('content') ?? '';

    finishedPost.title = postPage('meta[property="og:title"]').attr('content') ?? '';

    finishedPost.imageUrl = postPage('meta[property="og:image"]').attr('content') ?? '';

    return finishedPost;
  }

  buildGetPublicationsLink(userId) {
    return `${MEDIUM_CONSTANTS.API_URI.MEDIUM_USER_URI}/${userId}/publications`;
  }

  buildGetPostsLink(userName) {
    return `${MEDIUM_CONSTANTS.API_URI.FEED}/@${userName}`;
  }

  buildCreatePostLink(userId) {
    return `${MEDIUM_CONSTANTS.API_URI.MEDIUM_USER_URI}/${userId}/posts`;
  }

  buildCreatePostUnderPublicationLink(publicationId) {
    return `${MEDIUM_CONSTANTS.API_URI.MEDIUM_PUBLICATIONS_URI}/${publicationId}/posts`;
  }

  buildGetUserId(userName) {
    return `${MEDIUM_CONSTANTS.API_URI.RSS_JSON_URI}?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40${userName}`;
  }
}

export default new MediumService();
