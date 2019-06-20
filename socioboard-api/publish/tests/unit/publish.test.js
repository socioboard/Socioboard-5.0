const config = require('config');
const PublishLibs = require('../../core/publish/utils/publishlibs');
const unitTestLibs = require('../../../library/utility/unitTestLibs');
const logger = require('../../utils/logger');

expect.extend(unitTestLibs.expect);

beforeAll(() => {
    return unitTestLibs.initialize(config.get('mongo'));
});

describe('publishPost', () => {

    test('publishPost_ShouldReturnSuccess_DraftAPost', () => {
        const requestBody = {
            "postType": "Text",
            "message": "Lets check",
            "mediaPaths": [
                ""
            ],
            "link": "",
            "accountIds": [
                "6"
            ],
            "postStatus": 0,
            "pinBoards": [
                {
                    "accountId": 0,
                    "boardId": [
                        "string"
                    ]
                }
            ],
            "userScopeId": "1"
        };
        const publishLibs = new PublishLibs();
        return publishLibs.publishPost(requestBody, 5)
            .then((result) => {
                expect(result).toHaveProperty('message', 'Saved as draft');
            });
    });

    test('publishPost_ShouldReturnSuccess_TwitterTextPublishNow', () => {
        const requestBody = {
            "postType": "Text",
            "message": "Lets check text",
            "mediaPaths": [
                ""
            ],
            "link": "",
            "accountIds": [
                "6"
            ],
            "postStatus": 1,
            "pinBoards": [
                {
                    "accountId": 0,
                    "boardId": [
                        "string"
                    ]
                }
            ],
            "userScopeId": "1"
        };
        const publishLibs = new PublishLibs();
        return publishLibs.publishPost(requestBody, 5)
            .then((result) => {
                expect(result).toHaveProperty('message');
            });
    });

    test('publishPost_ShouldReturnSuccess_TwitterLinkPublishNow', () => {
        const requestBody = {
            "postType": "Link",
            "message": "Lets check links",
            "mediaPaths": [
                ""
            ],
            "link": "https://mongoosejs.com/docs/documents.html",
            "accountIds": [
                "6"
            ],
            "postStatus": 1,
            "pinBoards": [
                {
                    "accountId": 0,
                    "boardId": [
                        "string"
                    ]
                }
            ],
            "userScopeId": "1"
        };
        const publishLibs = new PublishLibs();
        return publishLibs.publishPost(requestBody, 5)
            .then((result) => {
                expect(result).toHaveProperty('message');
            });
    });

    test('publishPost_ShouldReturnError_InvalidPostStatus', () => {
        const requestBody = {
            "postType": "Text",
            "message": "Lets check",
            "mediaPaths": [
                ""
            ],
            "link": "",
            "accountIds": [
                "6"
            ],
            "postStatus": 2, // Invalid post status should be 0 -draft, 1-publish now
            "pinBoards": [
                {
                    "accountId": 0,
                    "boardId": [
                        "string"
                    ]
                }
            ],
            "userScopeId": "1"
        };
        const publishLibs = new PublishLibs();
        return publishLibs.publishPost(requestBody, 5)
            .catch((result) => {
                expect(result).toHaveProperty('message', 'Invalid post status!');
            });
    });

});

describe('getDraftedPosts', () => {

    test('getDraftedPosts_ShouldReturnSuccess_ValidInputs', () => {
        const publishLibs = new PublishLibs();
        return publishLibs.getDraftedPosts(1, 5, 1)
            .then((result) => {
                expect(result).toBeArray();
            });
    });

    test('getDraftedPosts_ShouldReturnError_InvalidUserId', () => {
        const publishLibs = new PublishLibs();
        return publishLibs.getDraftedPosts(999999, 5, 1)
            .then((result) => {
                expect(result).toBeArray();
            });
    });

    test('getDraftedPosts_ShouldReturnError_NullUserId', () => {
        const publishLibs = new PublishLibs();
        return publishLibs.getDraftedPosts(null, 5, 1)
            .catch((result) => {
                expect(result).toHaveProperty("message", "Invalid Inputs");
            });
    });

});