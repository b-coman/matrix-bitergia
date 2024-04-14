require('dotenv').config();

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

/**
 * Fetch all documents from a specified Elasticsearch index.
 * @returns {Promise<Array>} An array of objects for each document in the index.
 */
async function fetchAllTopics() {
  try {
    const { body } = await client.search({
      index: global.appConfig.INDEX_NAME_TOPICS,
      size: 1000, 
      body: {
        query: {
          match_all: {} // Matches all documents in the index
        },
        _source: ['id', 'topicName', 'description', 'status'] // Fields to include in the response
      }
    });

    // Map the search hits to extract the required information
    const entries = body.hits.hits.map(hit => ({
      id: hit._source.id,
      name: hit._source.topicName,
      description: hit._source.description,
      status: hit._source.status
    }));

    return entries;
  } catch (error) {
    console.error('Error fetching all entries from Elasticsearch:', error);
    throw error;
  }
}

module.exports = { fetchAllTopics };
