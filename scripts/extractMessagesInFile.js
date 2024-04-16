require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const client = new Client({ node: process.env.ELASTICSEARCH_NODE });
const { fetchMessagesByDateAndRoom } = require('../src/elastic/elasticFetchMessagesByDateAndRoom');
const logger = require('../config/logger');
const appConfig = require('../config/appConfig');
const roomMappings = require('../config/roomMappings'); 

const generateDateRange = (startDate, endDate) => {
    let dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

async function saveMessagesToFile(targetDate, roomId, filePath) {
    const startDate = '2024-02-15';
    const endDate = new Date().toISOString().split('T')[0]; // Today's date
    const datesToProcess = targetDate ? [targetDate] : generateDateRange(new Date(startDate), new Date(endDate));
    const roomsToProcess = roomId ? [roomId] : Object.keys(roomMappings);

    // Aggregate all messages before writing to the file
    let allAggregatedMessages = [];

    for (const date of datesToProcess) {
        for (const roomId of roomsToProcess) {
            try {
                const messageObjects = await fetchMessagesByDateAndRoom(roomId, date);
                if (messageObjects.length === 0) {
                    logger.warn(`No messages to process for ${date} in room ${roomId}.`);
                    continue;
                }

                const aggregatedMessages = {
                    date: date,
                    roomId: roomId,
                    messages: messageObjects.map(obj => ({ userID: obj.anonymizedUserId, message: obj.messageBody }))
                };

                allAggregatedMessages.push(aggregatedMessages);

            } catch (error) {
                logger.error(`Failed to fetch messages or save to file for ${date} in room ${roomId}:`, error);
            }
        }
    }

    // Write all aggregated messages to a single file
    if (allAggregatedMessages.length > 0) {
        const jsonContent = JSON.stringify(allAggregatedMessages, null, 2);
        fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
            if (err) {
                logger.error('An error occurred while writing JSON to file:', err);
            } else {
                logger.info(`All messages have been aggregated and written to file successfully at ${filePath}`);
            }
        });
    } else {
        logger.warn("No messages were aggregated across the provided dates/rooms.");
    }
}

// Example usage
const targetDate = undefined; // or specific date '2024-04-05';
const roomID = undefined; // or specific room ID '!WcwNDMHEuRTiBZZkxf:matrix.org';
const filePath = './aggregated_messages.json'; 
saveMessagesToFile(targetDate, roomID, filePath).catch(console.error);
