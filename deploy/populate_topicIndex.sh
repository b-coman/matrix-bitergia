#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | awk '/=/ {print $1}')
fi

# Base URL for Elasticsearch
BASE_URL="${ELASTICSEARCH_NODE}/matrix_topics_index/_doc"

# Define the JSON data for each topic
declare -a topics=(
'{
  "id": 1,
  "topicName": "Tools and best practices",
  "description": "Encompasses a wide range of discussions on the selection, use, and best practices of development tools. Includes software maintenance strategies and explores methodologies that enhance efficiency and effectiveness in software development workflows.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 2,
  "topicName": "Open-source governance policies",
  "description": "Covers the structural and operational aspects of project governance, from policy formulation to community moderation. It highlights roles of key individuals in shaping project directions and community interactions. Discusses decision-making processes, project leadership, and the dynamics of community governance.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 3,
  "topicName": "Open-source development",
  "description": "Focuses on the dynamics of collaboration within open-source projects, including the use of platforms like GitHub. It highlights the importance of inclusivity, engagement, and the facilitation of contributions through PRs and CI processes.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 4,
  "topicName": "Security practices",     
  "description": "Addresses the general landscape of security within Cardano software development, focusing on both the implementation of secure coding practices and the broader operational security measures on collaboration platforms. Key areas include application security, data protection, secure development lifecycle, and the ethical implications of security decisions.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 5,
  "topicName": "Versioning and dependencies",
  "description": "Explores challenges related to software versioning and dependency management. It includes discussions on navigating compiler version conflicts, managing software updates, and the complexities of maintaining ecosystem compatibility.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 6,
  "topicName": "Debugging and troubleshooting",
  "description": "Highlights the community strategies for identifying and resolving technical issues. Emphasizes debugging techniques, compiler error resolution, and the collective efforts toward troubleshooting within development environments.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 7,
  "topicName": "Performance and data optimization",
  "description": "Delves into the strategies for optimizing data handling, memory management, and encoding for performance. Discusses the technical considerations behind data structure choices and the impact of these decisions on computational efficiency and resource utilization.",
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 8,
  "topicName": "Technical support",                
  "description": "Captures the collaborative approach to providing technical support. It covers problem-solving techniques, the sharing of solutions, and the role of community support in overcoming technical challenges.",                                                             
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 9,
  "topicName": "Project viability",                
  "description": "Examines strategies for the planning, execution, and maintenance of projects with a focus on ensuring their long-term sustainability. Discusses the stages of project development and the importance of strategic planning in project success.",                        
  "date_added": "2024-04-07",
  "status": "active"
}'
'{
  "id": 10,
  "topicName": "General technical conversations",  
  "description": "This topic might cover a variety of technical discussions that span beyond the specialized topics covered elsewhere. Wide-ranging conversations about software design principles, architecture, emerging technologies, and exploratory debates on new methodologies. It might cover general topics that do not relate directly to Cardano development.",
  "date_added": "2024-04-07",
  "status": "active"
}'
)

# Loop through each topic and post it to Elasticsearch
for topic in "${topics[@]}"; do
  id=$(echo $topic | jq '.id')  # Extracting the ID from the JSON
  curl -X POST "$BASE_URL/$id" -H "Content-Type: application/json" -d "$topic"
  echo "Posted topic id $id to Elasticsearch"
done
