# Matrix Message Analysis

This project is designed to fetch messages from a Matrix room, analyze their content using a large language model (LLM), and index the analyzed data into an Elasticsearch instance. The primary goal is to extract insights and statistics from the messages, such as overall sentiment, emerging topics, and main discussion points.

## Features

- Fetch messages from a Matrix room for a specific date or a range of dates.
- Analyze the messages using a configurable LLM (e.g., GPT-3, Claude, etc.).
- Extract valuable information from the LLM's response, including overall sentiment, emerging topics, statistics, and main topics.
- Index the analyzed data into an Elasticsearch instance for vizualization in Kibana or Bitergia.

## Prerequisites

- Node.js (v14 or later)
- A Matrix account with access to the desired room
- An Elasticsearch instance (version 7 or later)
- Access to a large language model (LLM) API (e.g., OpenAI, Anthropic, etc.)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/matrix-message-analysis.git


2. Navigate to the project directory:

    ```bash
    cd matrix-message-analysis


3. Install the dependencies:

    ```bash
    npm install


4. Create a .env file in the project root directory and add the following environment variables:

    ```bash
    MATRIX_ACCESS_TOKEN=your-matrix-access-token
    ELASTICSEARCH_URL=your-elasticsearch-url
    LLM_API_KEY=your-llm-api-key


Replace the placeholders with your actual values.

## Usage

To analyze messages for a specific date, run the following command:
    
    ```bash
    node mainFlow.js YYYY-MM-DD

Replace YYYY-MM-DD with the desired date in the format YYYY-MM-DD.

To analyze messages for a range of dates, you can use the populateDailyIndexes.js script:
    
    ```bash
    node populateDailyIndexes.js START_DATE END_DATE
 
Replace START_DATE and END_DATE with the start and end dates in the format YYYY-MM-DD.

## Configuration
The project configuration can be found in the config/config.js file. Here, you can specify the Matrix room ID, the Elasticsearch index name, and the LLM agent configurations.





