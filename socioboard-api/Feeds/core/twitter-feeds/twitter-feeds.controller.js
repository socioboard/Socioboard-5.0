import FeedsService from './twitter-feeds.service.js';

class FeedController {
  async getTweets(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'Get feeds of twitter account' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['pageId'] = {
                in: 'query',
                description: 'Pagination Id'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.getTweets(req, res, next);
  }

  async twitterLike(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for making like to a twitter post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want to like'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twitterLike(req, res, next);
  }

  async twitterDislike(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for making undo like to a twitter post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want to undo like'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twitterDislike(req, res, next);
  }

  async twitterComment(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for  comment a twitter post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want comment'
                }
                #swagger.parameters['comment'] = {
                in: 'query',
                description: 'comment'
                }
                #swagger.parameters['username'] = {
                in: 'query',
                description: 'username'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twitterComment(req, res, next);
  }

  async twitterDeleteComment(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for delete  a twitter post' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want delete'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twitterDeleteComment(req, res, next);
  }

  async twtRetweet(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for make retweet a tweet' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want retweet'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twtRetweet(req, res, next);
  }

  async twtUnretweet(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for make undo retweet a tweet' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want un retweet'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twtUnretweet(req, res, next);
  }

  async twtRetweetWithComment(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'To request for make  retweet a tweet with qoutes' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                #swagger.parameters['tweetId'] = {
                in: 'query',
                description: 'Tweet id which you want un retweet'
                }
                #swagger.parameters['comment'] = {
                in: 'query',
                description: 'comment'
                }
                #swagger.parameters['username'] = {
                in: 'query',
                description: 'username'
                } */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.twtRetweetWithComment(req, res, next);
  }

  async fetchAllTweets(req, res, next) {
    /* 	#swagger.tags = ['Twitter Feeds']
            #swagger.description = 'Get feeds of twitter account from twitter and store in database' */
    /*	#swagger.parameters['accountId'] = {
                in: 'query',
                description: 'Twitter account id',
                }
                #swagger.parameters['teamId'] = {
                in: 'query',
                description: 'Team Id'
                }
                */
    /* #swagger.security = [{
               "AccessToken": []
        }] */
    return await FeedsService.fetchAllTweets(req, res, next);
  }
}

export default new FeedController();
