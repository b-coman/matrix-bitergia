// filename: src/discord/getMessages.js
// description:

require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const logger = require('../../config/logger'); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

async function fetchAllMessages(channelId, targetDate) {
    const channel = await client.channels.fetch(channelId);
    //console.log(channelId);
    
    if (channel.type !== ChannelType.GuildText) {
        logger.warn('The channel is not a text channel.');
        return [];
    }

    let lastID;
    const allMessages = [];
    const targetDateStart = new Date(targetDate).setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate).setHours(23, 59, 59, 999);

    while (true) {
        const options = { limit: 100 };
        if (lastID) {
            options.before = lastID;
        }

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) {
            break;
        }

        messages.forEach(message => {
            const messageTimestamp = new Date(message.createdTimestamp);
            if (messageTimestamp >= targetDateStart && messageTimestamp <= targetDateEnd) {
                allMessages.push({
                    id: message.id,
                    content: message.content,
                    author: message.author.tag,
                    timestamp: message.createdTimestamp,
                    channelId: message.channel.id,
                    channelName: message.channel.name
                });
            }
        });

        lastID = messages.last().id;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent rate limiting
    }

    logger.info(`Fetched ${allMessages.length} messages`);
    return allMessages;
}

client.login(process.env.DISCORD_TOKEN);

module.exports = { fetchAllMessages };
