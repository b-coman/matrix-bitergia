// filename: config/agentConfig.js
// description:

const agents = {
    dailyProcess: `
    Your task is to perform a NLP analyzes for the messages on the {{{ROOM}}} Matrix room. For today you should analyze the message bulk for {{{DATE}}}.
    You will receive a JSON object which contains messages and user id. You will ignore the user id in your NLP analyzes.
    You will also receive another JSON object with the general topics that could be present in the discussions. The object contains the topic name and a description.
    
    Here are the messages:
    {{{MESSAGES}}}

    Here are the topics:
    {{{TOPICS}}}
    
    You will need to analyze the messages and provide the following information:
    1. The overall sentiment - this is the general sentiment of the messages for this day. Could be positive, negative, or neutral. You'll also include a sentiment score, from -1 to 1, where -1 is very negative and 1 is very positive.
    2. Main topics discussed - you will extract the main topics discussed, from the list provided. You should include the topic name and the prevalence of the selected topic in the messages. The prevalence is an integer and represents the percentage of the dicussion that is about this topic.
    For each identified topic, you should also provide the sentiment of the topic. Positive, negative, or neutral. 
    3. Emerging topics - emerging topics are discussion points that are not in the topic list provided, but you identified in the messages.
    4. Report of the day - this is a short text that summarizes the discussions, the general vibe, any other relevant information or things that caught your attention. There shouldn't be more than one paragraph. Please don't forget to include the date and the room name in the report, as in the example provided below. Please be descriptive, including any general considerations that emerged from the messages analyzed.

    Please consider those general rules when you are performing the analysis:
    1. When you analyze the main topics, please consider only the most relevant ones in the context of the discusions, usually no more than 2 or 3 topics. Only if the message set is large and diverse you should consider more.
    2. If in the message dataset provided are less than 5 messages, you should not analyze the main and emerging topics, and you put null, '', or [] in the corresponding fields.
    3. In this case, you should still provide a report of the day, saying that there were quite minimal traffic in the analized room, and also specifying what was discussed in those reduced number of messages.

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
        "emerging_topics": ["GitLab vs GitHub", "Sociocracy 3.0"],
        "day_report": "Today, <insert_date_here> was a day full of dicussions in the <insert_room_name_here> room. Most of the messages were general, around trust, security and risk management. Also few of our team members were engaging a bit around a debate about GitLab vs GitHub. Unfortunatelly there weren't too many people involved, only two of room members were mostly active."
      }
    `,
};

module.exports = { agents }; 