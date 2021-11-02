import db from '../Sequelize-cli/models/index.js';

const chatGroupMembers = db.chat_group_members;
const userDetails = db.user_details;

class MemberModel {
  create({ group_id, users_ids }, trx) {
    return chatGroupMembers.bulkCreate(users_ids.map((user_id) => {
      return {
        group_id,
        user_id,
      }
    }), {
      transaction: trx,
    })
  }

  getAllByGroupId({ group_id, skip: offset = 0, limit = 10 }) {
    return chatGroupMembers.findAll({
      attributes: [],
      include: [{
        model: userDetails,
        as: 'user',
      }],
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

  addMember(group_id, user_id) {
    return chatGroupMembers.create({
      group_id,
      user_id,
    });
  }

  removeMember(group_id, user_id) {
    return chatGroupMembers.destroy({
      where: {
        group_id,
        user_id,
      }
    });
  }

  getInfoByUserId(user_id) {
    return userDetails.findOne({
      where: {
        user_id,
      },
    })
  }
}

export default new MemberModel();
