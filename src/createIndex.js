// filename: createIndex.js

require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs').promises;
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });
const logger = require('../config/logger');


async function createIndexFromSchema(indexName, schemaFilePath) {
    const schemaJson = await fs.readFile(schemaFilePath, 'utf8');
    const schema = JSON.parse(schemaJson);

    const { body: exists } = await client.indices.exists({ index: indexName });
    if (!exists) {
        await client.indices.create({
            index: indexName,
            body: schema
        });
        logger.info(`Index ${indexName} created.`);
    } else {
        logger.warn(`${indexName} already exists. Index creation skipped.`);
    }
}

module.exports = { createIndexFromSchema };


