require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const logger = require('../config/logger');

const { createIndexFromSchema } = require('./createIndex');
const { processDailyMessages } = require('./flows/dailyProcessingFlow');
const { fetchProcessAndIndexMessages } = require('./flows/messageProcessingFlow');

const roomMappings = require('../config/roomMappings');
const appConfig = require('../config/appConfig');
//global.appConfig = appConfig;

//logger.info(appConfig.INDEX_NAME_MESSAGES);

const app = express();
app.use(helmet()); // Use Helmet to set security headers
app.use(express.json({ limit: '100kb' })); // Limit the size of incoming JSON payloads



// test route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

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


//process the messages for any day and room
// this is the payload structure: {"type": "summary","roomAlias": "#ouroboros-network:matrix.org","date": "2024-04-10"}
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


app.post('/triggerDailyProcess', async (req, res) => {
    try {
        // call processing function
        await processDailyIndexes();
        res.status(200).send('Daily process triggered successfully');
    } catch (error) {
        console.error('Failed to trigger daily process:', error);
        res.status(500).send('Error triggering daily process');
    }
});


function determineIndexName(req) {
    // Example logic to determine the index name
    // Adjust according to your application's requirements
    return req.body.type === 'message' ? appConfig.INDEX_NAME_MESSAGES :
        req.body.type === 'summary' ? appConfig.INDEX_NAME_DAILY_SUMMARIES :
        appConfig.INDEX_NAME_DAILY_TOPICS;
}

async function setupElasticsearch() {
    // Setup each index using environment variables for names and schema paths
    await createIndexFromSchema(appConfig.INDEX_NAME_MESSAGES, appConfig.SCHEMA_FILE_PATH_MESSAGES);
    await createIndexFromSchema(appConfig.INDEX_NAME_DAILY_SUMMARIES, appConfig.SCHEMA_FILE_PATH_DAILY_SUMMARIES);
    await createIndexFromSchema(appConfig.INDEX_NAME_DAILY_TOPICS, appConfig.SCHEMA_FILE_PATH_DAILY_TOPICS);
    await createIndexFromSchema(appConfig.INDEX_NAME_TOPICS, appConfig.SCHEMA_FILE_PATH_TOPICS);
}


// Error handling middleware should be the last piece of middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


let server; // Server object for graceful shutdown
async function startServer() {
    await setupElasticsearch();
    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
        });
    }
});


