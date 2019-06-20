const TrendsUtils = require('../../core/trends/utils/trendslibs');
const trendslibs = new TrendsUtils();
const config = require('config');
const unitTestLibs = require('../../../library/utility/unitTestLibs');
const MongoConnect = require('../../../library/mongoose/connect');
expect.extend(unitTestLibs.expect);

const keyword = "cricket";
const pageId = 1;

beforeAll(() => {
    var mongoConnect = new MongoConnect();
    mongoConnect.mongoConfiguration = config.get('mongo');
    return mongoConnect.initialize();
});


describe('makeDownloadSchedule', () => {
    test('makeDownloadSchedule_ShouldReturnError_NullInputs', () => {
        return trendslibs.makeDownloadSchedule(null, null)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

    test('makeDownloadSchedule_ShouldReturnError_InvalidModuleName', () => {
        return trendslibs.makeDownloadSchedule("twitter", 12345685)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid module name!');
            });
    });
});

describe('getGiphy', () => {

    test('getGiphy_ShouldReturnSuccess_ValidInputs', () => {
        const result = trendslibs.getGiphy(keyword, pageId);
        expect(result).resolves.toBeObject();
    });

    // invalid api key
    test.skip('getGiphy_ShouldReturnError_InvalidApiKey', () => {
        const error = trendslibs.getGiphy(keyword, pageId);
        expect(error).rejects.toHaveProperty('message', 'Invalid authentication credentials');
    });

    test('getGiphy_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getGiphy('', pageId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getNewsApi', () => {

    test('getNewsApi_ShouldReturnSuccess_ValidInputs', () => {
        return trendslibs.getNewsApi(keyword, pageId)
            .then((result) => {
                expect(result).toBeObject();
            });

    });

    //  works even wrong key also
    test.skip('getNewsApi_ShouldReturnError_InvalidApiKey', () => {
        const error = trendslibs.getNewsApi(keyword, '');
        expect(error).rejects.toHaveProperty('message', 'Invalid Inputs');
    });

    test('getNewsApi_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getNewsApi('', '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});


describe('getPixabay', () => {

    test('getPixabay_ShouldReturnSuccess_ValidInputs', () => {
        const result = trendslibs.getPixabay(keyword, pageId);
        expect(result).resolves.toBeObject();
    });

    // this is giving error of invalid key but failing condition.
    test.skip('getPixabay_ShouldReturnError_InvalidApiKey', () => {
        const error = trendslibs.getPixabay(keyword, pageId);
        expect(error).rejects.toHaveProperty('message', "[ERROR 400] Invalid API key. Note: This value is case-sensitive");
    });

    test('getPixabay_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getPixabay(keyword, '')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getFlickr', () => {

    test('getFlickr_ShouldReturnSuccess_ValidInputs', () => {
        const result = trendslibs.getFlickr(keyword, pageId);
        expect(result).resolves.toBeObject();
    });

    test.skip('getFlickr_ShouldReturnError_InvalidApiKey', () => {
        const error = trendslibs.getFlickr(keyword, pageId);
        expect(error).rejects.toHaveProperty('message', 'Invalid API Key (Key has invalid format)');
    });

    test('getFlickr_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getFlickr('', pageId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getDailyMotion', () => {

    test('getDailyMotion_ShouldReturnSuccess_ValidInputs', () => {
        return trendslibs.getDailyMotion(pageId)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('getDailyMotion_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getDailyMotion('')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getImgur', () => {

    test('getImgur_ShouldReturnSuccess_ValidInputs', () => {
        const result = trendslibs.getImgur(keyword, pageId);
        expect(result).resolves.toBeObject();
    });

    test.skip('getImgur_ShouldReturnError_InvalidApiKey', () => {
        const error = trendslibs.getImgur(keyword, pageId);
        expect(error).rejectsk.toHaveProperty('message', 'Invalid Api key');

    });

    test('getImgur_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getImgur('', pageId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getRssFeeds', () => {

    test('getRssFeeds_ShouldReturnSuccess_ValidInputs', () => {
        const result = trendslibs.getRssFeeds('http://feeds.feedburner.com/ndtvnews-top-stories');
        expect(result).resolves.toBeObject();
    });

    test('getRssFeeds_ShouldReturnError_InvalidInputs', () => {
        const error = trendslibs.getRssFeeds('http://feeds.feedburner.com/');
        expect(error).rejects.toHaveProperty('message');
    });

    test('getRssFeeds_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getRssFeeds('')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getYoutube', () => {

    test('getYoutube_ShouldReturnSuccess_ValidInputs', () => {
        const result = trendslibs.getYoutube(keyword, pageId);
        expect(result).resolves.toBeObject();

    });

    test.skip('getYoutube_ShouldReturnError_InvalidApiKey', () => {
        const error = trendslibs.getYoutube(keyword, pageId);
        expect(error).rejects.toHaveProperty('message', 'Invalid authorization (Invalid Key)');
    });

    test('getYoutube_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getYoutube('', pageId)
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

//  all down are working properly.
describe('getCurrentTrends', () => {

    test('getCurrentTrends_ShouldReturnSuccess_ValidInputs(V3)', () => {
        const result = trendslibs.getCurrentTrends('IND');
        expect(result).resolves.toBeArray();
    });

    test('getCurrentTrends_ShouldReturnSuccess_ValidInputs(V2)', () => {
        return trendslibs.getCurrentTrends('IN')
            .then((result) => {
                expect(result).toBeArray();
            });
    });

    test('getCurrentTrends_ShouldReturnError_InvalidInputs', () => {
        return trendslibs.getCurrentTrends("GNDSG")
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getCurrentTrends_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getCurrentTrends("")
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});

describe('getTwitter', () => {

    test('getTwitter_ShouldReturnSuccess_ValidInputs', () => {
        return trendslibs.getTwitter(keyword)
            .then((result) => {
                expect(result).toBeObject();
            });
    });

    test('getTwitter_ShouldReturnSuccess_InvalidInputs', () => {
        return trendslibs.getTwitter('%d%d3C')
            .catch((error) => {
                expect(error).toHaveProperty('message');
            });
    });

    test('getTwitter_ShouldReturnError_MissingInputs', () => {
        return trendslibs.getTwitter('')
            .catch((error) => {
                expect(error).toHaveProperty('message', 'Invalid Inputs');
            });
    });

});