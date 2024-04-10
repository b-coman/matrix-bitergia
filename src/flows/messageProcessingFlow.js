// src/workflows/messageProcessingWorkflow.js
const { processMessages } = require('../../matrix/processMessages');
const { indexDocument } = require('../../middleware/indexDocument');

/**
 * Fetches, processes, and indexes messages from the Matrix for a specific date or all messages if no date is provided.
 * @param {String} indexName - The Elasticsearch index name where messages will be stored.
 * @param {String} [targetDate=null] - Optional. The specific date for which to process messages (in YYYY-MM-DD format).
 */
async function fetchProcessAndIndexMessages(indexName, roomID, targetDate = null) {
    // Fetch and process messages for the given date or all messages if date is null
    const processedMessages = await processMessages(targetDate, roomID);

    // Loop through each processed message and index it
    for (const messageObject of processedMessages) {
        try {
            // Use messageId as the Elasticsearch document ID (_id)
            console.log(`Indexing document with ID: ${messageObject.messageId}`);

            await indexDocument(indexName, messageObject, messageObject.messageId);
            console.log(`Message ${messageObject.messageId} indexed successfully.`);
        } catch (error) {
            console.error(`Error indexing message ${messageObject.messageId}:`, error);
        }
    }
}

module.exports = { fetchProcessAndIndexMessages };
