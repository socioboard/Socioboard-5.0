import mongoose from 'mongoose';
const Schema = mongoose.Schema;

mongoose.set('useCreateIndex', true);

const teamInsights = new Schema({
    // accountId: { type: Number, index: true },
    teamId: { type: Number, index: true },
    insights: {
        type: [{
            teamName: { type: String },
            teamLogo: { type: String },
            teamMembersCount: { type: Number, default: 0 },
            invitedList: { type: Number, default: 0 },
            leftTeamMem: { type: Number, default: 0 },
            socialProfilesCount: { type: Number, default: 0 },
            publishCount: { type: Number, default: 0 },
            SocialAccountStats: {
                type:
                    [{
                        facebookStats: {
                            type: [{
                                facebookStats: {
                                    account_id: { type: Number },
                                    friendship_count: { type: Number },
                                    page_count: { type: Number },
                                },
                            }]
                        },
                        twitterStats: {
                            type: [{
                                twitterStats: {
                                    account_id: { type: Number },
                                    follower_count: { type: Number },
                                    following_count: { type: Number },
                                    total_like_count: { type: Number },
                                    total_post_count: { type: Number },
                                },
                            }]
                        },
                        instagramStats: {
                            type: [{
                                instagramStats: {
                                    account_id: { type: Number },
                                    friendship_count: { type: Number },
                                    follower_count: { type: Number },
                                    following_count: { type: Number },
                                    total_post_count: { type: Number },
                                },
                            }]
                        },
                        youtubeStats: {
                            type: [{
                                youtubeStats: {
                                    account_id: { type: Number },
                                    subscription_count: { type: Number },
                                    total_post_count: { type: Number },
                                },
                            }]
                        },
                    }],
            },
            date: { type: Date, default: Date.now }
        }]
    }
});

teamInsights.methods.insertInsights = function (datas) {
    return this.model('TeamInsights')
        .bulkWrite(datas.map((data) => {
            return {
                updateOne: {
                    filter: { teamId: data.teamId },
                    update: data,
                    upsert: true,
                },
            };
        }))
        .catch((error) => {
            console.log(error.message);
            return 0;
        });
};



teamInsights.methods.insertInsightsold = function (data) {
    return this.model('TeamInsights')
        .insertMany(data)
        .then((result) => {
            return result.length;
        }).catch((error) => {
            throw error;
        });
};

teamInsights.methods.addTeamInsights = function (teamId, insightData) {
    var query = {
        teamId: teamId
    };
    var updateObject = { $push: { insights: insightData } };
    return this.model('TeamInsights')
        .findOneAndUpdate(query, updateObject)
        .then(function (result) {
            return result;
        })
        .catch(function (error) {
            throw error;
        });
};

teamInsights.methods.getInsights = function (teamId, since, untill) {
    var query = {
        teamId: teamId,
    };
    return this.model('TeamInsights')
        .find(query)
        .then(function (result) {
            if (result && result[0] && result[0].insights.length > 0) {
                var filteredInsights = result[0].insights.filter(element => {
                    return element.date >= since && element.date <= untill;
                });
                return filteredInsights;
            }
            else
                return [];
        })
        .catch(function (error) {
            throw error;
        });
};

const TwitterInsightsModel = mongoose.model('TeamInsights', teamInsights);

export default TwitterInsightsModel;