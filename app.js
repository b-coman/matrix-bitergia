require('dotenv').config();
const axios = require('axios'); 
const express = require('express');
const logger = require('./logger');
const { Client } = require('@elastic/elasticsearch');
const { createIndexFromSchema } = require('./src/createIndex');
const { processAllMessages, processDailyMessages } = require('./src/messageProcessing');
const { fetchProcessAndIndexMessages } = require('./src/workflows/messageProcessingWorkflow');


const app = express();
app.use(express.json());

// Initialize the Elasticsearch client
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });

app.post('/processAllMessages', async (req, res) => {
    const indexName = determineIndexName(req); // Dynamically determine the index
logger.info(`Processing all messages for index ${indexName}`);

    const roomAlias = req.body.roomAlias; // Extract room alias from the request body
    
    if (!roomAlias) {
        return res.status(400).json({ success: false, error: 'Room alias is required.' });
    }
    
    try {
        const roomID = await resolveRoomAliasToID(roomAlias); 
        logger.info(`Room alias ${roomAlias} resolved to room ID ${roomID}`);
        
        await fetchProcessAndIndexMessages(indexName, roomID); // Pass the room ID
        res.json({ success: true, message: "All messages processed and indexed successfully for room: " + roomAlias });
    } catch (error) {
        console.error('Error processing all messages:', error);
        res.status(500).json({ success: false, error: 'Failed to process all messages' });
    }
});


app.post('/processDailyMessages', async (req, res) => {
    const { date } = req.body;
    const indexName = date ? `daily_messages_${date.replace(/-/g, '_')}` : determineIndexName(req); // Use date if provided, else determine from request
    if (!date) {
        return res.status(400).json({ success: false, error: 'Date is required for daily message processing.' });
    }
    try {
        await processDailyMessages(date, indexName); // Pass the date and index name
        res.json({ success: true, message: "Daily messages processed successfully." });
    } catch (error) {
        console.error('Error processing daily messages:', error);
        res.status(500).json({ success: false, error: 'Failed to process daily messages' });
    }
});

async function resolveRoomAliasToID(roomAlias) {
    const apiUrl = `https://matrix.org/_matrix/client/r0/directory/room/${encodeURIComponent(roomAlias)}`;
    const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${process.env.MATRIX_ACCESS_TOKEN}` }
    });
    return response.data.room_id; // Extract the room ID from the response
}

function determineIndexName(req) {
    // Example logic to determine the index name
    // Adjust according to your application's requirements
    return req.body.type === 'message' ? process.env.INDEX_NAME_MESSAGES : 
           req.body.type === 'summary' ? process.env.INDEX_NAME_SUMMARIES : 
           process.env.INDEX_NAME_TOPICS;
}

async function setupElasticsearch() {
    // Setup each index using environment variables for names and schema paths
    await createIndexFromSchema(process.env.INDEX_NAME_MESSAGES, process.env.SCHEMA_FILE_PATH_MESSAGES);
    // UNCOMMENT when the other indexes will be done
   // await createIndexFromSchema(process.env.INDEX_NAME_SUMMARIES, process.env.SCHEMA_FILE_PATH_SUMMARIES);
   // await createIndexFromSchema(process.env.INDEX_NAME_TOPICS, process.env.SCHEMA_FILE_PATH_TOPICS);
}

async function startServer() {
    await setupElasticsearch(); // Ensure Elasticsearch indices are set up
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch(console.error);


