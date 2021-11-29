import {Sequelize} from 'sequelize';
import db from '../Sequelize-cli/models/index.js';

const {Op: Operator} = Sequelize;

const chatGroups = db.chat_groups;
const chatGroupMembers = db.chat_group_members;

class GroupModel {
  async getAll(team_id, user_id, {limit, skip}) {
    const rows = await chatGroupMembers.findAll({
      include: [
        {
          model: chatGroups,
          as: 'group',
          include: [
            {
              model: chatGroupMembers,
              include: [{model: db.user_details, as: 'user'}],
              where: {
                group_id: {[Operator.col]: 'chat_group_members.group_id'},
              },
            },
          ],
          where: {
            id: {[Operator.col]: 'chat_group_members.group_id'},
            team_id,
          },
        },
      ],
      where: {
        user_id,
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      limit,
      offset: skip,
      subQuery: true,
    });

    return rows.map(row => row.group);
  }

  getAllByUsersIds(team_id, users_ids) {
    return chatGroups.findAll({
      attributes: [
        'id',
        'name',
        [
          Sequelize.fn('COUNT', Sequelize.col('chat_group_members.user_id')),
          'membersCount',
        ],
      ],
      include: [
        {
          model: chatGroupMembers,
          attributes: [],
          where: {
            group_id: {[Operator.col]: 'chat_groups.id'},
            user_id: users_ids,
          },
        },
      ],
      where: {
        team_id,
      },
      group: ['chat_groups.id'],
      subQuery: false,
      raw: true,
    });
  }

  getById(team_id, id) {
    return chatGroups.findOne({
      where: {
        id,
        team_id,
      },
      raw: true,
      nest: true,
    });
  }

  create(group, trx) {
    return chatGroups.create(group, {
      transaction: trx,
    });
  }

  isUserInTeam(team_id, user_id) {
    return db.join_table_users_teams.findOne({
      where: {
        [Operator.and]: [
          {
            team_id,
          },
          {
            user_id,
          },
        ],
      },
    });
  }

  getTeamMembers(team_id, {limit, skip: offset}) {
    return db.join_table_users_teams.findAll({
      include: [
        {
          model: db.user_details,
          where: {
            user_id: {[Operator.col]: 'join_table_users_teams.user_id'},
          },
        },
      ],
      where: {
        team_id,
      },
      limit,
      offset,
    });
  }

  getTeamMembersByUsersIds(team_id, ids) {
    return db.join_table_users_teams.findAll({
      where: {
        team_id,
        user_id: ids,
      },
      raw: true,
    });
  }

  getUserByTeamAndUserIds(team_id, user_id) {
    return db.join_table_users_teams.findOne({
      where: {
        team_id,
        user_id,
      },
    });
  }

  getManyUsersByTeamAndUserIds(team_id, user_ids) {
    return db.join_table_users_teams.findAll({
      where: {
        team_id,
        user_id: user_ids,
      },
    });
  }

  changeAdmin(group_id, user_id) {
    return chatGroups.update(
      {
        admin_id: user_id,
      },
      {
        where: {
          id: group_id,
        },
      }
    );
  }

  updateGroup(groupId, group) {
    return chatGroups.update(
      {
        ...group,
        updatedAt: new Date(),
      },
      {
        where: {
          id: groupId,
        },
      }
    );
  }

  deleteGroup(groupId, trx) {
    return chatGroups.destroy({
      where: {
        id: groupId,
      },
      transaction: trx,
    });
  }
}

export default new GroupModel();
