// Description: searches for documents in Elasticsearch using the official Elasticsearch Node.js client.
// filename: /middleware/searchDocuments.js

const client = require('./esClient');

async function searchDocuments() {
  try {
    const { body } = await client.search({
      index: 'test-index',
      query: {
        match: { quote: 'winter' }
      }
    });

    console.log("Search results:", body.hits.hits);
  } catch (err) {
    console.error("Search error:", err);
  }
}

searchDocuments();
