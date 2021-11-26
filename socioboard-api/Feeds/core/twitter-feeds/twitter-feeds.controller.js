import { ErrorResponse, SuccessResponse } from '../../../Common/Shared/response.shared.js';
import userTeamAccounts from '../../../Common/Shared/user-team-accounts.shared.js';
import FeedsService from './twitter-feeds.service.js';
import twitterFeedsValidate from './twitter-feeds.validate.js';
import TWITTER_CONSTANTS from '../../../Common/Constants/twitter.constants.js';
import twitterFeedsFilter from './twitter-feeds.filter.js';

let checkImportTwitterCountries = null;

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

  async getTrends(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
        #swagger.summary = 'Returns the top 50 trending topics for a specific id, if trending information is available for it.',
        #swagger.description = 'An API to return the trending topics near a specific latitude, longitude location.'
    */
    /*
      #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Twitter account id',
        required: true
      }
      #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
      }
      #swagger.parameters['country'] = {
        in: 'query',
        description: 'country',
      }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const creds = this.getAccountTokens(req.twitterAccount);

      const { country } = await twitterFeedsValidate
        .twitterGetTrendsSchema.validateAsync(req.query);

      const foundCountry = await FeedsService.getAvailableCountryByName(creds, country);

      if (!foundCountry) {
        return ErrorResponse(res, TWITTER_CONSTANTS.ERROR_MESSAGE.COUNTRY_NOT_FOUND, 404);
      }

      const trends = await FeedsService.getTrends(creds, foundCountry.woeid);

      const trendsFromDb = await FeedsService.getTrendsFromDbByWoeid(foundCountry.woeid);

      if (!trendsFromDb || (new Date().getTime() - trendsFromDb.expire_at) > 1000 * 60 * 60) {
        const trendsObj = trends ? trends[0] : {};

        await FeedsService.importTwitterTrends(foundCountry.woeid, trendsObj);
      }

      return SuccessResponse(res, trends);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async getTrendsAvailable(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
        #swagger.summary = 'Returns the top 50 trending topics for a specific id, if trending information is available for it.',
        #swagger.description = 'An API to return the trending topics near a specific latitude, longitude location.'
    */
    /*
      #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Twitter account id',
        required: true
      }
      #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
      }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const creds = this.getAccountTokens(req.twitterAccount);

      const availableCountries = await FeedsService.getAvailableCountries(creds);

      if (
        !checkImportTwitterCountries
        || (new Date().getTime() - checkImportTwitterCountries) > 1000 * 60 * 60
      ) {
        await FeedsService.importTwitterCountries(availableCountries);

        checkImportTwitterCountries = new Date().getTime();
      }

      const countries = availableCountries.map(({ name }) => ({ name }));

      return SuccessResponse(res, countries);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async searchTwitterUsers(req, res) {
    try {
      /* #swagger.tags = ['Twitter Feeds']
          #swagger.summary = 'Returns tending persongs',
          #swagger.description =
            'Provides a simple, relevance-based search interface to public user accounts on Twitter.
            Try querying by topical interest, full name, company name, location, or other criteria.
            Exact match searches are not supported.
            Only the first 1,000 matching results are available.'
      */
      /*
        #swagger.parameters['accountId'] = {
          in: 'query',
          description: 'Twitter account id',
          required: true
        }
        #swagger.parameters['teamId'] = {
          in: 'query',
          description: 'Team Id',
          required: true
        }
        #swagger.parameters['page'] = {
          in: 'query',
          description: 'Specifies the page of results to retrieve.'
        }
        #swagger.parameters['count'] = {
          in: 'query',
          description:
            'The number of potential user results to retrieve per page.
            This value has a maximum of 20.'
        }
        #swagger.parameters['query'] = {
          in: 'query',
          description: 'The search query to run against people search.',
          required: true
        }
      */
      /*
        #swagger.requestBody = {
          hidden: true
        }
      */
      /* #swagger.security = [{
          "AccessToken": []
        }]
      */

      const creds = this.getAccountTokens(req.twitterAccount);

      const validatedQuery = await twitterFeedsValidate.twitterSearchUsers.validateAsync(req.query);

      const foundUsers = await FeedsService.searchTwitterUsers(creds, validatedQuery);

      return SuccessResponse(res, foundUsers);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async getUserWithTweets(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
        #swagger.summary = 'Returns a collection of the most recent Tweets posted by the user
                            and user details.',
    */
    /*
      #swagger.parameters['accountId'] = {
        in: 'query',
        description: 'Twitter account id',
        required: true
      }
      #swagger.parameters['teamId'] = {
        in: 'query',
        description: 'Team Id',
        required: true
      }
      #swagger.parameters['count'] = {
        in: 'query',
        description:
          'The number of potential tweet.
           This value has a maximum of 200.'
      }
    */
    /*
      #swagger.requestBody = {
        hidden: true
      }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const creds = this.getAccountTokens(req.twitterAccount);

      const { account_id: accountId } = req.twitterAccount;

      const { userName: screen_name } = req.params;

      const validatedQuery = await twitterFeedsValidate
        .getUserTweetsSchema.validateAsync(req.query);

      const user = await FeedsService.getUserDetails({ creds, accountId, screen_name });

      const tweets = await FeedsService.getUserTweets(
        creds, { screen_name, ...validatedQuery },
      );

      return SuccessResponse(res, { user, tweets });
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async follow(req, res) {
    try {
      /* #swagger.tags = ['Twitter Feeds']
          #swagger.summary =
          'Allows the authenticating user to follow the user specified in the ID parameter.',
          #swagger.description = 'Returns the user when successful.
            Returns a describing the failure condition when unsuccessful.
            If the user is already friends with the user a HTTP 403 may be returned,
            though for performance reasons this method may also return a HTTP 200 OK message
            even if the follow relationship already exists.'
      */
      /*
        #swagger.parameters['body'] = {
          in: 'body',
          description: 'Follow params',
          schema: {
            $accountId: 1,
            $teamId: 1,
            $user: {
              $userId: 'or',
              $screenName: 'or',
            },
          }
        }
      */
      /* #swagger.security = [{
          "AccessToken": []
        }]
      */

      const creds = this.getAccountTokens(req.twitterAccount);

      const { account_id: accountId } = req.twitterAccount;

      const followByParams = await twitterFeedsValidate.followSchema.validateAsync(req.body.user);

      const followed = await FeedsService.followUser(creds, followByParams);

      const addedFriend = await FeedsService.addNewFriend(accountId, followed);

      return SuccessResponse(res, addedFriend);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async unfollow(req, res) {
    try {
      /* #swagger.tags = ['Twitter Feeds']
          #swagger.summary =
            'Allows the authenticating user to unfollow the user specified in the ID parameter.',
          #swagger.description =
            'Returns the user when successful.
            Returns a string describing the failure condition when unsuccessful.'
      */
      /*
        #swagger.parameters['body'] = {
          in: 'body',
          description: 'Unfollow params',
          schema: {
            $accountId: 1,
            $teamId: 1,
            $user: {
              $userId: 'or',
              $screenName: 'or',
            },
          }
        }
      */
      /* #swagger.security = [{
          "AccessToken": []
        }]
      */

      const creds = this.getAccountTokens(req.twitterAccount);

      const { account_id: accountId } = req.twitterAccount;

      const unfollowByParams = await twitterFeedsValidate.followSchema.validateAsync(req.body.user);

      const { id: userId } = await FeedsService.unfollowUser(creds, unfollowByParams);

      const deletedFriend = await FeedsService.deleteFriend(accountId, userId);

      return SuccessResponse(res, deletedFriend);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async importAccountFriends(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
        #swagger.summary =
          'Get Twitter friends and import them into the database.',
    */
    /*
      #swagger.parameters['body'] = {
          in: 'body',
          description: 'Account params',
          schema: {
            $accountId: 1,
            $teamId: 1,
          }
        }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const creds = this.getAccountTokens(req.twitterAccount);

      const { account_id: accountId, user_name: userName } = req.twitterAccount;

      const friends = await FeedsService.getUserFriends(
        { ...creds, userName, count: 200 },
      );

      const importedFriends = await FeedsService.importTwitterFriends(accountId, friends);

      return SuccessResponse(res, importedFriends);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async importAccountFollowers(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
        #swagger.summary =
          'Get Twitter followers and import them into the database.',
    */
    /*
      #swagger.parameters['body'] = {
          in: 'body',
          description: 'Account params',
          schema: {
            $accountId: 1,
            $teamId: 1,
          }
        }
    */
    /* #swagger.security = [{
        "AccessToken": []
      }]
    */

    try {
      const creds = this.getAccountTokens(req.twitterAccount);

      const { account_id: accountId, user_name: userName } = req.twitterAccount;

      const followers = await FeedsService.getUserFollowers(
        {
          creds, userName, count: 200,
        },
      );

      const importedFollowers = await FeedsService.importTwitterFollowers(accountId, followers);

      return SuccessResponse(res, importedFollowers);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async getAccountFriends(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
          #swagger.summary =
            'Return account friends',
    */
    /*
        #swagger.parameters['accountId'] = {
          in: 'query',
          type: 'number',
          required: true
        }
        #swagger.parameters['teamId'] = {
          in: 'query',
          type: 'number',
          required: true
        }
        #swagger.parameters['skip'] = {
          in: 'query',
          type: 'number',
        }
        #swagger.parameters['limit'] = {
          in: 'query',
          type: 'number',
        }
    */
    /*
        #swagger.requestBody = {
          hidden: true
        }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const { account_id: accountId } = req.twitterAccount;

      const {
        skip, limit,
      } = await twitterFeedsValidate.paginationUnknownSchema.validateAsync(req.query);

      const friends = await FeedsService.getAccountFriends(
        accountId, { skip, limit },
      );

      return SuccessResponse(res, friends);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  async getAccountFollowers(req, res) {
    /* #swagger.tags = ['Twitter Feeds']
          #swagger.summary =
            'Return account followers',
    */
    /*
        #swagger.parameters['accountId'] = {
          in: 'query',
          type: 'number',
          required: true
        }
        #swagger.parameters['teamId'] = {
          in: 'query',
          type: 'number',
          required: true
        }
        #swagger.parameters['skip'] = {
          in: 'query',
          type: 'number',
        }
        #swagger.parameters['limit'] = {
          in: 'query',
          type: 'number',
        }
    */
    /*
        #swagger.requestBody = {
          hidden: true
        }
    */
    /* #swagger.security = [{
          "AccessToken": []
        }]
    */

    try {
      const { account_id: accountId } = req.twitterAccount;

      const {
        skip, limit,
      } = await twitterFeedsValidate.paginationUnknownSchema.validateAsync(req.query);

      const followers = await FeedsService.getAccountFollowers(
        accountId, { skip, limit },
      );

      return SuccessResponse(res, followers);
    } catch (error) {
      return twitterFeedsFilter(res, error);
    }
  }

  getAddTwitterAccess(getter) {
    /* #swagger.ignore = true */
    return async (req, res, next) => {
      try {
        const data = getter(req);

        const {
          accountId,
          teamId,
        } = await twitterFeedsValidate.twitterBasicSchema.validateAsync(data);

        req.twitterAccount = await userTeamAccounts.getSocialAccount(
          TWITTER_CONSTANTS.ACCOUNT_TYPE,
          accountId,
          req.body.userScopeId,
          teamId,
        );

        return next();
      } catch (error) {
        return twitterFeedsFilter(res, error);
      }
    };
  }

  getAccountTokens(account) {
    const { access_token: token, refresh_token: secret } = account;

    return { token, secret };
  }
}

export default new FeedController();
