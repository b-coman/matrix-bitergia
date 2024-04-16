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

logger.info('Starting app...');
logger.info(`Using Elastic node: ${process.env.ELASTICSEARCH_NODE}`);



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


// process the messages for any day and room
// this is the payload structure: {"type": "summary","roomAlias": "#ouroboros-network:matrix.org","date": "2024-04-10"}
app.post('/processDailyMessages', async (req, res) => {
    const { date, messages, summary, roomAlias } = req.body;

    if (!date || !roomAlias) {
        return res.status(400).json({ success: false, error: 'Both date and room alias are required.' });
    }

    const roomId = Object.keys(roomMappings).find(key => roomMappings[key] === roomAlias);
    if (!roomId) {
        return res.status(400).json({ success: false, error: 'Room ID not found for room alias.' });
    }

    let messageResult = null;
    let summaryResult = null;

    if (messages === "yes") {
        try {
            await fetchProcessAndIndexMessages(date, appConfig.INDEX_NAME_MESSAGES, roomId, roomAlias);
            messageResult = `Messages processed and indexed successfully for room ${roomAlias} on date ${date}.`;
            logger.warn(messageResult);
        } catch (error) {
            logger.error('Error processing all messages:', error);
            messageResult = `Failed to process/index new messages for room: ${roomAlias} and date: ${date}`;
        }
    }

    if (summary === "yes") {
        try {
            await processDailyMessages(date, appConfig.INDEX_NAME_DAILY_SUMMARIES, roomId, roomAlias);
            summaryResult = `Daily summaries and topics processed successfully for room ${roomAlias} on date ${date}.`;
            logger.warn(summaryResult);
        } catch (error) {
            logger.error('Error processing daily messages:', error);
            summaryResult = `Failed to process daily messages/topics for room: ${roomAlias} and date: ${date}`;
        }
    }

    // Prepare and send a consolidated response
    const results = [];
    if (messageResult) results.push(messageResult);
    if (summaryResult) results.push(summaryResult);

    if (results.length > 0) {
        res.json({ success: true, messages: results });
    } else {
        res.status(500).json({ success: false, error: 'No operations were successfully executed.' });
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
    server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
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


