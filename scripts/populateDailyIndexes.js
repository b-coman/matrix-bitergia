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
            const response = await axios.post('http://localhost:3000/processDailyMessages', {
                type: "summary",
                roomAlias: roomAlias,
                date: date
            });
            console.log(`Success for date ${date} in room ${roomAlias}:`, response.data);
        } catch (error) {
            console.error(`Error for date ${date} in room ${roomAlias}:`, error.response ? error.response.data : error.message);
        }
    }
}

const startDate = '2024-04-09';
const endDate = new Date().toISOString().split('T')[0];

for (const roomID in roomMappings) {
    const roomAlias = roomMappings[roomID];
    callProcessDailyMessagesRoute(startDate, endDate, roomAlias);
}
