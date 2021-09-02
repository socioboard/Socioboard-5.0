import logger from '../../resources/Log/logger.log.js';

export default (io) => {
  const helper = {};

  helper.handleSocket = function (socket) {
    logger.info('A User is Subscribed.');
    socket.on('subscribe', (details) => {
      try {
        logger.info(`User Id : ${JSON.stringify(details)}`);
        socket.join(details.userId);
        details.teamIds.forEach((teamId) => {
          socket.join(teamId);
          logger.info(`User Joined on ${teamId} team.`);
        });
      } catch (error) {
        logger.info(error.message);
        logger.info('User cant able to join.');
      }
    });

    socket.on('teamAdding', (newTeamId) => {
      try {
        socket.join(newTeamId);
        logger.info(`User joined on ${newTeamId} team.`);
      } catch (error) {
        logger.info(`User cant able to join on ${details.oldTeamId} team.`);
      }
    });

    socket.on('teamRemove', (oldTeamId) => {
      try {
        socket.leave(oldTeamId);
        logger.info(`User left on ${oldTeamId}.`);
      } catch (error) {
        logger.info(`User cant able to left from ${details.oldTeamId}.`);
      }
    });

    socket.on('disconnect', (details) => {
      try {
        socket.leave(details.userId);
        const teamDetails = JSON.parse(details.teamIds);

        teamDetails.forEach((teamId) => {
          socket.leave(teamId);
          logger.info(`Socket disconnect on ${teamId} team.`);
        });
        logger.info('User disconnected.');
      } catch (error) {
        logger.info('User cant able to disconnect.');
      }
    });
  };

  return helper;
};
