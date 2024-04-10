require('dotenv').config();
const { fetchMessagesByDateAndRoom } = require('../elastic/elasticFetchMessagesByDateAndRoom');

(async () => {
  const roomId = process.env.MATRIX_PLUTUS_ROOM_ID;
  const date = '2024-04-04';

  try {
    const messages = await fetchMessagesByDateAndRoom(roomId, date);
    console.log(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }
})();
