import db from '../Sequelize-cli/models/index.js';

const { boards } = db;
const userTeamJoinTable = db.join_table_users_teams;

class BoardsModels {
  create(userId, teamId, boardName, keyword) {
    return new Promise((resolve, reject) => this.isTeamValidForUser(userId, teamId)
      .then(() => boards.findOne({
        where: {
          board_name: boardName,
          user_id: userId,
          team_id: teamId,
        },
      }))
      .then((boardDetails) => {
        if (boardDetails) {
          throw new Error('Sorry! You have already create board with same name on current team!');
        } else {
          return boards.create({
            board_name: boardName,
            keyword,
            user_id: userId,
            team_id: teamId,
          });
        }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      }));
  }

  getAllBoards(userId, teamId) {
    return new Promise((resolve, reject) => {
      if (!userId || !teamId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamValidForUser(userId, teamId)
          .then(() => boards.findAll({
            where: {
              user_id: userId,
              team_id: teamId,
            },
          }))
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
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamValidForUser(userId, teamId)
          .then(() => boards.update({
            keyword,
          },
          {
            where: {
              user_id: userId,
              team_id: teamId,
              id: boardId,
            },
          }))
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
        reject(new Error('Invalid Inputs'));
      } else {
        return this.isTeamValidForUser(userId, teamId)
          .then(() => boards.destroy({
            where: {
              user_id: userId,
              team_id: teamId,
              id: boardId,
            },
          }))
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  isTeamValidForUser(userId, teamId) {
    return new Promise((resolve, reject) => userTeamJoinTable.findOne({
      where: {
        user_id: userId,
        team_id: teamId,
        left_from_team: false,
      },
      attributes: ['id', 'user_id'],
    })
      .then((result) => {
        if (result) resolve();
        else throw new Error('User not belongs to the team!');
      })
      .catch((error) => {
        reject(error);
      }));
  }
}

export default BoardsModels;
