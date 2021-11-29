import { Sequelize } from 'sequelize';
import db from '../Sequelize-cli/models/index.js';

const chatGroupMessages = db.chat_group_messages;
const chatGroupMembers = db.chat_group_members;
const chatGroups = db.chat_groups;

class MessageModel {
  create(body) {
    return chatGroupMessages.create(body);
  }

  getAllByGroupId(group_id, currentUserId, { limit = 10, skip: offset = 0 } = {}) {
    return chatGroupMessages.findAll({
      include: [{
        attributes: [['profile_picture', 'avatar'],
          [db.sequelize.literal(`IF(user_id = ${currentUserId}, 'You', CONCAT(first_name, ' ', last_name))`), 'full_name'],
        ],
        model: db.user_details,
        as: 'user',
        required: false,
      }],
      where: {
        group_id,
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      limit,
      offset,
    });
  }

  readMessage(messages_ids) {
    return chatGroupMessages.update({
      read_at: new Date(),
    }, {
      where: {
        id: messages_ids,
      },
    });
  }

  async getUnreadCount(team_id, user_id) {
    const unreadMessages = await chatGroupMembers.findAll({
      include: [{
        model: chatGroups,
        as: 'group',
        include: [{
          model: chatGroupMessages,
          where: {
            group_id: { [Sequelize.Op.col]: 'chat_group_members.group_id' },
            read_at: null,
          },
        }],
        where: {
          id: { [Sequelize.Op.col]: 'chat_group_members.group_id' },
          team_id,
        },
      }],
      where: {
        user_id,
      },
      subQuery: true,
      raw: true,
    });

    return { unreadMessages: unreadMessages.length };
  }

  getAllByMessagesIdsAndUserId(userId, messageIds) {
    return chatGroupMessages.findAll({
      where: {
        sender_id: userId,
        id: messageIds,
      },
      raw: true,
    });
  }

  getMessageById(messageId) {
    return chatGroupMessages.findOne({
      where: {
        id: messageId,
      },
      raw: true,
    });
  }

  deleteMessages(messageIds, trx) {
    return chatGroupMessages.destroy({
      where: {
        id: messageIds,
      },
      transaction: trx,
    });
  }

  updateMessage(messageId, message) {
    return chatGroupMessages.update({
      ...message,
      is_edited: true,
      updated_at: new Date(),
    }, {
      where: {
        id: messageId,
      },
    });
  }
}

export default new MessageModel();
