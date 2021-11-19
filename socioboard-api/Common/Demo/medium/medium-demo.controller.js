import MEDIUM_CONSTANTS from '../../Constants/medium.constants.js';

class DemoController {
  getUserDetails(req, res) {
    try {
      const accessToken = this.getReqAccessToken(req);

      if (accessToken !== MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN) {
        return res.status(401).json({
          errors: [
            {
              message: 'Token was invalid.',
              code: 6003,
            },
          ],
        });
      }

      return res.status(200).json({
        data: {
          id: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ID,
          username: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.USERNAME,
          name: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.NAME,
          url: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.URL,
          imageUrl: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.IMAGE_URL,
        },
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  getPublications(req, res) {
    try {
      const accessToken = this.getReqAccessToken(req);

      if (accessToken !== MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN) {
        return res.status(401).json({
          errors: [
            {
              message: 'Token was invalid.',
              code: 6003,
            },
          ],
        });
      }

      return res.status(200).json({
        data: [{
          id: 'publication-id',
          name: 'demo',
          description: 'demo description',
          url: 'demo-url',
          imageUrl: 'demo-image-url',
        }],
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  getPosts(req, res) {
    try {
      return res.status(200).send({
        data: {
          user: {
            id: 'demo',
            latestStreamConnection: {
              stream: [
                {
                  itemType: {
                    __typename: 'StreamItemHeading',
                    text: 'Latest',
                    heading: {
                      headingType: { __typename: 'HeadingBasic', title: 'Latest' },
                      __typename: 'Heading',
                    },
                  },
                  __typename: 'StreamItem',
                },
                {
                  itemType: {
                    __typename: 'StreamItemPostPreview',
                    post: {
                      id: 'demo',
                      createdAt: 1634307360300,
                      mediumUrl: MEDIUM_CONSTANTS.DEMO_POST_URI,
                      previewContent: {
                        bodyModel: {
                          sections: [
                            {
                              name: null,
                              startIndex: 0,
                              textLayout: null,
                              imageLayout: null,
                              backgroundImage: null,
                              videoLayout: null,
                              backgroundVideo: null,
                              __typename: 'Section',
                            },
                          ],
                          paragraphs: [
                            {
                              name: 'previewImage',
                              __typename: 'Paragraph',
                              type: 'IMG',
                              href: null,
                              layout: 'CROPPED_HEIGHT_PREVIEW',
                              metadata: {
                                id: 'demo',
                                originalHeight: 250,
                                originalWidth: 512,
                                focusPercentX: null,
                                focusPercentY: null,
                                alt: null,
                                __typename: 'ImageMetadata',
                              },
                              text: '',
                              hasDropCap: null,
                              dropCapImage: null,
                              markups: [],
                              iframe: null,
                              mixtapeMetadata: null,
                            },
                            {
                              name: '1e77',
                              __typename: 'Paragraph',
                              type: 'H3',
                              href: null,
                              layout: null,
                              metadata: null,
                              text: 'demo',
                              hasDropCap: null,
                              dropCapImage: null,
                              markups: [],
                              iframe: null,
                              mixtapeMetadata: null,
                            },
                            {
                              name: 'd325',
                              __typename: 'Paragraph',
                              type: 'P',
                              href: null,
                              layout: null,
                              metadata: null,
                              text: 'demo',
                              hasDropCap: null,
                              dropCapImage: null,
                              markups: [],
                              iframe: null,
                              mixtapeMetadata: null,
                            },
                          ],
                          __typename: 'RichText',
                        },
                        __typename: 'PreviewContent',
                        isFullContent: true,
                      },
                      inResponseToPostResult: null,
                      isLocked: false,
                      clapCount: 0,
                      responsesCount: 0,
                      creator: {
                        id: '1',
                        __typename: 'demo',
                        name: 'demo',
                        username: 'demo',
                        bio: '',
                        isFollowing: null,
                        imageId: 'demo',
                        mediumMemberAt: 0,
                      },
                      __typename: 'Post',
                      isPublished: true,
                      firstPublishedAt: 1,
                      readingTime: 1,
                      statusForCollection: null,
                      visibility: 'PUBLIC',
                      collection: null,
                      readingList: 'READING_LIST_NONE',
                      viewerClapCount: 0,
                      voterCount: 0,
                      recommenders: [],
                    },
                    postSuggestionReasons: [
                      {
                        reason: 'demo',
                        __typename: 'demo',
                      },
                    ],
                  },
                  __typename: 'demo',
                },
              ],
              pagingInfo: {
                next: {
                  limit: 1,
                  page: null,
                  source: null,
                  to: '1',
                  ignoredIds: null,
                  __typename: 'PageParams',
                },
                __typename: 'Paging',
              },
              __typename: 'StreamConnection',
            },
            __typename: 'User',
          },
        },
      }).end();
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  getUserId(req, res) {
    try {
      return res.status(200).json({
        status: 'ok',
        feed: {
          url: MEDIUM_CONSTANTS.DEMO_POST_URI,
          title: 'demo',
          link: 'rss-demo',
          author: '',
          description: 'demo',
          image: 'demo',
        },
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  getDemoPost(req, res) {
    try {
      return res.status(200).send(`<meta data-rh="true" property="og:description" content="hi"/><meta data-rh="true" property="twitter:description" content="hi"/>
      <meta data-rh="true" property="og:title" content="hello world"/>
      <meta data-rh="true" property="og:image" content="https://miro.medium.com/max/512/1*UmNOhYbWvBQmKR-eBS_SfQ.png"/> `).end();
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  createPost(req, res) {
    try {
      const accessToken = this.getReqAccessToken(req);
      const { userId } = req.params;

      if (accessToken !== MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN) {
        return res.status(401).json({
          message: 'Token was invalid.',
          code: 6003,
        });
      }

      if (userId !== MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ID) {
        return res.status(400).json({
          message: 'userId was invalid.',
          code: 6026,
        });
      }

      return res.status(200).json({
        data: {
          id: 'demo-post-id',
          title: 'demo title',
          authorId: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ID,
          url: 'demo-url',
          canonicalUrl: 'demo-canonical-url',
          publishStatus: 'public',
          publishedAt: new Date().getTime(),
          license: 'test',
          licenseUrl: 'license',
          tags: [
            'demo',
            'test',
          ],
        },
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  createPostUnderPublication(req, res) {
    try {
      const accessToken = this.getReqAccessToken(req);
      const { publicationId } = req.params;

      if (accessToken !== MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ACCESS_TOKEN) {
        return res.status(401).json({
          message: 'Token was invalid.',
          code: 6003,
        });
      }

      if (publicationId !== MEDIUM_CONSTANTS.ACCOUNT_DETAILS.PUBLICATION_ID) {
        return res.status(403).end();
      }

      return res.status(200).json({
        data: {
          id: 'demo-post-id',
          title: 'demo title',
          authorId: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.ID,
          publicationId: MEDIUM_CONSTANTS.ACCOUNT_DETAILS.PUBLICATION_ID,
          url: 'demo-url',
          canonicalUrl: 'demo-canonical-url',
          publishStatus: 'public',
          publishedAt: new Date().getTime(),
          license: 'test',
          licenseUrl: 'license',
          tags: [
            'demo',
            'test',
          ],
        },
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  uploadImage(req, res) {
    try {
      res.status(200).json({
        data: {
          url: 'demo-medium-image-url',
          md5: 'demo',
        },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  getReqAccessToken(req) {
    return req.headers.authorization.split('Bearer ')[1];
  }
}

export default new DemoController();
