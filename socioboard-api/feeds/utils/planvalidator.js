const { check, body } = require('express-validator/check');

class PlanValidation {
    isUserObtianedPermission(planName) {
        var validationQueries = [];
        switch (planName) {
            case "contentstudio":
                validationQueries.push(check("userScopeContentStudio", "Sorry, Don't have permission to access content studio as per your plan.")
                    .custom((value) => {
                        if (!value) {
                            throw new Error("Sorry, Don't have permission to access content studio as per your plan.");
                        } else {
                            return value;
                        }
                    }));
                break;
            case "discovery":
                validationQueries.push(check("userScopeDiscovery", "Sorry, Don't have permission to access discovery as per your plan.")
                    .custom((value) => {
                        if (!value) {
                            throw new Error("Sorry, Don't have permission to access discovery as per your plan.");
                        } else {
                            return value;
                        }
                    }));
                break;
            case "boardme":
                    validationQueries.push(check("userScopeBoardMe", "Sorry, Don't have permission to access BoardMe as per your plan.")
                    .custom((value) => {
                        if (!value) {
                            throw new Error("Sorry, Don't have permission to access BoardMe as per your plan.");
                        } else {
                            return value;
                        }
                    }));             
                break;
            case "rssfeeds":
                    validationQueries.push(check("userScopeRssFeeds", "Sorry, Don't have permission to access Rss feeds as per your plan.")
                    .custom((value) => {
                        if (!value) {
                            throw new Error("Sorry, Don't have permission to access Rss feeds as per your plan.");
                        } else {
                            return value;
                        }
                    }));              
                break;
            default:
                break;
        }
        return validationQueries;
    }
}


module.exports = new PlanValidation();
