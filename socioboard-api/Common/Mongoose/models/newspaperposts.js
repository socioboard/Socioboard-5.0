const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

mongoose.set('useCreateIndex', true);

const newsPaperPost = new Schema({
    adminId: { type: Number },
    logo: { type: String, default: 'https://app.ems.globusdemos.com/logo.png' },
    title: { type: String },
    snippet: { type: String },
    description: { type: String },
    author: { type: String },
    mediaImages: { type: String },
    mediaUrl: { type: String },
    publishedDate: { type: Date, default: Date.now },
    tags: [{ type: String }],
    matchedKeywords: [{ type: String }],
    mainUrl: { type: String },
    mainSiteTitle: { type: String },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
});

// Done
newsPaperPost.methods.insertManyArticles = function (posts) {
    return this.model('NewsPaperPosts')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails;
        })
        .catch((error) => {
            console.log('error in mongo: ', error);
            return 0;
        });
};

// Done
newsPaperPost.methods.deleteArticle = function (articleId) {
    return this.model('NewsPaperPosts')
        .findByIdAndDelete(articleId).then(response => response).catch(error => error);
}

// Partially done, need to check for AND
newsPaperPost.methods.getNewsPaperArticles = function (urls = [], tags = [], author = '', startDate, endDate, skip = 0, limit = 50) {
    return new Promise((resolve, reject) => {
        let condtion = [{ $or: [{ author: author }, { author: { $ne: '' } }] }];
        if (author != '') condtion = [{ author: author }];
        if (tags.length > 0) condtion = [{ tags: { $all: tags } }];
        if (urls.length > 0) condtion = [{ mainUrl: { $in: urls } }];

        if (author != '' && urls.length > 0) condtion = [{ mainUrl: { $in: urls } }, { author: author }];
        if (author != '' && tags.length > 0) condtion = [{ tags: { $all: tags } }, { author: author }];

        if (tags.length > 0 && urls.length > 0) condtion = [{ mainUrl: { $in: urls } }, { tags: { $all: tags } }];
        if (tags.length > 0 && author != '') condtion = [{ tags: { $all: tags } }, { author: author }];

        if (author != '' && urls.length > 0 && tags.length > 0) condtion = [{ mainUrl: { $in: urls } }, { tags: { $all: tags } }, { author: author }];

        const convertedStartDate = moment(startDate).toDate();
        const convertedendDate = moment(endDate).toDate();
        return this.model('NewsPaperPosts')
            .find({
                $and: condtion, publishedDate: {
                    $gte: convertedStartDate,
                    $lte: convertedendDate
                }
            }).limit(Number(limit)).skip(Number(skip)).then(response => resolve(response)).catch(error => reject(error));
    });
}

// Done - if need modification then have to Make it.
newsPaperPost.methods.getNewsPaperStats = function (adminId, urls = [], tags = [], startDate, endDate) {
    return new Promise((resolve, reject) => {

        const convertedStartDate = moment(startDate).toDate();
        const convertedendDate = moment(endDate).toDate();
        
        let condtion = {
            publishedDate: {
                $gte: convertedStartDate,
                $lte: convertedendDate
            }, adminId : adminId
        };
        if (tags.length > 0) condtion = {
            publishedDate: {
                $gte: convertedStartDate,
                $lte: convertedendDate
            }, adminId : adminId,
            tags: { $all: tags }
        }
        if (urls.length > 0) condtion = {
            publishedDate: {
                $gte: convertedStartDate,
                $lte: convertedendDate
            }, adminId : adminId,
            mainUrl: { in: urls }
        }

        if (urls.length > 0 && tags.length > 0) condtion = {
            publishedDate: {
                $gte: convertedStartDate,
                $lte: convertedendDate
            }, adminId : adminId,
            tags: { $all: tags },
            mainUrl: { in: urls }
        }

        return this.model('NewsPaperPosts')
            .aggregate([
                {
                    "$match": condtion
                }, {
                    $group: {
                        _id: '$publishedDate', stats: {
                            $push: {
                                tags: '$tags',
                                matchedKeywords: '$matchedKeywords',
                                _id: '$_id'
                            }
                        }
                    }
                },
                { $project: { publishedDate: '$_id', stats: 1, _id: 0 } }
            ]).then(response => {
                resolve(response);
            }).catch(error => {
                console.log('Errro in Agg: ', error);
            })
    });
}

// Done
newsPaperPost.methods.addTagsToAnArticle = function (articleId, tags) {
    return new Promise((resolve, reject) => {
        return this.model('NewsPaperPosts')
            .findOneAndUpdate(
                { _id: String(articleId) },
                { $push: { tags: { $each: tags } } }
            ).then(response => resolve(response)).catch(error => reject(error));
    });
}

// Done
newsPaperPost.methods.deleteTagsFromAnArticle = function (articleId, tags) {
    return new Promise((resolve, reject) => {
        return this.model('NewsPaperPosts')
            .findOneAndUpdate(
                { _id: String(articleId) },
                { $pullAll: { tags: tags } }
            ).then(response => resolve(response)).catch(error => reject(error));
    });
}


// Done
newsPaperPost.methods.getAuthors = function (adminId) {
    console.log('authors for: ', adminId);
    return new Promise((resolve, reject) => {
        return this.model('NewsPaperPosts')
            .find({
                adminId: adminId,
                author: { $ne: null }, author: { $ne: '' }
            }, { author: 1, _id: 1 }
            ).then(response => resolve(response)).catch(error => reject(error));
    });
}

// Done
newsPaperPost.methods.getAllRSSTags = function (adminId) {
    console.log('authors for: ', adminId);
    return new Promise((resolve, reject) => {
        return this.model('NewsPaperPosts').find({
            tags: { $exists: true, $ne: [] },
            adminId: adminId
        }, { tags: 1 }).then(response => resolve(response)).catch(error => reject(error));
    });
}


newsPaperPost.methods.getCountOfNewsPapersArticles = function (adminId) {
    return new Promise((resolve, reject) => {
        return this.model('NewsPaperPosts')

            .aggregate([
                { "$match": { adminId: adminId } },
                { "$group": { _id: "$mainSiteTitle", count: { $sum: 1 } } }
            ])
            
            .then(response => resolve(response)).catch(error => reject(error));
    });
}

const newsPaperPosts = mongoose.model('NewsPaperPosts', newsPaperPost);

module.exports = newsPaperPosts;
