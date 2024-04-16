// filename: dailyProcessingWorkflow.js
// description: This file contains the main function orchestrating the daily processing workflow.

require('dotenv').config();
const crypto = require('crypto'); // Import crypto module for hashing
const processMessages = require('../matrix/processMessages');
const llmUtils = require('../llmUtils');
const { extractJsonFromString, validateLlmResponse } = require('../validationUtils');
const { fetchMessagesByDateAndRoom } = require('../elastic/elasticFetchMessagesByDateAndRoom');
const { fetchAllTopics } = require('../elastic/elasticFetchTopics');
const { indexDocument } = require('../middleware/indexDocument');
const { generateContent } = require('../replacePlaceholders');
const appConfig = require('../../config/appConfig');
const { agents } = require('../../config/agentConfig');
//const { logger } = require('handlebars');
const logger = require('../../config/logger');


// Main function orchestrating the flow
async function processDailyMessages(targetDate, indexName, roomId, roomAlias) {
    try {
        logger.info(`Starting processDailyMessages function / date: ${targetDate} / room: ${roomAlias}`);
        
        // 1. get data
        const messageObjects = await fetchMessagesByDateAndRoom(roomId, targetDate);
        if (messageObjects.length === 0) {
            logger.warn("No messages to process.");
            return;
        }

        const aggregatedMessages = {
            date: targetDate,
            messages: messageObjects.map(obj => ({ userID: obj.anonymizedUserId, message: obj.messageBody }))
        };

        logger.info(aggregatedMessages);


        // 1.5 get the topics
        const topicObjects = await fetchAllTopics();
        if (topicObjects.length === 0) {
            logger.warn("No toipcs present");
            return;
        }

        const aggregatedTopics = {
            topics: topicObjects.map(obj => ({ topicName: obj.name, topicDescription: obj.description }))
        };

        // 2. process data with llm --> topics
        const analysisPrompt = await generateContent(isFilePath = false, agents.dailyProcess, { DATE: targetDate, MESSAGES: JSON.stringify(aggregatedMessages, null, 2), TOPICS: JSON.stringify(aggregatedTopics, null, 2) });
        logger.info(`Prompt sent to LLM: ${analysisPrompt}`);

        const llmResponseRaw = await llmUtils.analyzeTextWithLlm(analysisPrompt);
        const jsonString = extractJsonFromString(llmResponseRaw);
        logger.info(`LLM Response parsed to JSON: ${jsonString}`);

        if (!jsonString) {
            throw new Error('No JSON found in LLM response.');
        }

        const dailySummaryDocument = {
            date: targetDate,
            roomId: roomId,
            roomAlias: roomAlias,
            generalSentiment: jsonString.overall_sentiment.label,
            emergingTopics: jsonString.emerging_topics
        };

        logger.info(dailySummaryDocument);


        // 3. index the dalily Summary documents
        const dailySummaryIndexName = appConfig.INDEX_NAME_DAILY_SUMMARIES;
        const dailySummaryDocumentId = crypto.createHash('md5').update(`${targetDate}:${roomId}`).digest('hex');

        console.log('dailySummaryIndexName', dailySummaryIndexName);
        console.log('dailySummaryDocumentId', dailySummaryDocumentId);

        const indexResult = await indexDocument(dailySummaryIndexName, dailySummaryDocument, dailySummaryDocumentId);
        console.log('indexResult', indexResult);


        // 4. index the daily topics
        const dailyTopicsIndexName = appConfig.INDEX_NAME_DAILY_TOPICS;
        for (const topic of jsonString.main_topics) {
            const topicDocument = {
                date: targetDate,
                roomId: roomId,
                roomAlias: roomAlias,
                topicName: topic.topicName,
                topicPrevalence: topic.topicPrevalence,
                topicSentiment: topic.topicSentiment
            };

            logger.info(topicDocument);

            const dailyTopicDocumentId = crypto.createHash('md5').update(`${targetDate}:${roomId}:${topic.topicName}`).digest('hex');

            const indexResult = await indexDocument(dailyTopicsIndexName, topicDocument, dailyTopicDocumentId);
            //console.log('indexResult', indexResult);

        }

        logger.warn(`processDailyMessages function completed / daily messages and topics for date: ${targetDate} and room: ${roomAlias}`);

    } catch (error) {
        console.error('An error occurred during the main flow:', error);
    }
}


module.exports = { processDailyMessages };