// Description: Index a document in Elasticsearch using the official Elasticsearch Node.js client.
// filename: /middleware/indexDocument.js

const client = require('./esClient'); // Make sure this correctly points to your Elasticsearch client setup

/**
 * Indexes or updates a document into Elasticsearch.
 * @param {String} indexName - The name of the index where the document will be stored.
 * @param {Object} documentBody - The document to be indexed.
 * @param {String} documentId - The unique identifier for the document (used as _id in Elasticsearch).
 */
async function indexDocument(indexName, documentBody, documentId) {
  try {
    const response = await client.index({
      index: indexName,
      id: documentId, // Set the Elasticsearch document _id to documentId
      body: documentBody,
    });

    await client.indices.refresh({ index: indexName }); // Ensure the document is searchable immediately

    console.log("Document indexed successfully:", response.body);
    return response.body;
  } catch (error) {
    console.error("Error indexing document:", error);
    throw error; // Rethrow the error after logging it
  }
}

module.exports = { indexDocument };
