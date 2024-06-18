// filename: src/middleware/esClient.js
// Description: connects to an Elasticsearch cluster using the official Elasticsearch Node.js client.

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
});

module.exports = client;
