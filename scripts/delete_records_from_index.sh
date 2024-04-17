#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | awk '/=/ {print $1}')
fi

# Base URL for Elasticsearch
ELASTICSEARCH_URL="${ELASTICSEARCH_NODE}"

# Index from which to delete documents
INDEX_NAME="matrix_daily_topics_index"

# Document IDs to delete, provided as a comma-separated list
IDS="36691234029cfe40f64ce8558dc87613"

# Convert comma-separated IDs to an array
IFS=',' read -r -a id_array <<< "$IDS"

# Prepare bulk delete data
BULK_DATA=""
for id in "${id_array[@]}"; do
    BULK_DATA+="{ \"delete\": { \"_index\": \"$INDEX_NAME\", \"_id\": \"$id\" } }\n"
done

# Send the bulk delete request
echo -e "$BULK_DATA" | curl -X POST "$ELASTICSEARCH_URL/_bulk" -H "Content-Type: application/x-ndjson" --data-binary @-
