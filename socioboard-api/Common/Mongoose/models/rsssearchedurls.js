import mongoose from 'mongoose';
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const rsssearchedurls = new Schema({
    title: { type: String },
    description: { type: String },
    rssUrl: { type: String },
    userId: { type: String },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
    isBookMarked: { type: Boolean, default: false }
});

rsssearchedurls.methods.insertMultiPosts = function (posts) {
    return this.model('RssSearchedUrls')
        .insertMany(posts)
        .then((postdetails) => {
            return postdetails.length;
        })
        .catch((error) => {
            console.log(error.message);
            return 0;
        });
};

rsssearchedurls.methods.insertManyPosts = function (posts, userId) {
    return this.model('RssSearchedUrls')
        .bulkWrite(posts.map((post) => {
            return {
                updateOne: {
                    filter: { rssUrl: post.rssUrl, userId },
                    update: post,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            console.log(error.message);
            return 0;
        });
};
rsssearchedurls.methods.updateTitle = function (post, userId, title) {
    return this.model('RssSearchedUrls').update({ title: { $exists: false }, userId, rssUrl: post.rssUrl }, { $set: { title } })
        .then(() => { return '' })
        .catch((error) => {
            console.log(error.message);
            return 0;
        });
};


rsssearchedurls.methods.FindInsertOrUpdate = function (post) {
    var query = { id: post.id };
    var options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return this.model('RssSearchedUrls')
        .findOneAndUpdate(query, post, options)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error.message);
        });
};

rsssearchedurls.methods.getPreviousPost = function (userId, skip, limit) {
    var query = {
        userId
    }
    return this.model('RssSearchedUrls')
        .find(query)
        .sort({ updatedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

rsssearchedurls.methods.getBookMarkedPost = function (userId, skip = 0, limit = 0) {
    var query = {
        userId,
        isBookMarked: true
    }
    return this.model('RssSearchedUrls')
        .find(query)
        .sort({ updatedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

rsssearchedurls.methods.getSocialAccountPosts = function (channelId, skip, limit) {
    var query = { channelId: new RegExp(channelId, 'i') };
    return this.model('YoutubePosts')
        .find(query)
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

rsssearchedurls.methods.deleteAccountPosts = function (accountId) {
    var query = {
        channelId: new RegExp(accountId, 'i')
    };
    return this.model('YoutubePosts')
        .deleteMany(query)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

rsssearchedurls.methods.updateIsLike = function (data) {
    var query = { videoId: new RegExp(data.videoId, 'i') };
    var update = { $set: { isLiked: data.rating } };
    return this.model('YoutubePosts')
        .findOneAndUpdate(query, update)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            return error;
        });
};

rsssearchedurls.methods.bookmarkUrl = function (userId, _id, isBookMarked) {
    var query = { userId, _id };
    var update = { $set: { isBookMarked } };
    return this.model('RssSearchedUrls')
        .findOneAndUpdate(query, update, { new: true })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            return error;
        });
};

rsssearchedurls.methods.updateRssUrls = function (userId, _id, body) {
    var query = { userId, _id };
    var update = { $set: { isBookMarked: body.isBookMarked, title: body.title, description: body.description, rssUrl: body.rssUrl, isBookMarked: body.isBookMarked } };
    return this.model('RssSearchedUrls')
        .findOneAndUpdate(query, update, { new: true })
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            return error;
        });
};

rsssearchedurls.methods.clearRssUrls = function (userId) {
    var query = {
        userId
    };
    return this.model('RssSearchedUrls')
        .deleteMany(query)
        .then(function (result) {
            return "Rss Url cleared succesfully";
        })
        .catch(function (error) {
            console.log(error);
        });
};

rsssearchedurls.methods.deleteRssUrls = function (userId, _id) {
    var query = { userId, _id };

    return this.model('RssSearchedUrls')
        .findOneAndDelete(query)
        .then(function (result) {
            if (!result)
                return "No Rss Url found"
            else
                return "Deleted Rss Url succesfully";
        })
        .catch(function (error) {
            throw new Error(error);
        });
};

const RssSearchedUrlsModel = mongoose.model('RssSearchedUrls', rsssearchedurls);

export default RssSearchedUrlsModel;
