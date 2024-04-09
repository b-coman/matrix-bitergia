// filename: dailyProcessingWorkflow.js
// description: This file contains the main function orchestrating the daily processing workflow.

require('dotenv').config();
const processMessages = require('../../matrix/processMessages');
const llmUtils = require('../../src/llmUtils');
const { extractJsonFromString, validateLlmResponse } = require('../../src/validationUtils');
const { fetchMessagesByDateAndRoom } = require('../../elastic/elasticFetchMessagesByDateAndRoom');
const { fetchAllTopics } = require('../../elastic/elasticFetchTopics');
const indexDocument = require('../../middleware/indexDocument');
const { generateContent } = require('../../src/replacePlaceholders');
const { agents } = require('../../config/config');
//const { logger } = require('handlebars');
const logger = require('../../logger');


// Main function orchestrating the flow
async function processDailyMessages(targetDate, indexName, roomId) {
    try {

        // 1. get data
        // here I should call a function to retreive the messages for a date --> I have it somewhere
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
        const llmResponseRaw = await llmUtils.analyzeTextWithLlm(analysisPrompt);
        const jsonString = extractJsonFromString(llmResponseRaw);

        if (!jsonString) {
            throw new Error('No JSON found in LLM response.');
        }

        const dailySummaryDocument = {
            date: targetDate,
            roomId: roomId,
        //    roomAlias: roomAlias,
            generalSentiment: jsonString.overall_sentiment.label,
            emergingTopics: jsonString.emerging_topics
        };

        logger.info(dailySummaryDocument);
        // IMPORTANT HERE -->> Insert dailySummaryDocument into your Elasticsearch dailySummary index.  

        for (const topic of jsonString.main_topics) {
            const topicDocument = {
                date: targetDate,
                roomId: roomId,
                //    roomAlias: roomAlias,
                topicName: topic.topic,
                topicPrevalence: topic.prevalence,
                topicSentiment: "neutral" // Placeholder. Adjust as necessary.
            };
        
            logger.info(topicDocument);

            // IMPORTANT HERE -->> Insert topicDocument into your Elasticsearch topics index.
        }
        

return;

        // 3. index data in elasticsearch
        //await indexAnalyzedData(jsonString, indexName, roomId);

        if (!validateLlmResponse(jsonString)) {
            throw new Error('LLM response validation failed.');
        }

        // TODO: >>>> here more work to  do
        console.log('Valid LLM response:', jsonString);
        const indexableObject = {
            date: jsonString.date,
            overall_sentiment: jsonString.overall_sentiment,
            emerging_topics: jsonString.emerging_topics,
            statistics: jsonString.statistics,
            main_topics: jsonString.main_topics.map(topicObj => topicObj.topic)
        };

        //TO DO: create documentId from targetDate and roomId
        await indexDocument(indexName, indexableObject, documentId);
        console.log('LLM output successfully indexed into Elasticsearch.');


    } catch (error) {
        console.error('An error occurred during the main flow:', error);
    }
}


module.exports = { processDailyMessages };