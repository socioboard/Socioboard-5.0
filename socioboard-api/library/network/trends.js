const request = require('request');
const feedparser = require('feedparser-promised');
const NewsAPI = require('newsapi');
const moment = require('moment');
const GiphyMongoModel = require('../mongoose/models/giphyposts');
const NewsApiMongoModel = require('../mongoose/models/newsapiposts');
const PixabayMongoModel = require('../mongoose/models/pixabayposts');
const FlickrMongoModel = require('../mongoose/models/flickrposts');
const DailymotionMongoModel = require('../mongoose/models/dailymotionposts');
const ImgurMongoModel = require('../mongoose/models/imgurposts');
const YoutubeMongoModel = require('../mongoose/models/youtubepost');
const woeid = require('../utility/woeidServices');
const url = require('url');


/**
 * Use Proxy if needed 
 * var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;
 * var proxiedRequest = request.defaults({'proxy': proxyUrl});
 */

class Trends {

    fetchGiphy(giphy, keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!giphy || !keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var giphyModelObject = new GiphyMongoModel();
                var offset = (pageId - 1) * giphy.count;
                request.get({
                    url: `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(keyword)}&api_key=${giphy.api_key}&offset=${offset}&limit=${giphy.count}`
                }, function (error, response, body) {

                    var giphyResponse = {
                        giphyDetails: []
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
                    else {
                        var batchId = String(moment().unix());
                        giphyResponse.batchId = batchId;
                        var giphyDetails = [];
                        var parsedBody = JSON.parse(body);
                        return Promise.all(parsedBody.data.map(element => {
                            try {
                                var importDate = element.import_datetime;
                                if (importDate == '1970-01-01 00:00:00')
                                    importDate = element.trending_datetime;
                                var details = {
                                    giphyId: element.id,
                                    sourceUrl: element.source_tld ? encodeURI(element.source_tld) : "",
                                    title: element.title,
                                    description: element.slug,
                                    publisherName: element.username,
                                    publishedDate: importDate,
                                    postSourceUrl: element.source_post_url ? encodeURI(element.source_post_url) : "",
                                    mediaUrl: element.images.preview_gif.url ? encodeURI(element.images.preview_gif.url) : "",
                                    rating: element.rating,
                                    score: element._score,

                                    batchId: batchId,
                                    createdDate: moment.utc(),
                                    version: giphy.version
                                };
                                giphyDetails.push(details);
                            } catch (error) {
                                console.log(error);
                            }
                            return;
                        }))
                            .then(() => {
                                return giphyModelObject.insertManyGiphy(giphyDetails);
                            })
                            .then(() => {
                                giphyResponse.giphyDetails = giphyDetails;
                                resolve(giphyResponse);
                            })
                            .catch((error) => {
                                resolve(giphyResponse);
                            });
                    }
                });
            }
        });
    }

    fetchNewsApi(news_api, keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!news_api || !keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var newsApiMongoObject = new NewsApiMongoModel();
                var newsapi = new NewsAPI(news_api.api_key);
                var todayDate = moment(new Date()).format("YYYY/MM/DD");
                var offset = (pageId - 1) * news_api.count;

                var batchId = String(moment().unix());
                var newsApiResponse = {
                    batchId: batchId,
                    newsApiDetails: []
                };

                newsapi.v2.everything({
                    q: keyword,
                    from: todayDate,
                    to: todayDate,
                    language: 'en',
                    sortBy: 'relevancy',
                    page: pageId // integer
                })
                    .then(response => {

                        var parsedBody = response;
                        var newsApiDetails = [];
                        if (parsedBody.status == "ok") {
                            parsedBody.articles.forEach(element => {

                                var details = {
                                    title: element.title,
                                    publisherName: element.author,
                                    description: element.description,
                                    mediaUrl: element.urlToImage,
                                    sourceUrl: element.url,
                                    publishedDate: element.publishedAt,

                                    batchId: batchId,
                                    createdDate: moment.utc(),
                                    version: news_api.version
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
                        } else {
                            resolve(newsApiResponse);
                        }
                    })
                    .catch((error) => {
                        return newsApiMongoObject.getPreviousPost(keyword, offset, news_api.count)
                            .then((newsApiDetails) => {
                                newsApiResponse.newsApiDetails = newsApiDetails;
                                resolve(newsApiResponse);
                            })
                            .catch(() => {
                                resolve(newsApiResponse);
                            });
                    });
            }
        });
    }

    fetchPixabay(pixabay, keyword, pageId) {

        return new Promise((resolve, reject) => {
            if (!pixabay || !keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var pixabayModelObject = new PixabayMongoModel();
                var offset = (pageId - 1) * pixabay.count;
                request.get({
                    url: `https://pixabay.com/api/?key=${pixabay.api_key}&q=${encodeURIComponent(keyword)}&image_type=photo&pretty=true&page=${pageId}`
                }, function (error, response, body) {

                    var batchId = String(moment().unix());
                    var pixabayResponse = {
                        batchId: batchId,
                        pixabayDetails: []
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
                    else {
                        var parsedBody = JSON.parse(body);
                        var pixabayDetails = [];
                        parsedBody.hits.forEach(element => {
                            var details = {
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

                                batchId: batchId,
                                createdDate: moment.utc(),
                                version: pixabay.version
                            };
                            pixabayDetails.push(details);
                        });
                        return pixabayModelObject.insertManyPosts(pixabayDetails)
                            .then(() => {
                                pixabayResponse.pixabayDetails = pixabayDetails;
                                resolve(pixabayResponse);
                            })
                            .catch((error) => {
                                resolve(pixabayResponse);
                            });
                    }
                });
            }
        });
    }

    fetchFlickr(flickr, keyword, pageId) {
        return new Promise((resolve, reject) => {
            if (!flickr || !keyword || !pageId) {
                reject(new Error("Invalid Inputs"));
            } else {
                var flickrModelObject = new FlickrMongoModel();
                var offset = (pageId - 1) * flickr.count;

                request.get({
                    url: `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickr.api_key}&text=${keyword}&sort=date-posted-desc&privacy_filter=1&content_type=1&extras=date_upload%2C+date_taken%2C+owner_name%2C+url_l%2C+url_o%2Ctags&per_page=20&page=${pageId}&format=json&nojsoncallback=1`
                }, function (error, response, body) {

                    var batchId = String(moment().unix());
                    var flickrResponse = {
                        batchId: batchId,
                        flickrDetails: []
                    };

                    if (error) {
                        return flickrModelObject.getPreviousPost(keyword, offset, flickr.count)
                            .then((flickrResponse) => {
                                flickrResponse.flickrDetails = flickrResponse;
                                resolve(flickrResponse);
                            })
                            .catch(() => {
                                resolve(flickrResponse);
                            });
                    }
                    else {
                        var parsedBody = JSON.parse(body);
                        var flickrDetails = [];
                        parsedBody.photos.photo.forEach(element => {
                            var details = {
                                flickrId: element.id,
                                title: element.title,
                                description: element.tags ? element.tags : '',
                                mediaUrl: decodeURIComponent(element.url_l || element.url_o),
                                publisherName: element.ownername,
                                sourceUrl: `https://www.flickr.com/photos/${element.owner}/${element.id}/`,
                                publishedDate: element.datetaken,

                                batchId: batchId,
                                createdDate: moment.utc(),
                                version: flickr.version
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
                    }
                });
            }
        });
    }

    fetchDailyMotion(dailymotion, page_id) {

        return new Promise((resolve, reject) => {
            if (!dailymotion || !page_id) {
                reject(new Error("Invalid Inputs"));
            } else {
                var dailymotionMongoObject = new DailymotionMongoModel();
                var offset = (page_id - 1) * dailymotion.count;

                request.get({
                    url: `https://api.dailymotion.com/videos?fields=allow_embed,created_time,description,embed_url,id,owner.screenname,title,url,&360_degree=0&availability=1&languages=en&private=0&sort=visited-week&unpublished=0&verified=1&page=${page_id}&limit=${dailymotion.count}`,
                },
                    (error, response, body) => {

                        var batchId = String(moment().unix());
                        var dailymotionResponse = {
                            batchId: batchId,
                            dailymotionDetails: []
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
                        } else {
                            var parsedBody = JSON.parse(body);
                            var dailyMotionDetails = [];
                            parsedBody.list.forEach(element => {
                                var description = element.description.replace(/<[^>]+>/g, '');
                                description = this.hexcodeToChar(description);

                                var details = {
                                    dailyMotionId: element.id,
                                    title: element.title,
                                    description: description,
                                    mediaUrl: decodeURIComponent(element.embed_url),
                                    publisherName: element["owner.screenname"],
                                    sourceUrl: decodeURIComponent(element.url),
                                    publishedDate: element.created_time,

                                    batchId: batchId,
                                    createdDate: moment.utc(),
                                    version: dailymotion.version
                                };
                                dailyMotionDetails.push(details);
                            });
                            return dailymotionMongoObject.insertManyPosts(dailyMotionDetails)
                                .then(() => {
                                    dailymotionResponse.dailymotionDetails = dailyMotionDetails;
                                    resolve(dailymotionResponse);
                                })
                                .catch((error) => {
                                    resolve(dailymotionResponse);
                                });
                        }
                    });
            }
        });
    }

    fetchImgur(imgurApi, keyword, page_id) {

        return new Promise((resolve, reject) => {
            if (!imgurApi || !keyword || !page_id) {
                reject(new Error("Invalid Inputs"));
            } else {
                var imgurModelObject = new ImgurMongoModel();
                var offset = (page_id - 1) * imgurApi.count;

                request.get({
                    headers: { 'Authorization': `Client-ID ${imgurApi.client_id}` },
                    url: `https://api.imgur.com/3/gallery/search/viral/${page_id}?q=${keyword}`
                }, (error, response, body) => {

                    var batchId = String(moment().unix());
                    var imgurResponse = {
                        batchId: batchId,
                        imgurDetails: []
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
                        var parsedBody = JSON.parse(body);
                        var imgurDetails = [];
                        parsedBody.data.forEach(element => {
                            var mediaUrls = [];
                            if (element.images) {
                                element.images.forEach(medias => {
                                    var media = medias.link;
                                    mediaUrls.push(media);
                                });
                            }
                            var details = {
                                imgurId: element.id,
                                mediaUrl: mediaUrls.length <= 0 ? element.link : mediaUrls,
                                title: element.title,
                                description: element.description ? element.description : '',
                                publisherName: element.account_id,
                                publishedDate: moment(Number(element.datetime) * 1000).format("M/D/YYYY H:mm"),

                                batchId: batchId,
                                createdDate: moment.utc(),
                                version: imgurApi.version
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

    fetchRssFeeds(rssUrl) {
        return new Promise((resolve, reject) => {
            if (!rssUrl) {
                reject(new Error("Invalid Inputs"));
            } else {
                var result = url.parse(rssUrl);
                if (result.protocol == "http:") {
                    reject(new Error("Sorry, Rss feed only support https protocol"));
                } else {

                    const parseData = {
                        uri: rssUrl,
                        timeout: 10000,
                    };
                    return feedparser.parse(parseData)
                        .then((items) => {
                            var rssFeeds = [];
                            items.forEach(item => {
                                var details = {
                                    guid: item.guid,
                                    title: item.title,
                                    description: item.description.replace(/<[^>]+>/g, ''),
                                    mediaImages: item.image,
                                    mediaUrl: item.link,
                                    publishedDate: item.pubDate
                                };
                                rssFeeds.push(details);
                            });
                            resolve(rssFeeds);
                        })
                        .catch((error) => {
                            if (error.message.includes('ESOCKETTIMEDOUT')) {
                                reject(new Error("Sorry, Currently cant able to fetch the feeds details."));
                            }
                            reject(error);
                        });
                }


            }
        });


    }

    fetchYoutube(youtube, pageId, keyword) {
        return new Promise((resolve, reject) => {
            if (!youtube || !pageId || !keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                var youtubeModelObject = new YoutubeMongoModel();
                var offset = (pageId - 1) * youtube.count;

                request.get({
                    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${youtube.count}&order=relevance&q=${keyword}&key=${youtube.api_key}`,
                }, function (error, response, body) {

                    var batchId = String(moment().unix());
                    var youtubeResponse = {
                        batchId: batchId,
                        youtubeDetails: []
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
                    else {
                        var parsedBody = JSON.parse(body);
                        var youtubeDetails = [];
                        parsedBody.items.forEach(element => {
                            var details = {
                                videoId: element.id.videoId,
                                title: element.snippet.title,
                                channelId: element.snippet.channelId,
                                channelTitle: element.snippet.channelTitle,
                                description: element.snippet.description,
                                publishedDate: element.snippet.publishedAt,
                                mediaUrl: `https://www.youtube.com/watch?v=${element.id.videoId}`,
                                embed_url: `https://www.youtube.com/embed/${element.id.videoId}`,
                                batchId: batchId,
                                createdDate: moment.utc(),
                                version: youtube.version
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
                    }
                });
            }
        });
    }

    fetchTrendingKeywords(countryCode) {
        return new Promise((resolve, reject) => {
            if (!countryCode) {
                reject(new Error("Invalid Inputs"));
            } else {
                var countryWoeid = woeid.getWoeid(countryCode);
                request.get({
                    url: `https://twitter.com/i/trends?&personalized=false&show_context=true&src=module&woeid=${countryWoeid}`,
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        var parsedBody = JSON.parse(body);
                        let stringifyBody = JSON.stringify(parsedBody);
                        let trendsSplitUp = stringifyBody.split('li class=\\"trend-item');
                        trendsSplitUp.shift();
                        let trends = [];
                        trendsSplitUp.forEach(data => {
                            var details = {
                                title: this.getBetween(data, 'data-trend-name=\\"', '\\"').trim(),
                                tweetCount: this.getBetween(data, 'js-ellipsis\\\">\\n', 'Tweets').trim(),
                            };
                            trends.push(details);
                        });
                        resolve(trends);
                    }
                });
            }
        });
    }

    fetchTwitter(keyword) {
        return new Promise((resolve, reject) => {
            if (!keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                request.get({
                    url: `https://twitter.com/search?f=tweets&vertical=default&q=${keyword}`,
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        let stringifyBody = JSON.stringify(body);
                        let trendsSplitUp = stringifyBody.split('js-stream-item');
                        trendsSplitUp.shift();
                        let trends = [];

                        var tweetsDetails = {
                            count: trendsSplitUp.length
                        };

                        trendsSplitUp.forEach(data => {
                            var tweetUrl = this.getBetween(data, 'data-permalink-path=\\\"', '\\\"');
                            var userScreenName = this.getBetween(data, 'data-screen-name=\\\"', '\\\"');
                            var userName = this.getBetween(data, 'data-name=\\\"', '\\\"');
                            var userId = this.getBetween(data, 'data-user-id=\\\"', '\\\"');
                            var tweetedTimeStamp = this.getBetween(data, 'data-time=\\\"', '\\\"');
                            var tweetMediaUrl = this.getBetween(data, 'data-image-url=\\\"', '\\\"');
                            var tweetMessageFull = '';

                            if (data.includes('<span class=\\\"invisible')) {
                                tweetMessageFull = this.getBetween(data, 'js-tweet-text-container\\\">', '<span class=\\\"invisible');
                            } else {
                                tweetMessageFull = this.getBetween(data, 'js-tweet-text-container\\\">', '<\/p>');
                            }
                            var tweetDetails = String(tweetMessageFull).replace(/<.*?>/g, '').replace(/(\\n)/gm, "").trim();

                            var details = {
                                tweetUrl: `https://twitter.com${tweetUrl}`,
                                userScreenName: this.hexcodeToChar(userScreenName),
                                userName: this.hexcodeToChar(userName),
                                userId: this.hexcodeToChar(userId),
                                tweetedTimeStamp: this.hexcodeToChar(tweetedTimeStamp),
                                tweetDetails: this.hexcodeToChar(tweetDetails),
                                tweetMediaUrl: tweetMediaUrl
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
            return "";
        }
    }

    hexcodeToChar(text) {
        var regex = /&#x[\dA-F]{1,5};/gi;
        var regex1 = /&#x[\dA-F]{1,5}d;/gi;
        var regex2 = /&#(?:x([\da-f]+)|(\d+));/gi;
        var matchedRegex;

        if (regex.test(text)) {
            matchedRegex = regex;
        } else {
            if (regex1.test(text)) {
                matchedRegex = regex1;
            }
        }
        if (matchedRegex === undefined) {
            if (regex2.test(text)) {
                return text.replace(regex2, function (_, hex, dec) {
                    return String.fromCharCode(dec || +('0x' + hex));
                });
            }
        }
        if (matchedRegex !== undefined || matchedRegex !== null) {
            return text.replace(matchedRegex, function replace(match) {
                return String.fromCharCode(parseInt(match.replace(/&#x/g, '0x').replace(/;/g, ''), 16));
            });
        } else {
            return text;
        }
    }
}



module.exports = Trends;