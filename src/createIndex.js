// filename: createIndex.js

require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs').promises;
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

async function createIndexFromSchema(indexName, schemaFilePath) {
    const schemaJson = await fs.readFile(schemaFilePath, 'utf8');
    const schema = JSON.parse(schemaJson);

    const { body: exists } = await client.indices.exists({ index: indexName });
    if (!exists) {
        await client.indices.create({
            index: indexName,
            body: schema
        });
        console.log(`Index ${indexName} created.`);
    } else {
        console.log(`Index ${indexName} already exists.`);
    }
}

module.exports = { createIndexFromSchema };


