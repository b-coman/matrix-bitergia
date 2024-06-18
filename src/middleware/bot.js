// filename: src/middleware/bot.js
// description:

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;  // Ignore messages from bots
    console.log(`Message from ${message.author.tag} in ${message.channel.name}: ${message.content}`);
});

client.login(process.env.DISCORD_TOKEN);
