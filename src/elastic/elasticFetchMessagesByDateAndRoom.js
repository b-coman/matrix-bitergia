//filename: /elastic/elasticFetchMessagesByDateAndRoom.js
// description: Fetch messages from Elasticsearch index 'matrix_messages_index' that match a specific date and roomId.

require('dotenv').config();
const appConfig = require('../../config/appConfig');
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

/**
 * Fetch messages from Elasticsearch index 'matrix_messages_index' that match a specific date and roomId.
 * @param {String} roomId The ID of the Matrix room.
 * @param {String} date The date to match messages against (YYYY-MM-DD format).
 * @returns {Promise<Array>} An array of objects containing messageBody and messageId for the matching documents.
 */
async function fetchMessagesByDateAndRoom(roomId, date) {
  try {
    const { body } = await client.search({
      index: appConfig.INDEX_NAME_MESSAGES,
      size: 5000, // Adjust size according to expected result volume
      body: {
        query: {
          bool: {
            must: [
              { match: { roomId: roomId } },
              {
                range: {
                  timestamp: {
                    gte: `${date}T00:00:00`, // Start of the day in UTC
                    lt: `${date}T23:59:59`,  // End of the day in UTC
                    time_zone: "+00:00"      // Adjust time zone if necessary
                  }
                }
              }
            ]
          }
        },
        _source: ['messageBody', 'messageId', 'roomId', 'roomAlias', 'anonymizedUserId'] // Specify which fields to include in the response
      }
    });

    // Map the search hits to extract message body and ID
    const messages = body.hits.hits.map(hit => ({
      roomId: hit._source.roomId,
      roomAlias: hit._source.roomAlias,
      messageId: hit._source.messageId,
      anonymizedUserId: hit._source.anonymizedUserId,
      messageBody: hit._source.messageBody
    }));

    return messages;
  } catch (error) {
    console.error('Error fetching messages from Elasticsearch:', error);
    throw error;
  }
}

module.exports = { fetchMessagesByDateAndRoom };
