import RecentVisitedModel from '../../Common/Mongoose/models/recentvisited.js'
const recentVisitedModel = new RecentVisitedModel()
import moment from 'moment'
import { phproutes } from '../../Common/Shared/recent.visited.shared.js'


export default (request, response, next) => {
    /*#swagger.ignore = true*/
    const requestStart = Date.now();
    var oldWrite = response.write,
        oldEnd = response.end;
    var chunks = [];
    var body;
    response.write = function (chunk) {
        chunks.push(chunk);
        return oldWrite.apply(response, arguments);
    };
    response.end = function (chunk) {
        if (chunk)
            chunks.push(chunk);
        body = Buffer.concat(chunks).toString('utf8');
        oldEnd.apply(response, arguments);
    };
    let requestErrorMessage = null;
    const getError = error => {
        requestErrorMessage = error.message;
    };
    request.on("error", getError);
    const logClose = () => {
        removeHandlers();
        log(request, response, "Client aborted.");
    };
    const logError = error => {
        removeHandlers();
        log(request, response, error.message);
    };
    const logFinish = () => {
        removeHandlers();
        log(request, response, requestErrorMessage);
    };
    response.on("close", logClose);
    response.on("error", logError);
    response.on("finish", logFinish);
    const removeHandlers = () => {
        //  request.off("data", getChunk);
        // request.off("end", assembleBody);
        request.off("error", getError);
        response.off("close", logClose);
        response.off("error", logError);
        response.off("finish", logFinish);
    };
    const log = (request, response, errorMessage) => {
        try {
            const { rawHeaders, httpVersion, method, socket, url } = request;
            const { remoteAddress, remoteFamily } = socket;
            const { statusCode, statusMessage } = response;
            const headers = response.getHeaders();
            const userId = request.body.userScopeId

            if (body) {
                body = JSON.parse(body);
            }
            let post;
            let posts = [];

            if (userId) {
                let category = request.baseUrl.replace('/v1/', '') || ''
                let nodeUrl = url.split('/')
                nodeUrl = nodeUrl[1].split('?')
                let subcategory = phproutes[category]?.find(x => x.nodeapi === nodeUrl[0]).subcategory || ''
                let phproute = phproutes[category]?.find(x => x.nodeapi === nodeUrl[0]).phproutes || ''
                const { requestParams,
                    requestQuery,
                    requestBody } = requestParameters(request.params, request.query, request.body)
                // if (response.statusCode == !304) //no changes in response
                if (subcategory !== '') {
                    post = {
                        createdTime: moment.now(),
                        processingTime: Date.now() - requestStart,
                        action: url || '',
                        subcategory,
                        phproute,
                        category,
                        userId,
                        code: body.code || 200,
                        requestParams,
                        requestQuery,
                        requestBody,
                        message: body.message || 'Success',
                        error: body.error || '',
                        method,
                    }
                    posts.push(post)
                    recentVisitedModel.insertManyPosts(posts)
                }
            }

        } catch (error) {
        }

    };

    const requestParameters = (requestParams, requestQuery, requestBody) => {
        delete requestQuery.userScopeName
        delete requestBody.userScopeId
        delete requestBody.userScopeEmail
        delete requestBody.userScopeName
        delete requestBody.userScopeMaxAccountCount
        delete requestBody.userScopeMaxMemberCount
        delete requestBody.userScopeAvailableNetworks
        delete requestBody.userScopeMaxScheduleCount
        delete requestBody.userScopeIsAdmin
        delete requestBody.userScopeCustomReport
        delete requestBody.userScopeTeamReport
        delete requestBody.userScopeBoardMe
        delete requestBody.userScopeShareLibrary
        delete requestBody.userScopeContentStudio
        delete requestBody.userScopeDiscovery
        delete requestBody.userScopeRssFeeds
        delete requestBody.language
        return { requestParams, requestQuery, requestBody }
    }

    next()
};


