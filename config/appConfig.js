//appConfig.js

//const isDevelopment = process.env.NODE_ENV === 'development';

const appConfig = {
  LLM_MODEL: 'gpt-3.5-turbo',

  INDEX_NAME_MESSAGES: 'matrix_messages_index',
  INDEX_NAME_DAILY_SUMMARIES: 'matrix_daily_summary_index',
  INDEX_NAME_DAILY_TOPICS: 'matrix_daily_topics_index',
  INDEX_NAME_TOPICS: 'matrix_topics_index',

  SCHEMA_FILE_PATH_MESSAGES: './elastic/indexes/matrix_messages.json',
  SCHEMA_FILE_PATH_DAILY_SUMMARIES: './elastic/indexes/matrix_daily_summary.json',
  SCHEMA_FILE_PATH_DAILY_TOPICS: './elastic/indexes/matrix_daily_topics.json',
  SCHEMA_FILE_PATH_TOPICS: './elastic/indexes/matrix_topics.json',
 
};

module.exports = { appConfig }; 