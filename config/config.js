//config.js

const isDevelopment = process.env.NODE_ENV === 'development';

const appConfig = {
 
};


const agents = {
    // marketing agent --> used in New Engagement Flow
    agentsBaseURL: isDevelopment ? 'http://127.0.0.1:5000' : 'https://wingman-agents.azurewebsites.net',

    dailyProcess: `
    Your task is to perform a NLP analyzes for the messages on a ceratin Matrix room. For today you should analyze the message bulk for {{{DATE}}}.
    Here are the messages, together with a message id, which you can ignore in your NLP analyzes.
    {{{MESSAGES}}}
    
    Based on the messages from this day, please provide the following:
    1. The overall sentiment of the messages. Positive, negative, or neutral. You'll also include a sentiment score.
    2. You will extract the main topics discussed. The main topics should be summarized in a few words or a very short sentence.
    3. You should include the prevalence of these topics in the messages.
    4. Also include emerging topics, which might take more inportance in the following days.
    5. The total number of messages, messages per user, average and median message length.

    You should provide the response structured as a JSON object with the following format (example data only, be used only for the refference):
    {
        "date": "2024-04-05",
        "overall_sentiment": {
          "label": "positive",
          "score": 0.8
        },
        "main_topics": [
          {
            "topic": "Software Development",
            "prevalence": 5
          },
          {
            "topic": "Risk Management",
            "prevalence": 3
          }
        ],
        "emerging_topics": ["GitLab vs GitHub", "Sociocracy 3.0"],
        "statistics": {
          "total_messages": 20,
          "average_message_length": 120,
          "median_message_length": 115
        }
      }
      
    `,
};



module.exports = { appConfig, agents }; 