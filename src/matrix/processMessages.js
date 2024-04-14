// Description: Process messages fetched from a Matrix room and structure them for indexing in Elasticsearch.
// filename: /matrix/processMessages.js

require('dotenv').config();
const crypto = require('crypto'); // Import crypto module for hashing

const { fetchMessages } = require('./getMessages');
const llmUtils = require('../llmUtils'); 
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

    // remove user ids
    cleanedText = cleanedText.replace(/@\w+:\w+\.\w+/g, 'user_id_removed');

    // Replace newlines and tabs with a space
    cleanedText = cleanedText.replace(/\s+/g, ' ');

    return cleanedText.trim();
}

exports.processMessages = async (targetDate = null, roomID) => {
    const messages = await fetchMessages(targetDate, roomID);
    const messageObjects = []; // Initialize an empty array to collect message objects

    if (messages.length === 0) {
        console.log("No messages to process.");
        return [];
    }

    messages.forEach(message => {
        // Skip messages without a content body or not of type string
        if (!message.content || typeof message.content.body !== 'string') {
            console.warn('Message content or body is undefined or not a string, skipping:');
            console.warn(message.content);
            return;
        }

        const cleanedBody = cleanMessageBody(message.content.body);
        // retrieve the room name from the roomMappings config object
        const roomAlias = roomMappings[message.room_id] || 'Unknown Room'; 


        // Construct the message object with timestamp conversion
        const messageObject = {
            roomId: message.room_id,
            roomAlias: roomAlias, 
            messageId: message.event_id,
            anonymizedUserId: anonymizeUserId(message.sender),
            messageBody: cleanedBody,
            timestamp: convertTimestampToISO(message.origin_server_ts) // Convert timestamp
        };

        // Push the constructed object into the array
        messageObjects.push(messageObject);
    });

    return messageObjects; // Return the array for further processing
};