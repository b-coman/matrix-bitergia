// Description: connects to an Elasticsearch cluster using the official Elasticsearch Node.js client.
// filename: /middleware/esClient.js

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'http://localhost:9200'
});

module.exports = client;
