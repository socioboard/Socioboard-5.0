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
const logger = require('../utils/logger');


/**
 * Use Proxy if needed 
 * var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;
 * var proxiedRequest = request.defaults({'proxy': proxyUrl});
 */

class Trends {

    fetchGiphy(giphy, keyword, pageId, filter) {
        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!giphy || !keyword || !pageId || !filter) {
                reject(new Error("Invalid Inputs"));
            } else {
                var giphyModelObject = new GiphyMongoModel();
                var offset = (pageId - 1) * giphy.count;
                request.get({
                    url: `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(keyword)}&rating=${filter}&api_key=${giphy.api_key}&offset=${offset}&limit=${giphy.count}`
                }, function (error, response, body) {

                    var giphyResponse = {
                        giphyDetails: []
                    };
                    // Checking whether it sent error in callback or not
                    if (error) {
                        return giphyModelObject.getPreviousPost(keyword, filter, offset, giphy.count)
                            .then((giphyDetails) => {
                                giphyResponse.giphyDetails = giphyDetails;
                                // Sending response
                                resolve(giphyResponse);
                            })
                            .catch(() => {
                                // Sending response
                                resolve(giphyResponse);
                            });
                    }
                    else {
                        var batchId = String(moment().unix());
                        giphyResponse.batchId = batchId;
                        var giphyDetails = [];
                        // Formating the response(body)
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
                                    category: filter,
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
                                logger.info(error);
                            }
                            return;
                        }))
                            .then(() => {
                                // Saving the formated response into mongo DB of giphyposts
                                return giphyModelObject.insertManyGiphy(giphyDetails);
                            })
                            .then(() => {
                                giphyResponse.giphyDetails = giphyDetails;
                                // Sending response
                                resolve(giphyResponse);
                            })
                            .catch((error) => {
                                // Sending response
                                resolve(giphyResponse);
                            });
                    }
                });
            }
        });
    }

    fetchNewsApi(news_api, keyword, pageId, sort) {
        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!news_api || !keyword || !pageId || !sort) {
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
                    sortBy: sort,
                    page: pageId // integer
                })
                    .then(response => {

                        // Formating the response
                        var parsedBody = response;
                        var newsApiDetails = [];
                        if (parsedBody.status == "ok") {
                            parsedBody.articles.forEach(element => {

                                var details = {
                                    title: element.title,
                                    publisherName: element.author,
                                    description: element.description,
                                    category: sort,
                                    mediaUrl: element.urlToImage,
                                    sourceUrl: element.url,
                                    publishedDate: element.publishedAt,

                                    batchId: batchId,
                                    createdDate: moment.utc(),
                                    version: news_api.version
                                };
                                newsApiDetails.push(details);
                            });

                            // Saving the formated response into mongo DB of newsapiposts collection
                            return newsApiMongoObject.insertManyPosts(newsApiDetails)
                                .then(() => {
                                    newsApiResponse.newsApiDetails = newsApiDetails;
                                    // Sending response
                                    resolve(newsApiResponse);
                                })
                                .catch((error) => {
                                    // Sending response
                                    resolve(newsApiResponse);
                                });
                        } else {
                            // Sending response
                            resolve(newsApiResponse);
                        }
                    })
                    .catch((error) => {
                        return newsApiMongoObject.getPreviousPost(keyword, sort, offset, news_api.count)
                            .then((newsApiDetails) => {
                                newsApiResponse.newsApiDetails = newsApiDetails;
                                // Sending response
                                resolve(newsApiResponse);
                            })
                            .catch(() => {
                                // Sending response
                                resolve(newsApiResponse);
                            });
                    });
            }
        });
    }

    fetchPixabay(pixabay, keyword, pageId, filter, sort) {

        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!pixabay || !keyword || !pageId || !filter || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                var pixabayModelObject = new PixabayMongoModel();
                var offset = (pageId - 1) * pixabay.count;
                request.get({
                    url: `https://pixabay.com/api/?key=${pixabay.api_key}&category=${filter}&q=${encodeURIComponent(keyword)}&order=${sort}&image_type=photo&pretty=true&page=${pageId}`
                    //  url: `https://pixabay.com/api/?key=${pixabay.api_key}&category=${filter}&q=${encodeURIComponent(keyword)}&order=${sort}&image_type=photo&pretty=true&page=${pageId}`
                }, function (error, response, body) {

                    var batchId = String(moment().unix());
                    var pixabayResponse = {
                        batchId: batchId,
                        pixabayDetails: []
                    };

                    // Checking whether it sent error in callback or not
                    if (error) {
                        return pixabayModelObject.getPreviousPost(keyword, sort, offset, pixabay.count)
                            .then((pixabayDetails) => {
                                pixabayResponse.pixabayDetails = pixabayDetails;
                                // Sending response
                                resolve(pixabayResponse);
                            })
                            .catch(() => {
                                // Sending response
                                resolve(pixabayResponse);
                            });
                    }
                    else {
                        // Formating the response(body)
                        var parsedBody = JSON.parse(body);
                        var pixabayDetails = [];
                        parsedBody.hits.forEach(element => {
                            var details = {
                                pixaBayId: element.id,
                                title: element.tags,
                                description: element.tags,
                                category: sort,
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
                        // Saving the formated response into mongo DB of pixabayposts collection
                        return pixabayModelObject.insertManyPosts(pixabayDetails)
                            .then(() => {
                                pixabayResponse.pixabayDetails = pixabayDetails;
                                // Sending response
                                resolve(pixabayResponse);
                            })
                            .catch((error) => {
                                // Sending response
                                resolve(pixabayResponse);
                            });
                    }
                });
            }
        });
    }

    fetchFlickr(flickr, keyword, pageId, sort) {
        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!flickr || !keyword || !pageId || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                var flickrModelObject = new FlickrMongoModel();
                var offset = (pageId - 1) * flickr.count;

                request.get({
                    url: `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${flickr.api_key}&text=${keyword}&sort=${sort}&privacy_filter=1&content_type=1&extras=date_upload%2C+date_taken%2C+owner_name%2C+url_l%2C+url_o%2Ctags&per_page=20&page=${pageId}&format=json&nojsoncallback=1`
                }, function (error, response, body) {

                    var batchId = String(moment().unix());
                    var flickrResponse = {
                        batchId: batchId,
                        flickrDetails: []
                    };

                    // Checking whether it sent error in callback or not
                    if (error) {
                        return flickrModelObject.getPreviousPost(keyword, sort, offset, flickr.count)
                            .then((flickrResponse) => {
                                flickrResponse.flickrDetails = flickrResponse;
                                // Sending response
                                resolve(flickrResponse);
                            })
                            .catch(() => {
                                // Sending response
                                resolve(flickrResponse);
                            });
                    }
                    else {
                        // Formating the response(body)
                        var parsedBody = JSON.parse(body);
                        var flickrDetails = [];
                        parsedBody.photos.photo.forEach(element => {
                            var details = {
                                flickrId: element.id,
                                title: element.title,
                                description: element.tags ? element.tags : '',
                                category: sort,
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

                        // Saving the formated response into mongo DB of flickrposts collection
                        return flickrModelObject.insertManyPosts(flickrDetails)
                            .then(() => {
                                flickrResponse.flickrDetails = flickrDetails;
                                // Sending response
                                resolve(flickrResponse);
                            })
                            .catch((error) => {
                                // Sending response
                                resolve(flickrResponse);
                            });
                    }
                });
            }
        });
    }

    fetchDailyMotion(dailymotion, page_id, filter, sort) {

        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!dailymotion || !page_id || !filter || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                var dailymotionMongoObject = new DailymotionMongoModel();
                var offset = (page_id - 1) * dailymotion.count;

                request.get({
                    // url: `https://api.dailymotion.com/videos?list=${filter}fields=allow_embed,created_time,description,embed_url,id,owner.screenname,title,url,&360_degree=0&availability=1&languages=en&private=0&sort=${sort}&verified=1&page=${page_id}&limit=${dailymotion.count}`,
                    url: `https://api.dailymotion.com/videos?list=${filter}&fields=allow_embed%2Ccreated_time%2Cdescription%2Cembed_url%2Cid%2Cowner.screenname%2Ctitle%2Curl&availability=1&languages=en&sort=${sort}&page=${page_id}&limit=${dailymotion.count}&flags=verified`
                },
                    (error, response, body) => {

                        var batchId = String(moment().unix());
                        var dailymotionResponse = {
                            batchId: batchId,
                            dailymotionDetails: []
                        };
                        if (error) {
                            logger.error(error);
                            return dailymotionMongoObject.getPreviousPost(offset, sort, dailymotion.count)
                                .then((dailymotionDetails) => {
                                    dailymotionResponse.dailymotionDetails = dailymotionDetails;
                                    // Sending response
                                    resolve(dailymotionResponse);
                                })
                                .catch(() => {
                                    // Sending response
                                    resolve(dailymotionResponse);
                                });
                        } else {
                            // Formating the response(body)
                            var parsedBody = JSON.parse(body);
                            var dailyMotionDetails = [];
                            parsedBody.list.forEach(element => {
                                var description = element.description.replace(/<[^>]+>/g, '');
                                description = this.hexcodeToChar(description);

                                var details = {
                                    dailyMotionId: element.id,
                                    title: element.title,
                                    description: description,
                                    category: sort,
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
                            // Saving the formated response into mongo DB of dailymotionposts collection
                            return dailymotionMongoObject.insertManyPosts(dailyMotionDetails)
                                .then(() => {
                                    dailymotionResponse.dailymotionDetails = dailyMotionDetails;
                                    // Sending response
                                    resolve(dailymotionResponse);
                                })
                                .catch((error) => {
                                    // Sending response
                                    resolve(dailymotionResponse);
                                });
                        }
                    });
            }
        });
    }

    fetchImgur(imgurApi, keyword, page_id, filter, sort) {

        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!imgurApi || !keyword || !page_id || !filter || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                var imgurModelObject = new ImgurMongoModel();
                var offset = (page_id - 1) * imgurApi.count;

                request.get({
                    headers: { 'Authorization': `Client-ID ${imgurApi.client_id}` },
                    url: `https://api.imgur.com/3/gallery/search/${filter}/${page_id}?q=${keyword}&sort=${sort}`
                }, (error, response, body) => {

                    var batchId = String(moment().unix());
                    var imgurResponse = {
                        batchId: batchId,
                        imgurDetails: []
                    };

                    if (error) {
                        imgurModelObject.getPreviousPost(keyword, sort, offset, imgurApi.count)
                            .then((imgurDetails) => {
                                imgurResponse.imgurDetails = imgurDetails;
                                // Sending response
                                resolve(imgurResponse);
                            })
                            .catch(() => {
                                // Sending response
                                resolve(imgurResponse);
                            });
                    } else {
                        // Formating the response(body)
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
                                category: sort,
                                publisherName: element.account_id,
                                publishedDate: moment(Number(element.datetime) * 1000).format("M/D/YYYY H:mm"),

                                batchId: batchId,
                                createdDate: moment.utc(),
                                version: imgurApi.version
                            };
                            imgurDetails.push(details);
                        });

                        // Saving the formated response into mongo DB of imgurposts collection
                        return imgurModelObject.insertManyPosts(imgurDetails)
                            .then(() => {
                                imgurResponse.imgurDetails = imgurDetails;
                                // Sending response
                                resolve(imgurResponse);
                            })
                            .catch((error) => {
                                // Sending response
                                resolve(imgurResponse);
                            });
                    }
                });
            }
        });


    }

    fetchRssFeeds(rssUrl) {
        return new Promise((resolve, reject) => {
            // Checking whether the input rssUrl is having value or not
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
                    // Formating the response
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
                            // Sending response
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

    fetchYoutube(youtube, pageId, keyword, sort) {
        return new Promise((resolve, reject) => {
            // Checking whether the inputs are having values or not
            if (!youtube || !pageId || !keyword || !sort) {
                reject(new Error("Invalid Inputs"));
            } else {
                var youtubeModelObject = new YoutubeMongoModel();
                var offset = (pageId - 1) * youtube.count;

                request.get({
                    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${youtube.count}&order=${sort}&q=${keyword}&key=${youtube.api_key}`,
                }, function (error, response, body) {

                    var batchId = String(moment().unix());
                    var youtubeResponse = {
                        batchId: batchId,
                        youtubeDetails: []
                    };

                    // Checking whether it sent error in callback or not
                    if (error) {
                        return youtubeModelObject.getPreviousPost(keyword, sort, offset, youtube.count)
                            .then((youtubeDetails) => {
                                youtubeResponse.youtubeDetails = youtubeDetails;
                                // Sending response
                                resolve(youtubeResponse);
                            })
                            .catch(() => {
                                // Sending response
                                resolve(youtubeResponse);
                            });
                    }
                    else {
                        // Formating the response(body)
                        var parsedBody = JSON.parse(body);
                        var youtubeDetails = [];
                        parsedBody.items.forEach(element => {
                            var details = {
                                videoId: element.id.videoId,
                                title: element.snippet.title,
                                channelId: element.snippet.channelId,
                                channelTitle: element.snippet.channelTitle,
                                description: element.snippet.description,
                                category: sort,
                                publishedDate: element.snippet.publishedAt,
                                mediaUrl: `https://www.youtube.com/watch?v=${element.id.videoId}`,
                                embed_url: `https://www.youtube.com/embed/${element.id.videoId}`,
                                batchId: batchId,
                                createdDate: moment.utc(),
                                version: youtube.version
                            };
                            youtubeDetails.push(details);
                        });
                        // Saving the formated response into mongo DB of youtubeposts collection
                        return youtubeModelObject.insertManyPosts(youtubeDetails)
                            .then(() => {
                                youtubeResponse.youtubeDetails = youtubeDetails;
                                // Sending response
                                resolve(youtubeResponse);
                            })
                            .catch((error) => {
                                // Sending response
                                resolve(youtubeResponse);
                            });
                    }
                });
            }
        });
    }

    fetchTrendingKeywords(countryCode) {
        return new Promise((resolve, reject) => {
            // Checking whether the input countryCode is having value or not
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
                        // Formating the response(body)
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
                        // Sending response
                        resolve(trends);
                    }
                });
            }
        });
    }

    fetchTwitter(keyword) {
        return new Promise((resolve, reject) => {
            // Checking whether the input keyword is having value or not
            if (!keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                request.get({
                    url: `https://twitter.com/search?f=tweets&vertical=default&q=${keyword}`,
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        // Formating the response(body)
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
                        // Sending response
                        resolve(tweetsDetails);
                    }

                });
            }

        });


    }

    // Function to get the value between 2 strings/chars
    getBetween(pageSource, firstData, secondData) {
        try {
            const resSplit = pageSource.split(firstData);
            const indexSec = resSplit[1].indexOf(secondData);
            return resSplit[1].substring(0, indexSec);
        } catch (e) {
            return "";
        }
    }

    // Function to change hexastring to charecter string 
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