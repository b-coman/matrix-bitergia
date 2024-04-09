// description: This is the main flow of the application. It calls the processMessages function from the matrix module to get the messages for a specific date. Then, it checks if there are any messages to process and calls the batchProcessMessages function to process the messages in batches.
// mainFlow.js
// Filename: mainFlow.js

require('dotenv').config();
const processMessages = require('./matrix/processMessages');
const llmUtils = require('./src/llmUtils');
const { extractJsonFromString, validateLlmResponse } = require('./src/validationUtils');
const indexDocument = require('./middleware/indexDocument');
const { generateContent } = require('./src/replacePlaceholders');
const { agents } = require('./config/config');

// Helper function to process and analyze messages for a given date
async function processAndAnalyzeMessages(targetDate) {
    const messageObjects = await processMessages(targetDate);
    if (messageObjects.length === 0) {
        console.log("No messages to process.");
        return;
    }

    console.log(`Retrieved ${messageObjects.length} messages for analysis.`);
    const aggregatedMessages = {
        date: targetDate,
        messages: messageObjects.map(obj => ({ messageId: obj.messageId, messageBody: obj.messageBody }))
    };

    const analysisPrompt = await generateContent(false, agents.dailyProcess, { DATE: targetDate, MESSAGES: JSON.stringify(aggregatedMessages, null, 2) });
    const llmResponseRaw = await llmUtils.analyzeTextWithLlm(analysisPrompt);
    const jsonString = extractJsonFromString(llmResponseRaw);

    if (!jsonString) {
        throw new Error('No JSON found in LLM response.');
    }

    return JSON.parse(jsonString);
}

// Helper function to index analyzed data into Elasticsearch
async function indexAnalyzedData(llmResponse) {
    if (!validateLlmResponse(llmResponse)) {
        throw new Error('LLM response validation failed.');
    }

    console.log('Valid LLM response:', llmResponse);
    const indexableObject = {
        date: llmResponse.date,
        overall_sentiment: llmResponse.overall_sentiment,
        emerging_topics: llmResponse.emerging_topics,
        statistics: llmResponse.statistics,
        main_topics: llmResponse.main_topics.map(topicObj => topicObj.topic)
    };

    await indexDocument('matrix_messages_index', indexableObject);
    console.log('LLM output successfully indexed into Elasticsearch.');
}

// Main function orchestrating the flow
async function main(targetDate) {
    try {
        const llmResponse = await processAndAnalyzeMessages(targetDate);
        await indexAnalyzedData(llmResponse);
    } catch (error) {
        console.error('An error occurred during the main flow:', error);
    }
}

// Entry point
const targetDate = process.argv[2] || new Date().toISOString().split('T')[0]; // Defaults to today's date if not provided
main(targetDate).catch(console.error);
