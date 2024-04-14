require('dotenv').config();
const { fetchMessagesByDateAndRoom } = require('../src/elastic/elasticFetchMessagesByDateAndRoom');

(async () => {
  const roomId = '!WcwNDMHEuRTiBZZkxf:matrix.org';
  const date = '2024-04-04';

  try {
    const messages = await fetchMessagesByDateAndRoom(roomId, date);
    console.log(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }
})();
