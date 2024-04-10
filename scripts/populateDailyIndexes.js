const axios = require('axios');

function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]); // Format as "YYYY-MM-DD"
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1)); // Increment the day
    }

    return dates;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callProcessDailyMessagesRoute(startDate, endDate, roomAlias) {
    const dates = getDatesBetween(new Date(startDate), new Date(endDate));
    const delayBetweenRequests = 1000; // 1 second delay

    for (const date of dates) {
        try {
            await delay(delayBetweenRequests); // Wait for the specified delay
            const response = await axios.post('http://localhost:3000/processDailyMessages', {
                type: "summary", // Including the "type" field as per the provided payload structure
                roomAlias: roomAlias,
                date: date
            });

            console.log(`Success for date ${date}:`, response.data);
        } catch (error) {
            console.error(`Error for date ${date}:`, error.response ? error.response.data : error.message);
        }
    }
}

// Usage
const startDate = '2024-02-15'; // Adjust to your start date
const endDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
const roomAlias = '#ouroboros-network:matrix.org'; // The specific room alias
callProcessDailyMessagesRoute(startDate, endDate, roomAlias);
