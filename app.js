require('dotenv').config();
//const axios = require('axios');
const express = require('express');
const logger = require('./logger');
const roomMappings = require('./config/roomMappings');

//const { Client } = require('@elastic/elasticsearch');
const { createIndexFromSchema } = require('./src/createIndex');
const { processDailyMessages } = require('./src/flows/dailyProcessingFlow');
const { fetchProcessAndIndexMessages } = require('./src/flows/messageProcessingFlow');


const app = express();
app.use(express.json());

// Initialize the Elasticsearch client --> not needed here I guess
//const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

app.post('/processAllMessages', async (req, res) => {
    const indexName = determineIndexName(req); // Dynamically determine the index
    logger.info(`Processing all messages for index ${indexName}`);

    const roomAlias = req.body.roomAlias; // Extract room alias from the request body
    if (!roomAlias) {
        return res.status(400).json({ success: false, error: 'Room alias is required.' });
    }

    //extract room ID from room alias using the roomMappings object
    const roomId = Object.keys(roomMappings).find(key => roomMappings[key] === roomAlias);
    if (!roomId) {
        return res.status(400).json({ success: false, error: 'Room ID not found for room alias.' });
    }
    logger.info(`Room alias ${roomAlias} resolved to room ID ${roomId}`);

    try {
        // Fetch, process, and index all messages for the given room
        await fetchProcessAndIndexMessages(indexName, roomId);
        res.json({ success: true, message: "All messages processed and indexed successfully for room: " + roomAlias });
    } catch (error) {
        console.error('Error processing all messages:', error);
        res.status(500).json({ success: false, error: 'Failed to process all messages' });
    }
});


app.post('/processDailyMessages', async (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ success: false, error: 'Date is required for daily message processing.' });
    }

    const indexName = determineIndexName(req); 
    logger.info(`Processing daily messages for index ${indexName}`);

    const roomAlias = req.body.roomAlias; // Extract room alias from the request body
    if (!roomAlias) {
        return res.status(400).json({ success: false, error: 'Room alias is required.' });
    }

    //extract room ID from room alias using the roomMappings object
    const roomId = Object.keys(roomMappings).find(key => roomMappings[key] === roomAlias);
    if (!roomId) {
        return res.status(400).json({ success: false, error: 'Room ID not found for room alias.' });
    }
    logger.info(`Room alias ${roomAlias} resolved to room ID ${roomId}`);

    try {
        await processDailyMessages(date, indexName, roomId, roomAlias); 
        
        logger.info(`Successfully processed daily messages for index ${indexName} and date ${date}`);
        res.json({ success: true, message: "Daily messages processed successfully." });
    } catch (error) {
        console.error('Error processing daily messages:', error);
        res.status(500).json({ success: false, error: 'Failed to process daily messages' });
    }
});


function determineIndexName(req) {
    // Example logic to determine the index name
    // Adjust according to your application's requirements
    return req.body.type === 'message' ? process.env.INDEX_NAME_MESSAGES :
        req.body.type === 'summary' ? process.env.INDEX_NAME_DAILY_SUMMARIES :
            process.env.INDEX_NAME_DAILY_TOPICS;
}

async function setupElasticsearch() {
    // Setup each index using environment variables for names and schema paths
    await createIndexFromSchema(process.env.INDEX_NAME_MESSAGES, process.env.SCHEMA_FILE_PATH_MESSAGES);
    await createIndexFromSchema(process.env.INDEX_NAME_DAILY_SUMMARIES, process.env.SCHEMA_FILE_PATH_SUMMARIES);
    await createIndexFromSchema(process.env.INDEX_NAME_DAILY_TOPICS, process.env.SCHEMA_FILE_PATH_TOPICS);
}

async function startServer() {
    await setupElasticsearch(); // Ensure Elasticsearch indices are set up
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch(console.error);


