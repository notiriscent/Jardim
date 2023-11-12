require('dotenv').config();
const logger = require('./logger');
const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds
] });

client.once(Events.ClientReady, c => {
    logger.info(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);