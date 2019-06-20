const logger = require('../../utils/logger');


module.exports = (io) => {
    var helper = {};
    helper.handleSocket = function handleSocket(socket) {
        socket.on('subscribe', (details) => {
            try {
                logger.info(`User Id : ${JSON.stringify(details)}`);
                socket.join(details.userId);

                var teamDetails = JSON.parse(details.teamIds);
                teamDetails.forEach(teamId => {
                    socket.join(teamId);
                    logger.info(`User Joined on ${teamId}.`);
                });
            } catch (error) {
                logger.info(error.message);
                logger.info(`User cant able to join.`);
            }
        });
        socket.on('teamUnsubscribe', function (teamId) {
            try {
                socket.leave(teamId);
                logger.info(`User left from ${teamId}.`);
            } catch (error) {
                logger.info(`User cant able to left from ${teamId}.`);
            }
        });
        socket.on('disconnect', () => {
            try {
                socket.leave(userId);
                logger.info("User disconnected.");
            } catch (error) {
                logger.info(`User cant able to disconnect.`);
            }
        });
    };
    return helper;
};