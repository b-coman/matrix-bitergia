// filename: src/flows/messageProcessingFlow.js
// description:

const { processMessages } = require('../middleware/processMessages');
const { indexDocument } = require('../middleware/indexDocument');
const logger = require('../../config/logger');

/**
 * Fetches, processes, and indexes messages from the Matrix or Discord for a specific date or all messages if no date is provided.
 * @param {String} indexName - The Elasticsearch index name where messages will be stored.
 * @param {String} [targetDate=null] - Optional. The specific date for which to process messages (in YYYY-MM-DD format).
 * @param {String} platform - The platform from which to fetch messages ('matrix' or 'discord').
 * @param {String} identifier - The room ID for Matrix or channel ID for Discord.
 * @param {String} roomAlias - The alias of the room or channel being processed.
 */
async function fetchProcessAndIndexMessages(targetDate = null, indexName, platform, identifier, roomAlias) {
    // Fetch and process messages for the given date or all messages if date is null
    const processedMessages = await processMessages(platform, identifier, targetDate);

    // Loop through each processed message and index it
    for (const messageObject of processedMessages) {
        try {
            // Use messageId as the Elasticsearch document ID (_id)
            logger.info(`Indexing document with ID: ${messageObject.messageId}`);

            await indexDocument(indexName, messageObject, messageObject.messageId);
            console.log(`Message ${messageObject.messageId} indexed successfully.`);
        } catch (error) {
            console.error(`Error indexing message ${messageObject.messageId}:`, error);
        }
    }
}

module.exports = { fetchProcessAndIndexMessages };
