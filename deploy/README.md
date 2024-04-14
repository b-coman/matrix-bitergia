# Deployment Scripts

This directory contains scripts for deploying the application components to Azure.

## Scripts

- `setup_elastic_aci.sh`: This script deploys Elasticsearch to Azure Container Instances with persistent storage.
- `setup_kibana_aci.sh`: This script deploys Kibana to Azure Container Instances and configures it to connect to the deployed Elasticsearch instance.
- `populate_topicIndex.sh`: This script initializes the Elasticsearch index with predefined topics.


## Usage

### Deploying Elasticsearch

Run the following command to deploy Elasticsearch:
    bash deploy/setup_elastic_aci.sh


Don't forget to assign execution rights to the script first:

    chmod +x deploy/setup_elastic_aci.sh

### Deploying Kibana

Run the following command to deploy Kibana:

    bash deploy/setup_kibana_aci.sh

Don't forget to assign execution rights to the script first:

    chmod +x deploy/setup_kibana_aci.sh

### Populating Topic Index
Run the following command to populate the Elasticsearch topic index:

    bash deploy/populate_topicIndex.sh

Don't forget to assign execution rights to the script first:

    chmod +x deploy/populate_topicIndex.sh

