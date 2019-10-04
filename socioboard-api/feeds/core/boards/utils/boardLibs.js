const db = require('../../../../library/sequelize-cli/models/index');
const UserTeamAccount = require('../../../../library/mixins/userteamaccount');
const boards = db.boards;

class BoardLibs {

    constructor() {
        Object.assign(this, UserTeamAccount);
    }

    create(userId, teamId, boardName, keyword) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !boardName || !keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that whether user is belongs to that Team or not
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        // Checking that the Board is already exists or not by name
                        return boards.findOne({
                            where: {
                                board_name: boardName,
                                user_id: userId,
                                team_id: teamId
                            }
                        });
                    })
                    .then((boardDetails) => {
                        if (boardDetails) {
                            throw new Error("Sorry! You have already create board with same name on current team!");
                        } else {
                            // Creating Board in boards DB
                            return boards.create({
                                board_name: boardName,
                                keyword: keyword,
                                user_id: userId,
                                team_id: teamId
                            });
                        }
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    getAllBoards(userId, teamId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that whether user is belongs to that Team or not
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        // Fetching all Boards
                        return boards.findAll({
                            where: {
                                user_id: userId,
                                team_id: teamId
                            }
                        });
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    update(userId, teamId, keyword, boardId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !keyword) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that whether user is belongs to that Team or not
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        // Updating the existed Board keyword
                        return boards.update({
                            keyword: keyword
                        },
                            {
                                where: {
                                    user_id: userId,
                                    team_id: teamId,
                                    id: boardId
                                }
                            });
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }

        });
    }

    delete(userId, teamId, boardId) {
        return new Promise((resolve, reject) => {
            if (!userId || !teamId || !boardId) {
                reject(new Error("Invalid Inputs"));
            } else {
                // Checking that whether user is belongs to that Team or not
                return this.isTeamValidForUser(userId, teamId)
                    .then(() => {
                        // Deleting the Board
                        return boards.destroy({
                            where: {
                                user_id: userId,
                                team_id: teamId,
                                id: boardId
                            }
                        });
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
}


module.exports = new BoardLibs();