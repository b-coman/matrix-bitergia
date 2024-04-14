const axios = require('axios');

module.exports = async function (context, myTimer) {
    const apiUrl = 'https://your-app.azurewebsites.net/triggerDailyProcess';
    const apiToken = 'your_api_key_or_token'; // Ensure to manage this securely, possibly through environment variables

    try {
        const response = await axios.post(apiUrl, {}, {
            headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        context.log('Success:', response.data);
    } catch (error) {
        context.log.error('Error triggering process:', error.message);
    }

    context.done();
};
