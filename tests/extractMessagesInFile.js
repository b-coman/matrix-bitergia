const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const client = new Client({ node: 'http://localhost:9200' });
const { fetchMessages } = require('../matrix/getMessages'); 
const { processMessages } = require('../matrix/processMessages');


async function saveMessagesToFile(targetDate, roomID, filePath) {
    try {
     // const messages = await fetchMessages(targetDate, roomID);
      const messages = await processMessages(targetDate, roomID);
  
      // Assuming messages is an array of message objects
      const jsonContent = JSON.stringify(messages, null, 2);
  
      // Write the JSON string to a file
      fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
        if (err) {
          console.error('An error occurred while writing JSON to file:', err);
        } else {
          console.log(`Messages have been written to file successfully at ${filePath}`);
        }
      });
    } catch (error) {
      console.error('Failed to fetch messages or save to file:', error);
    }
  }


// Example usage
const targetDate = '2024-04-05'; 
const roomID = '!WcwNDMHEuRTiBZZkxf:matrix.org'; 
const filePath = './tests/messages.json'; 
saveMessagesToFile(targetDate, roomID, filePath).catch(console.error);