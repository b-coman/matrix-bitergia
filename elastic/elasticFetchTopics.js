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
      index: process.env.INDEX_NAME_TOPICS, // Ensure this environment variable is set to your index name
      size: 1000, // Adjust based on the maximum number of documents you expect to retrieve
      body: {
        query: {
          match_all: {} // Matches all documents in the index
        },
        _source: ['id', 'name', 'description', 'keywords', 'status'] // Fields to include in the response
      }
    });

    // Map the search hits to extract the required information
    const entries = body.hits.hits.map(hit => ({
      id: hit._source.id,
      name: hit._source.name,
      description: hit._source.description,
      keywords: hit._source.keywords,
      status: hit._source.status
    }));

    return entries;
  } catch (error) {
    console.error('Error fetching all entries from Elasticsearch:', error);
    throw error;
  }
}

module.exports = { fetchAllTopics };
