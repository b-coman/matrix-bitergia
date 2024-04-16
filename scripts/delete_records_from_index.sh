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
IDS="5c7e1bddf20c1384f8633c9e73657b98,be79a4b29e02a5875a3be3b0ee8ab0e7,39d9d0f64ae3a3d5e7b66f30eaa8addb,4756f6590cbaa44548f81e7f8f9dba2e,666b6a7d39531c34b7ba2ee2ce3aa175,0c903f9448fb90d99d361fdba3cac828,50fa6e2623518bcb91d369e3f3304e56,cb24af6c135dba63e2035e9fd3407c74,9740e817e2198e4afe5b8e119ddd5eab,f64b87047a749778186f1cdbd63d61c9,75f6c80def37ba8d30072ee18d1db1fd,feb6031874c896c1deea2cbabae0d10d,f9e3bb0483adef86b00b9eab53197156,4d3169a3e3e57cc88bdf6baa5f250844,ceb1399abf982fcecd9275a5326c3b4a,fa693827d66f1e04417ef284b97cdeae,afd119203e786d7014f71e3e396a8e15,54c7f093045d7eb3a9a1c0eca0536f0b,612d6786d2edfbcd0f3d94e889719beb,c9569e5e8ebaea7df92966f9fbdd57f3,e53b1cb4227195ef82b63b0153ff0ecc,7be6940b3df0d5ba66d6c8485e02c93b,bf210139d7219b484132622c5c912985,72e8c18e3c389c700d3f6b93a80bb190,41900d484288bf21b3e2c2f223aa5a95,c9854dda53b4036cb45014e154325fa3,d9a73fa7a4514a424ece85b874b0f3c6,db761ba75e3d91543f55395f5e46c0ee"

# Convert comma-separated IDs to an array
IFS=',' read -r -a id_array <<< "$IDS"

# Prepare bulk delete data
BULK_DATA=""
for id in "${id_array[@]}"; do
    BULK_DATA+="{ \"delete\": { \"_index\": \"$INDEX_NAME\", \"_id\": \"$id\" } }\n"
done

# Send the bulk delete request
echo -e "$BULK_DATA" | curl -X POST "$ELASTICSEARCH_URL/_bulk" -H "Content-Type: application/x-ndjson" --data-binary @-
