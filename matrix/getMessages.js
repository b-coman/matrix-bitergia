// Filename: getMessages.js
// Description: Fetch messages from a Matrix room using the Matrix API, including messages from a specific date.

require('dotenv').config();
const axios = require('axios');


const fetchMessages = async (targetDate = null, roomID) => {
    //const roomID = encodeURIComponent(roomID);
    const baseURL = `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomID)}/messages`;
    const params = { dir: "b", limit: 2000 };
    const headers = { Authorization: `Bearer ${process.env.MATRIX_ACCESS_TOKEN}` };

    const messages = await fetchAllMessages(baseURL, params, headers);

    if (targetDate) {
        const { startOfDayISO, endOfDayISO } = generateDayBoundaryISOStrings(targetDate);
        return messages.filter(message => {
            const messageTimestampISO = new Date(message.origin_server_ts).toISOString();
            return messageTimestampISO >= startOfDayISO && messageTimestampISO < endOfDayISO;
        });
    }
    return messages;
};


async function fetchAllMessages(baseURL, params, headers) {
    let allMessages = [];
    let url = baseURL;
    do {
        try {
            const response = await axios.get(url, { params, headers });
            allMessages = allMessages.concat(response.data.chunk);
            url = response.data.next_batch ? `${baseURL}?next_batch=${response.data.next_batch}` : null;
        } catch (error) {
            console.error("Error fetching messages:", error);
            throw new Error('Failed to fetch messages from Matrix API');
        }
    } while (url);
    return allMessages;
}


// Helper function to generate ISO date strings for date boundaries
function generateDayBoundaryISOStrings(date) {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); // End of the day in UTC
    return {
        startOfDayISO: startDate.toISOString(),
        endOfDayISO: endDate.toISOString(),
    };
}



module.exports = { fetchMessages };