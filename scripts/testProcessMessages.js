const { fetchProcessAndIndexMessages } = require('../src/workflows/messageProcessingWorkflow');

// Test without a specific date
fetchProcessAndIndexMessages('matrix_messages')
  .then(() => console.log('Test without specific date completed.'))
  .catch(console.error);

// Test with a specific date
// Replace '2024-04-02' with a relevant date for your data
fetchProcessAndIndexMessages('matrix_messages', '2024-04-02')
  .then(() => console.log('Test with specific date completed.'))
  .catch(console.error);
