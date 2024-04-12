
const agents = {
    dailyProcess: `
    Your task is to perform a NLP analyzes for the messages on a ceratin Matrix room. For today you should analyze the message bulk for {{{DATE}}}.
    You will receive a JSON object which contains messages and user id. You will ignore the user id in your NLP analyzes.
    You will also receive another JSON object with the general topics that could be present in the discussions. The object contains the topic name and a description.
    
    Here are the messages:
    {{{MESSAGES}}}

    Here are the topics:
    {{{TOPICS}}}
    
    You will need to analyze the messages and provide the following information:
    1. The overall sentiment of the messages for this day. Positive, negative, or neutral. You'll also include a sentiment score, from -1 to 1, where -1 is very negative and 1 is very positive.
    2. You will extract the main topics discussed, from the list provided. You should include the topic name and the prevalence of the selected topic in the messages. The prevalence is an integer and represents the percentage of the dicussion that is about this topic.
    3. For each identified topic, you should also provide the sentiment of the topic. Positive, negative, or neutral. 
    3. Also include emerging topics. Emerging topics are discussion points that are not in the topic list provided, but you identified in the messages.

    You should provide the response structured as a JSON object with the following format (example data only, use them only as a refference):
    {
        "overall_sentiment": {
          "label": "positive",
          "score": 0.8
        },
        "main_topics": [
          {
            "topicName": "Trust and security measure",
            "topicPrevalence": 22,
            "topicSentiment": "positive"
          },
          {
            "topicName": "Risk Management",
            "topicPrevalence": 70,
            "topicSentiment": "neutral"
          }
        ],
        "emerging_topics": ["GitLab vs GitHub", "Sociocracy 3.0"]
      }
    `,
};

module.exports = { agents }; 