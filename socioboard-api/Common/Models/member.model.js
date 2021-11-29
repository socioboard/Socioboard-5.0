import db from '../Sequelize-cli/models/index.js';

const chatGroupMembers = db.chat_group_members;
const userDetails = db.user_details;

class MemberModel {
  create({group_id, users_ids}, trx) {
    return chatGroupMembers.bulkCreate(
      users_ids.map(user_id => {
        return {
          group_id,
          user_id,
        };
      }),
      {
        transaction: trx,
      }
    );
  }

  getAllByGroupId({group_id, skip: offset = 0, limit = 10}) {
    return chatGroupMembers.findAll({
      attributes: [],
      include: [
        {
          model: userDetails,
          as: 'user',
        },
      ],
      where: {
        group_id,
      },
      offset,
      limit,
      raw: true,
      nest: true,
    });
  }

  getOneByGroupAndUserIds(group_id, user_id) {
    return chatGroupMembers.findOne({
      where: {
        group_id,
        user_id,
      },
    });
  }

  getManyUsersInGroup(group_id, user_ids) {
    return chatGroupMembers.findAll({
      where: {
        group_id,
        user_id: user_ids,
      },
    });
  }

  addMember(group_id, user_id) {
    return chatGroupMembers.create({
      group_id,
      user_id,
    });
  }

  addBulkMembers(group_id, user_ids) {
    return chatGroupMembers.bulkCreate(
      user_ids.map(user_id => ({
        group_id,
        user_id,
      }))
    );
  }

  removeMember(group_id, user_id) {
    return chatGroupMembers.destroy({
      where: {
        group_id,
        user_id,
      },
    });
  }

  getInfoByUserId(user_id) {
    return userDetails.findOne({
      where: {
        user_id,
      },
    });
  }

  getManyInfosByUserIds(user_ids) {
    return userDetails.findAll({
      where: {
        user_id: user_ids,
      },
    });
  }
}

export default new MemberModel();
