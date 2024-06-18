// filename: src/llmUtils.js
// description: Utility functions for interacting with the OpenAI Language Model API

require('dotenv').config();
const OpenAI = require('openai');
const appConfig = require('../config/appConfig');


// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

exports.analyzeTextWithLlm = async (messageText) => {
    try {
      const response = await openai.chat.completions.create({
        model: appConfig.LLM_MODEL, // Specify the model
        messages: [
          { role: "system", content: "You are a helpful assistant and you help me with analyzing data provided." },
          { role: "user", content: messageText },
        ],
      });
  
      const completionText = response.choices[0].message.content;
      //console.log(completionText);
  
      return completionText; // Return the text content of the LLM's response
    } catch (error) {
      console.error('LLM API request failed:', error);
      return null; // Return null or appropriate error indication on failure
    }
  };