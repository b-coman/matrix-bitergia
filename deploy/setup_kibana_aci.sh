#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | awk '/=/ {print $1}')
fi

# Set the active subscription
az account set --subscription $AZURE_SUBSCRIPTION_ID

# Create the container instance for Kibana
az container create \
    --resource-group cardano \
    --name my-kibana7 \
    --image docker.elastic.co/kibana/kibana:7.10.0 \
    --ports 5601 \
    --dns-name-label my-kibana7 \
    --environment-variables 'ELASTICSEARCH_HOSTS=["http://my-elastic7.eastus.azurecontainer.io:9200"]' \
    --restart-policy OnFailure \
    --location eastus \
    --cpu 1 \
    --memory 2 \
    --os-type Linux

