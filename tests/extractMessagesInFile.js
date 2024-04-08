const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const client = new Client({ node: 'http://localhost:9200' });

async function fetchAllDocuments(indexName) {
  const { body } = await client.search({
    index: indexName,
    size: 10000,
    body: {
      query: {
        match_all: {}
      },
      _source: ['messageBody', 'timestamp']
    }
  });

  const documents = body.hits.hits.map(hit => ({
    _id: hit._id,
    messageBody: hit._source.messageBody,
    timestamp: hit._source.timestamp
  }));

  return documents;
}

async function saveDocumentsToFile(indexName, filePath) {
  const documents = await fetchAllDocuments(indexName);
  
  // Convert the documents to a JSON string
  const jsonContent = JSON.stringify(documents, null, 2);

  // Write the JSON string to a file
  fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
    if (err) {
      console.error('An error occurred while writing JSON to file:', err);
    } else {
      console.log(`Data has been written to file successfully at ${filePath}`);
    }
  });
}

// Example usage
const indexName = 'matrix_messages'; // Index name
const filePath = './tests/messages.json'; // Path where you want to save the file
saveDocumentsToFile(indexName, filePath).catch(console.error);
