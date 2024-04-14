#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | awk '/=/ {print $1}')
fi

# Set the active subscription
az account set --subscription $AZURE_SUBSCRIPTION_ID

# Retrieve storage account key
STORAGE_KEY=$(az storage account keys list \
    --resource-group cardano \
    --account-name elasticdata3005 \
    --query "[0].value" --output tsv)

# Create the container instance with mounted Azure File Share and public IP
az container create \
    --resource-group cardano \
    --name my-elastic7 \
    --image bcoman.azurecr.io/my-bcoman-elasticsearch:7.10.0 \
    --ports 9200 9300 \
    --dns-name-label my-elastic7 \
    --azure-file-volume-account-name elasticdata3005 \
    --azure-file-volume-account-key $STORAGE_KEY \
    --azure-file-volume-share-name elastic-data \
    --azure-file-volume-mount-path /usr/share/elasticsearch/data \
    --registry-login-server bcoman.azurecr.io \
    --registry-username bcoman \
    --registry-password $AZURE_REGISTRY_PASSWORD \
    --restart-policy OnFailure \
    --location eastus \
    --cpu 1 \
    --memory 2 \
    --os-type Linux
