// description: Utility functions for interacting with the OpenAI Language Model API
// filename: /src/llmUtils.js

require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

exports.analyzeTextWithLlm = async (messageText) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Specify the model
        messages: [
          { role: "system", content: "You are a helpful assistant and you help me with analyzing messages." },
          { role: "user", content: messageText },
        ],
      });
  
      // Assuming the response structure is consistent with OpenAI's API documentation
      // Adjust the path to the text content as needed based on actual response structure
      const completionText = response.choices[0].message.content;
      console.log(completionText);
  
      return completionText; // Return the text content of the LLM's response
    } catch (error) {
      console.error('LLM API request failed:', error);
      return null; // Return null or appropriate error indication on failure
    }
  };