// filename: src/middleware/processMessages.js
// description:

require('dotenv').config();
const crypto = require('crypto');
const { fetchMessages: fetchMatrixMessages } = require('../matrix/getMessages');
const { fetchAllMessages: fetchDiscordMessages } = require('../discord/getMessages');
const roomMappings = require('../../config/roomMappings');

// Simple hashing function for anonymizing user IDs
function anonymizeUserId(userId) {
    return crypto.createHash('sha256').update(userId).digest('hex');
}

// Convert timestamp to ISO 8601 format
function convertTimestampToISO(timestamp) {
    return new Date(timestamp).toISOString();
}

// Function to clean and preprocess message text
function cleanMessageBody(text) {
    if (typeof text !== 'string') {
        console.warn('Attempting to clean a message that is not a string:', text);
        return ''; // Return an empty string if the input is not valid
    }

    // Decode HTML entities
    let cleanedText = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    // Remove URLs
    cleanedText = cleanedText.replace(/https?:\/\/\S+\b|www\.(\w+\.)+\S*/g, '');

    // Remove user ids (Matrix and Discord formats)
    cleanedText = cleanedText.replace(/@\w+:\w+\.\w+/g, 'user_id_removed')
        .replace(/<@\d+>/g, 'user_id_removed');

    // Replace newlines and tabs with a space
    cleanedText = cleanedText.replace(/\s+/g, ' ');

    return cleanedText.trim();
}

// Process messages with common logic
function processCommonMessages(messages, platform) {
    const messageObjects = [];
    messages.forEach(message => {
        let cleanedBody;
        let messageObject;

        if (platform === 'matrix') {
            if (!message.content || typeof message.content.body !== 'string') {
                console.warn('Matrix message content or body is undefined or not a string, skipping:', message.content);
                return;
            }
            cleanedBody = cleanMessageBody(message.content.body);
            const roomAlias = roomMappings[message.room_id] || 'Unknown Room';

            messageObject = {
                roomId: message.room_id,
                roomAlias: roomAlias,
                messageId: message.event_id,
                anonymizedUserId: anonymizeUserId(message.sender),
                messageBody: cleanedBody,
                timestamp: convertTimestampToISO(message.origin_server_ts),
                platform: 'matrix' // Add platform for consistency
            };
        } else if (platform === 'discord') {
            cleanedBody = cleanMessageBody(message.content);

            messageObject = {
                roomId: message.channelId, // Ensure consistency with Matrix structure
                roomAlias: message.channelName, // Ensure consistency with Matrix structure
                messageId: message.id,
                anonymizedUserId: anonymizeUserId(message.author),
                messageBody: cleanedBody,
                timestamp: convertTimestampToISO(message.timestamp),
                platform: 'discord' // Add platform for consistency
            };
        }

        messageObjects.push(messageObject);
    });

    return messageObjects;
}

// Process Matrix messages
async function processMatrixMessages(targetDate, roomID) {
    const messages = await fetchMatrixMessages(targetDate, roomID);
    return processCommonMessages(messages, 'matrix');
}

// Process Discord messages
async function processDiscordMessages(targetDate, channelId) {
    const messages = await fetchDiscordMessages(channelId, targetDate);
    return processCommonMessages(messages, 'discord');
}

// Unified function to process messages from either platform
exports.processMessages = async (platform, identifier, targetDate = null) => {
    if (platform === 'matrix') {
        return await processMatrixMessages(targetDate, identifier);
    } else if (platform === 'discord') {
        return await processDiscordMessages(targetDate, identifier);
    } else {
        throw new Error('Unsupported platform');
    }
};
