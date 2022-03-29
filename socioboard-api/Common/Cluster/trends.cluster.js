import pkg from 'request';
import feedparserpromised from 'feedparser-promised';
import NewsAPI from 'newsapi';
import moment from 'moment';
import { parse as _parse } from 'url';
import Parser from 'rss-parser';
import GiphyMongoModel from '../Mongoose/models/giphy-posts.js';
import ImgurMongoModel from '../Mongoose/models/imgur-posts.js';
import FlickrMongoModel from '../Mongoose/models/flickr-posts.js';
import DailymotionMongoModel from '../Mongoose/models/daily-motion-posts.js';
import NewsApiMongoModel from '../Mongoose/models/news-api-posts.js';
import PixabayMongoModel from '../Mongoose/models/pixabay-posts.js';
import YoutubeMongoModel from '../Mongoose/models/youtube-post.js';

const { get } = pkg;
const { parse } = feedparserpromised;
const { utc } = moment;
const parser = new Parser({
  requestOptions: {
    rejectUnauthorized: false,
  },
});

/**
 * Use Proxy if needed
 * var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;
 * var proxiedRequest = request.defaults({'proxy': proxyUrl});
 */

class Trends {
  fetchGiphy(giphy, keyword, pageId, rating, type) {
    return new Promise((resolve, reject) => {
      if (!giphy || !keyword || !pageId || !rating || !type) {
        reject(new Error('Invalid Inputs'));
      } else {
        // logger.info("rating ",rating)
        const giphyModelObject = new GiphyMongoModel();
        const offset = (pageId - 1) * giphy.count;

        get({
          url: `https://api.giphy.com/v1/${type}/search?q=${encodeURIComponent(keyword)}&api_key=${giphy.api_key}&offset=${offset}&limit=${giphy.count}&rating=${rating}`,
        }, (error, response, body) => {
          const giphyResponse = {
            giphyDetails: [],
          };

          if (error) {
            return giphyModelObject.getPreviousPost(keyword, offset, giphy.count)
              .then((giphyDetails) => {
                giphyResponse.giphyDetails = giphyDetails;
                resolve(giphyResponse);
              })
              .catch(() => {
                resolve(giphyResponse);
              });
          }
          const batchId = String(moment().unix());

          giphyResponse.batchId = batchId;
          const giphyDetails = [];
          const parsedBody = JSON.parse(body);

          return Promise.all(parsedBody.data.map((element) => {
            try {
              let importDate = element.import_datetime;

              if (importDate == '1970-01-01 00:00:00') importDate = element.trending_datetime;
              const details = {
                giphyId: element.id,
                sourceUrl: element.url,
                title: element.title,
                description: element.slug,
                publisherName: element.username,
                publishedDate: importDate,
                postSourceUrl: element.source_post_url ? encodeURI(element.source_post_url) : '',
                mediaUrl: element.images.preview_gif.url ? encodeURI(element.images.preview_gif.url) : '',
                rating: element.rating,
                score: element._score,

                batchId,
                createdDate: utc(),
                version: giphy.version,
              };

              giphyDetails.push(details);
            } catch (error) {
            }
          }))
            .then(() => giphyModelObject.insertManyGiphy(giphyDetails))
            .then(() => {
              giphyResponse.giphyDetails = giphyDetails;
              resolve(giphyResponse);
            })
            .catch((error) => {
              resolve(giphyResponse);
            });
        });
      }
    });
  }

  fetchImgur(imgurApi, keyword, page_id, sortBy) {
    return new Promise((resolve, reject) => {
      if (!imgurApi || !keyword || !page_id || !sortBy) {
        reject(new Error('Invalid Inputs'));
      } else {
        const imgurModelObject = new ImgurMongoModel();
        const offset = (page_id - 1) * imgurApi.count;
        // logger.info("keyword ",keyword,page_id)
        // https://api.imgur.com/3/gallery/search/{{sort}}/{{window}}/{{page}}?q=cats

        get({
          headers: { Authorization: `Client-ID ${imgurApi.client_id}` },
          url: `https://api.imgur.com/3/gallery/search/${sortBy}/?q=${keyword}`,
        }, (error, response, body) => {
          const batchId = String(moment().unix());
          const imgurResponse = {
            batchId,
            imgurDetails: [],
          };

          if (error) {
            imgurModelObject.getPreviousPost(keyword, offset, imgurApi.count)
              .then((imgurDetails) => {
                imgurResponse.imgurDetails = imgurDetails;
                resolve(imgurResponse);
              })
              .catch(() => {
                resolve(imgurResponse);
              });
          } else {
            const parsedBody = JSON.parse(body);
            const imgurDetails = [];

            parsedBody.data.forEach((element) => {
              const media_type = element?.type ?? element?.images[0]?.type;
              const mediaUrls = [];

              if (element?.images) {
                element?.images.forEach((medias) => {
                  const media = medias.link;
                   mediaUrls.push(media);
                });
              }
              else{
                mediaUrls.push(element.link)
              }
              const details = {
                imgurId: element.id,
                mediaUrl: mediaUrls.length <= 0 ? element.link : mediaUrls,
                title: element.title,
                sourceUrl: element.link,
                description: element.description ? element.description : '',
                mediaType: media_type,
                publisherName: element.account_id,
                publishedDate: moment(Number(element.datetime) * 1000).format('M/D/YYYY H:mm'),

                batchId,
                createdDate: utc(),
                version: imgurApi.version,
              };
              imgurDetails.push(details);
            });
           return imgurModelObject.insertManyPosts(imgurDetails)
              .then(() => {
                imgurResponse.imgurDetails = imgurDetails;
                resolve(imgurResponse);
              })
              .catch((error) => {
                resolve(imgurResponse);
              });
          }
        });
      }
    });
  }

  fetchGiphyTrending(giphy, type, rating) {
    return new Promise((resolve, reject) => {
      if (!giphy || !type || !pageId || !rating) {
        reject(new Error('Invalid Inputs'));
      } else {
        const giphyModelObject = new GiphyMongoModel();
        const offset = (pageId - 1) * giphy.count;

        get({
          url: `https://api.giphy.com/v1/${type}/trending?api_key=${giphy.api_key}&offset=${offset}&limit=${giphy.count}&rating=${rating}`,
        }, (error, response, body) => {
          const giphyResponse = {
            giphyDetails: [],
          };

          if (error) {
            console.log(`Cant able to fetch the giphy posts, ${error.message}`);

            return giphyModelObject.getPreviousPost(keyword, offset, giphy.count)
              .then((giphyDetails) => {
                giphyResponse.giphyDetails = giphyDetails;
                resolve(giphyResponse);
              })
              .catch(() => {
                resolve(giphyResponse);
              });
          }
          const batchId = String(moment().unix());

          giphyResponse.batchId = batchId;
          const giphyDetails = [];
          const parsedBody = JSON.parse(body);

          return Promise.all(parsedBody.data.map((element) => {
            try {
              let importDate = element.import_datetime;

              if (importDate == '1970-01-01 00:00:00') importDate = element.trending_datetime;
              const details = {
                giphyId: element.id,
                sourceUrl: element.source_tld ? encodeURI(element.source_tld) : '',
                title: element.title,
                description: element.slug,
                publisherName: element.username,
                publishedDate: importDate,
                postSourceUrl: element.source_post_url ? encodeURI(element.source_post_url) : '',
                mediaUrl: element.images.preview_gif.url ? encodeURI(element.images.preview_gif.url) : '',
                rating: element.rating,
                score: element._score,

                batchId,
                createdDate: utc(),
                version: giphy.version,
              };

              giphyDetails.push(details);
            } catch (error) {
            }
          }))
            .then(() => giphyModelObject.insertManyGiphy(giphyDetails))
            .then(() => {
              giphyResponse.giphyDetails = giphyDetails;
              resolve(giphyResponse);
            })
            .catch((error) => {
              resolve(giphyResponse);
            });
        });
      }
    });
  }

  fetchNewsApi(news_api, keyword, pageId, sortBy, category) {
    return new Promise((resolve, reject) => {
      if (!news_api || !keyword || !pageId) {
        reject(new Error('Invalid Inputs'));
      } else {
        const newsApiMongoObject = new NewsApiMongoModel();
        const newsapi = new NewsAPI(news_api.api_key);
        const todayDate = moment(new Date()).format('YYYY/MM/DD');
        const offset = (pageId - 1) * news_api.count;

        const batchId = String(moment().unix());
        const newsApiResponse = {
          batchId,
          newsApiDetails: [],
        };

        newsapi.v2.topHeadlines({
          q: keyword,
          language: 'en',
          category: category,
          sortBy,
          page: pageId, 
        })
          .then((response) => {
            const parsedBody = response;
            const newsApiDetails = [];

            if (parsedBody.status == 'ok') {
              parsedBody.articles.forEach((element) => {
                const details = {
                  title: element.title,
                  publisherName: element.author,
                  description: element.description,
                  mediaUrl: element.urlToImage,
                  sourceUrl: element.url,
                  publishedDate: element.publishedAt,

                  batchId,
                  createdDate: utc(),
                  version: news_api.version,
                };

                newsApiDetails.push(details);
              });

              return newsApiMongoObject.insertManyPosts(newsApiDetails)
                .then(() => {
                  newsApiResponse.newsApiDetails = newsApiDetails;
                  resolve(newsApiResponse);
                })
                .catch((error) => {
                  resolve(newsApiResponse);
                });
            }
            resolve(newsApiResponse);
          })
          .catch((error) => newsApiMongoObject.getPreviousPost(keyword, offset, news_api.count)
            .then((newsApiDetails) => {
              newsApiResponse.newsApiDetails = newsApiDetails;
              resolve(newsApiResponse);
            })
            .catch(() => {
              resolve(newsApiResponse);
            }));
      }
    });
  }

  fetchPixabay(pixabay, keyword, pageId, sortBy, category) {
    return new Promise((resolve, reject) => {
      if (!pixabay || !keyword || !pageId || !sortBy || !category) {
        reject(new Error('Invalid Inputs'));
      } else {
        const pixabayModelObject = new PixabayMongoModel();
        const offset = (pageId - 1) * pixabay.count;

        get({
          url: `https://pixabay.com/api/?key=${pixabay.api_key}&q=${encodeURIComponent(keyword)}&image_type=photo&pretty=true&page=${pageId}&category=${category}&order=${sortBy}`,
        }, (error, response, body) => {
          const batchId = String(moment().unix());
          const pixabayResponse = {
            batchId,
            pixabayDetails: [],
          };

          if (error) {
            return pixabayModelObject.getPreviousPost(keyword, offset, pixabay.count)
              .then((pixabayDetails) => {
                pixabayResponse.pixabayDetails = pixabayDetails;
                resolve(pixabayResponse);
              })
              .catch(() => {
                resolve(pixabayResponse);
              });
          }
          const parsedBody = JSON.parse(body);
          const pixabayDetails = [];

          parsedBody.hits.forEach((element) => {
            const details = {
              pixaBayId: element.id,
              title: element.tags,
              description: element.tags,
              mediaUrl: element.largeImageURL,
              publisherName: element.user,
              sourceUrl: element.pageURL,
              publishedDate: '',
              likeCount: element.likes,
              commentCount: element.comments,
              numberOfDownloads: element.downloads,
              favorites: element.favorites,

              batchId,
              createdDate: utc(),
              version: pixabay.version,
            };

            pixabayDetails.push(details);
          });

          return pixabayModelObject.insertManyPosts(pixabayDetails)
            .then(() => {
              pixabayResponse.pixabayDetails = pixabayDetails;
              resolve(pixabayResponse);
            })
            .catch((error) => {
              resolve(error);
            });
        });
      }
    });
  }

  fetchFlickr(flickr, keyword, pageId, sortBy) {
    return new Promise((resolve, reject) => {
      if (!flickr || !keyword || !pageId || !sortBy) {
        reject(new Error('Invalid Inputs'));
      } else {
        const flickrModelObject = new FlickrMongoModel();
        const offset = (pageId - 1) * flickr.count;

        get({
          url: `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickr.api_key}&text=${keyword}&sort=${sortBy}&privacy_filter=1&content_type=1&extras=date_upload%2C+date_taken%2C+owner_name%2C+url_l%2C+url_o%2Ctags&per_page=20&page=${pageId}&format=json&nojsoncallback=1`,
        }, (error, response, body) => {
          const batchId = String(moment().unix());
          const flickrResponse = {
            batchId,
            flickrDetails: [],
          };

          if (error) {
            return flickrModelObject.getPreviousPost(keyword, offset, flickr.count)
              .then((flickrResponse) => {
                console.log(`flickrResponse ${flickrResponse}`);
                flickrResponse.flickrDetails = flickrResponse;
                resolve(flickrResponse);
              })
              .catch(() => {
                resolve(flickrResponse);
              });
          }
          const parsedBody = JSON.parse(body);
          const flickrDetails = [];

          parsedBody.photos.photo.forEach((element) => {
            const details = {
              flickrId: element.id,
              title: element.title,
              description: element.tags ? element.tags : '',
              mediaUrl: decodeURIComponent(element.url_l || element.url_o),
              publisherName: element.ownername,
              sourceUrl: `https://www.flickr.com/photos/${element.owner}/${element.id}/`,
              publishedDate: element.datetaken,

              batchId,
              createdDate: utc(),
              version: flickr.version,
            };

            flickrDetails.push(details);
          });

          return flickrModelObject.insertManyPosts(flickrDetails)
            .then(() => {
              flickrResponse.flickrDetails = flickrDetails;
              resolve(flickrResponse);
            })
            .catch((error) => {
              resolve(flickrResponse);
            });
        });
      }
    });
  }

  fetchDailyMotion(dailymotion, keyword, page_id, sortBy) {
    // logger.info(dailymotion,keyword, page_id,sortBy)

    return new Promise((resolve, reject) => {
      if (!dailymotion || !page_id) {
        reject(new Error('Invalid Inputs'));
      } else {
        const dailymotionMongoObject = new DailymotionMongoModel();
        const offset = (page_id - 1) * dailymotion.count;
        const urls = `https://api.dailymotion.com/videos?fields=allow_embed,created_time,description,embed_url,id,owner.screenname,title,url,&360_degree=0&availability=1&languages=en&private=0&sort=${sortBy}&unpublished=0&verified=1&page=${page_id}&limit=${dailymotion.count}&search=${keyword}`;

        get({
          url: `https://api.dailymotion.com/videos?fields=allow_embed,created_time,description,embed_url,id,owner.screenname,title,url&languages=en&private=0&sort=${sortBy}&unpublished=0&verified=1&page=${page_id}&limit=10&search=${keyword}`,
        },
        (error, response, body) => {
          const batchId = String(moment().unix());
          const dailymotionResponse = {
            batchId,
            dailymotionDetails: [],
          };

          if (error) {
            return dailymotionMongoObject.getPreviousPost(offset, dailymotion.count)
              .then((dailymotionDetails) => {
                dailymotionResponse.dailymotionDetails = dailymotionDetails;
                resolve(dailymotionResponse);
              })
              .catch(() => {
                resolve(dailymotionResponse);
              });
          }
          const parsedBody = JSON.parse(body);
          const dailyMotionDetails = [];

          parsedBody.list.forEach((element) => {
            let description = element.description.replace(/<[^>]+>/g, '');

            description = this.hexcodeToChar(description);

            const details = {
              dailyMotionId: element.id,
              title: element.title,
              description,
              mediaUrl: decodeURIComponent(element.embed_url),
              publisherName: element['owner.screenname'],
              sourceUrl: decodeURIComponent(element.url),
              publishedDate: element.created_time,
              batchId,
              createdDate: utc(),
              version: dailymotion.version,
            };

            dailyMotionDetails.push(details);
          });

          return dailymotionMongoObject.insertManyPosts(dailyMotionDetails)
            .then(() => {
              dailymotionResponse.dailymotionDetails = dailyMotionDetails;
              resolve(dailymotionResponse);
            })
            .catch((error) => {
              console.error(`Error ${error}`);
              resolve(dailymotionResponse);
            });
        });
      }
    });
  }

  fetchRssFeeds(rssUrl) {
    return new Promise((resolve, reject) => {
      if (!rssUrl) {
        reject(new Error('Invalid Inputs'));
      } else {
        const result = _parse(rssUrl);

        if (result.protocol == 'http:') {
          reject(new Error('Sorry, Rss feed only support https protocol'));
        } else {
          const parseData = {
            uri: rssUrl,
            timeout: 10000,
          };

          return parse(parseData)
            .then((items) => {
              const rssFeeds = [];

              items.forEach((item) => {
                let description = '';

                if (item.description != null && item.description != '') description = item.description.replace(/<[^>]+>/g, '');
                description = description.replace('&lt;p&gt;&lt;p&gt;', '');
                description = description.replace('&lt;p&gt;', '');
                description = description.replace('&lt;/p&gt;', '');
                description = description.replace('</p>', '');

                const details = {
                  guid: item.guid,
                  title: item.title,
                  description,
                  mediaImages: item.image,
                  mediaUrl: item.link,
                  publishedDate: item.pubDate,
                };

                rssFeeds.push(details);
              });
              resolve(rssFeeds);
            })
            .catch((error) => {
              if (error.message.includes('ESOCKETTIMEDOUT')) {
                reject(new Error('Sorry, Currently cant able to fetch the feeds details.'));
              }
              reject(error);
            });
        }
      }
    });
  }

  async fetchRssFeedsNew(rssUrl) {
    return new Promise((resolve, reject) => {
      if (!rssUrl) {
        reject(new Error('Invalid Inputs'));
      } else {
        const result = _parse(rssUrl);
        // if (result.protocol == "http:") {
        //     reject(new Error("Sorry, Rss feed only support https protocol"));
        // } else {

        //     const parseData = {
        //         uri: rssUrl,
        //         timeout: 10000,
        //     };
        return parser.parseURL(rssUrl)
          .then((items) => {
            const rssFeeds = [];

            items.items.forEach((item) => {
              let description = '';

              if (item.contentSnippet != null && item.contentSnippet != '') description = item.contentSnippet.replace(/<[^>]+>/g, '');
              description = description.replace('&lt;p&gt;&lt;p&gt;', '');
              description = description.replace('&lt;p&gt;', '');
              description = description.replace('&lt;/p&gt;', '');
              description = description.replace('</p>', '');
              description = description.replace('</p>', '');

              const details = {
                guid: item.guid,
                title: item.title,
                description,
                mediaImages: item.image,
                mediaUrl: item.link,
                publishedDate: item.isoDate,
              };

              rssFeeds.push(details);
            });
            resolve(rssFeeds);
          })
          .catch((error) => {
            if (error.message.includes('ESOCKETTIMEDOUT')) {
              reject(new Error('Sorry, Currently cant able to fetch the feeds details.'));
            }
            reject(error);
          });
        // }
      }
    });
  }

  fetchYoutube(youtube, pageId, keyword, sortby,ccode) {
    return new Promise((resolve, reject) => {
      const youtubeModelObject = new YoutubeMongoModel();
      const offset = (pageId) * youtube.count;

      get({
        url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${offset}&order=${sortby}&q=${encodeURI(keyword)}&key=${youtube.api_key}&regionCode=${ccode}`,
      }, (error, response, body) => {
        const batchId = String(moment().unix());
        const youtubeResponse = {
          batchId,
          youtubeDetails: [],
        };

        if (error) {
          return youtubeModelObject.getPreviousPost(keyword, offset, youtube.count)
            .then((youtubeDetails) => {
              if (youtubeDetails.length > 0) youtubeResponse.youtubeDetails = youtubeDetails;
              else throw new Error(`${JSON.stringify(parsedBody.error.message)}`);
              resolve(youtubeResponse);
            })
            .catch((error) => {
              reject(error);
            });
        }
        const youtubeDetails = [];

        try {
          const parsedBody = JSON.parse(body);

          if (parsedBody.error?.code == 403) {
            return youtubeModelObject.getPreviousPost(keyword, offset, youtube.count)
              .then((youtubeDetails) => {
                if (youtubeDetails.length > 0) youtubeResponse.youtubeDetails = youtubeDetails;
                else throw new Error(`${JSON.stringify(parsedBody.error.message)}`);
                resolve(youtubeResponse);
              })
              .catch((error) => {
                reject(error);
              });
          }
          parsedBody.items.map((element) => {
            const details = {
              videoId: element.id.videoId,
              title: element.snippet.title,
              channelId: element.snippet.channelId,
              channelTitle: element.snippet.channelTitle,
              description: element.snippet.description,
              publishedDate: element.snippet.publishedAt,
              mediaUrl: `https://www.youtube.com/watch?v=${element.id.videoId}`,
              embed_url: `https://www.youtube.com/embed/${element.id.videoId}`,
              batchId,
              createdDate: utc(),
              version: youtube.version,
            };

            youtubeDetails.push(details);
          });
        } catch (error) {
          reject(error);
        }

        return youtubeModelObject.insertManyPosts(youtubeDetails)
          .then(() => {
            youtubeResponse.youtubeDetails = youtubeDetails;
            resolve(youtubeResponse);
          })
          .catch((error) => {
            resolve(error);
          });
      });
    });
  }

  fetchYoutubeTrending(youtube, countryCode) {
    return new Promise((resolve, reject) => {
      if (!youtube || !countryCode) {
        reject(new Error('Invalid Inputs'));
      } else {
        const youtubeModelObject = new YoutubeMongoModel();
        // var offset = (pageId - 1) * youtube.count;
        // var countryWoeid = woeid.getWoeid(countryCode);

        get({
          // url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${youtube.count}&order=relevance&q=${keyword}&key=${youtube.api_key}`,

          url: `https://www.googleapis.com/youtube/v3/videos?part=id,snippet,contentDetails,liveStreamingDetails,localizations,player,recordingDetails,statistics,status,topicDetails&chart=mostPopular&regionCode=${countryCode}&maxResults=25&key=AIzaSyCK3QEaN-zlK3LRFjAp-ZcgcMSWowfghCU`,

        }, (error, response, body) => {
          const batchId = String(moment().unix());
          const youtubeResponse = {
            batchId,
            youtubeDetails: [],
          };

          if (error) {
            return youtubeModelObject.getPreviousPost(keyword, offset, youtube.count)
              .then((youtubeDetails) => {
                youtubeResponse.youtubeDetails = youtubeDetails;
                resolve(youtubeResponse);
              })
              .catch(() => {
                resolve(youtubeResponse);
              });
          }
          const parsedBody = JSON.parse(body);
          const youtubeDetails = [];

          parsedBody.items.forEach((element) => {
            let { duration } = element.contentDetails;

            duration = duration.replace('PT', '');
            duration = duration.replace('H', ':');
            duration = duration.replace('M', ':');
            const details = {
              videoId: element.id,
              title: element.snippet.title,
              channelId: element.snippet.channelId,
              channelTitle: element.snippet.channelTitle,
              description: element.snippet.description,
              publishedDate: element.snippet.publishedAt,
              mediaUrl: `https://www.youtube.com/watch?v=${element.id}`,
              embed_url: `https://www.youtube.com/embed/${element.id}`,
              batchId,
              viewCount: element.statistics.viewCount,
              likeCount: element.statistics.likeCount,
              dislikeCount: element.statistics.dislikeCount,
              favoriteCount: element.statistics.favoriteCount,
              commentCount: element.statistics.commentCount,
              duration,
              tags: element.snippet.tags,
              createdDate: utc(),
              version: youtube.version,
            };

            youtubeDetails.push(details);
          });

          return youtubeModelObject.insertManyPosts(youtubeDetails)
            .then(() => {
              youtubeResponse.youtubeDetails = youtubeDetails;
              resolve(youtubeResponse);
            })
            .catch((error) => {
              resolve(youtubeResponse);
            });
        });
      }
    });
  }

  fetchTrendingKeywords(countryCode) {
    return new Promise((resolve, reject) => {
      if (!countryCode) {
        reject(new Error('Invalid Inputs'));
      } else {
        const countryWoeid = getWoeid(countryCode);

        const options = {
          url: 'https://twitter.com/i/trends?&personalized=false&show_context=true&src=module&woeid=23424848',
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',

          },
        };
        //   request(options, function (error, response, body) {
        //     console.error('error:', error); // Print the error if one occurred
        //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //    // console.log('body:', body);
        //     resolve(body)

        //     // Print the HTML for the Google homepage.
        //   });

        get(
          options,
          (error, response, body) => {
            if (error) {
              reject(error);
            } else {
              resolve(body);
              const parsedBody = JSON.parse(body);
              //  resolve(parsedBody)
              const stringifyBody = JSON.stringify(parsedBody);
              const trendsSplitUp = stringifyBody.split('li class=\\"trend-item');

              trendsSplitUp.shift();
              const trends = [];

              trendsSplitUp.forEach((data) => {
                const details = {
                  title: this.getBetween(data, 'data-trend-name=\\"', '\\"').trim(),
                  tweetCount: this.getBetween(data, 'js-ellipsis\\\">\\n', 'Tweets').trim(),
                };

                trends.push(details);
              });
              resolve(response);
            }
          },
        );
      }
    });
  }

  fetchTwitter(keyword) {
    return new Promise((resolve, reject) => {
      if (!keyword) {
        reject(new Error('Invalid Inputs'));
      } else {
        get({
          url: `https://twitter.com/search?f=tweets&vertical=default&q=${keyword}`,
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            const stringifyBody = JSON.stringify(body);
            const trendsSplitUp = stringifyBody.split('js-stream-item');

            trendsSplitUp.shift();
            const trends = [];

            const tweetsDetails = {
              count: trendsSplitUp.length,
            };

            trendsSplitUp.forEach((data) => {
              const tweetUrl = this.getBetween(data, 'data-permalink-path=\\\"', '\\\"');
              const userScreenName = this.getBetween(data, 'data-screen-name=\\\"', '\\\"');
              const userName = this.getBetween(data, 'data-name=\\\"', '\\\"');
              const userId = this.getBetween(data, 'data-user-id=\\\"', '\\\"');
              const tweetedTimeStamp = this.getBetween(data, 'data-time=\\\"', '\\\"');
              const tweetMediaUrl = this.getBetween(data, 'data-image-url=\\\"', '\\\"');
              let tweetMessageFull = '';

              if (data.includes('<span class=\\\"invisible')) {
                tweetMessageFull = this.getBetween(data, 'js-tweet-text-container\\\">', '<span class=\\\"invisible');
              } else {
                tweetMessageFull = this.getBetween(data, 'js-tweet-text-container\\\">', '<\/p>');
              }
              const tweetDetails = String(tweetMessageFull).replace(/<.*?>/g, '').replace(/(\\n)/gm, '').trim();

              const details = {
                tweetUrl: `https://twitter.com${tweetUrl}`,
                userScreenName: this.hexcodeToChar(userScreenName),
                userName: this.hexcodeToChar(userName),
                userId: this.hexcodeToChar(userId),
                tweetedTimeStamp: this.hexcodeToChar(tweetedTimeStamp),
                tweetDetails: this.hexcodeToChar(tweetDetails),
                tweetMediaUrl,
              };

              trends.push(details);
            });

            tweetsDetails.tweets = trends;
            resolve(tweetsDetails);
          }
        });
      }
    });
  }

  getBetween(pageSource, firstData, secondData) {
    try {
      const resSplit = pageSource.split(firstData);
      const indexSec = resSplit[1].indexOf(secondData);

      return resSplit[1].substring(0, indexSec);
    } catch (e) {
      return '';
    }
  }

  hexcodeToChar(text) {
    const regex = /&#x[\dA-F]{1,5};/gi;
    const regex1 = /&#x[\dA-F]{1,5}d;/gi;
    const regex2 = /&#(?:x([\da-f]+)|(\d+));/gi;
    let matchedRegex;

    if (regex.test(text)) {
      matchedRegex = regex;
    } else if (regex1.test(text)) {
      matchedRegex = regex1;
    }
    if (matchedRegex === undefined) {
      if (regex2.test(text)) {
        return text.replace(regex2, (_, hex, dec) => String.fromCharCode(dec || +(`0x${hex}`)));
      }
    }
    if (matchedRegex !== undefined || matchedRegex !== null) {
      return text.replace(matchedRegex, (match) => String.fromCharCode(parseInt(match.replace(/&#x/g, '0x').replace(/;/g, ''), 16)));
    }

    return text;
  }
}

export default Trends;
