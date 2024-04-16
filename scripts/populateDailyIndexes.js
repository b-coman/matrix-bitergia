// filename ./scripts/populateDailyIndexes.js
// description This script is used to populate the daily indexes for the rooms in the roomMappings configuration file. 
// it runs daily through a cron job

require('dotenv').config();
const axios = require('axios');
const roomMappings = require('../config/roomMappings');

function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    return dates;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callProcessDailyMessagesRoute(startDate, endDate, roomAlias) {
    const dates = getDatesBetween(new Date(startDate), new Date(endDate));
    const delayBetweenRequests = 1000;

    for (const date of dates) {
        try {
            await delay(delayBetweenRequests);
            const response = await axios.post(`${process.env.API_BASE_URL}/processDailyMessages`, {
                date: date,
                messages: "yes",
                summary: "yes",
                roomAlias: roomAlias
            });
            console.log(`Success for date ${date} in room ${roomAlias}:`, response.data);
        } catch (error) {
            console.error(`Error for date ${date} in room ${roomAlias}:`, error.response ? error.response.data : error.message);
        }
    }
}

// Calculate yesterday's date to use as the date range
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateString = yesterday.toISOString().split('T')[0];

for (const roomID in roomMappings) {
    const roomAlias = roomMappings[roomID];
    callProcessDailyMessagesRoute(dateString, dateString, roomAlias);
}
