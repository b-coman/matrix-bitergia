require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Call the function to start fetching messages
    fetchAllMessages('YOUR_CHANNEL_ID'); // Replace with your target channel ID
});

async function fetchAllMessages(channelId) {

    channelId = '1148510847518388244';

    const channel = await client.channels.fetch(channelId);
    
    if (channel.type !== 'GUILD_TEXT') { // Checking if the channel type is not 'GUILD_TEXT'
        console.log('The channel is not a text channel.');
        return;
    }

    let lastID;
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
            console.log(`${message.author.tag}: ${message.content}`);
        });

        lastID = messages.last().id;
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to prevent rate limiting
    }
}


client.login(process.env.DISCORD_TOKEN);
