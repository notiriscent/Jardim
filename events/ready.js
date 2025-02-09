const { Events, ActivityType } = require('discord.js');
const logger = require('../logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        client.user.setPresence({ activities: [{ name: 'its gardens', type: ActivityType.Watching }], status: 'idle' });
    },
};