#!/bin/bash

# Exit on error
set -e

# Configuration
SERVICE_NAME="business-opportunity-finder"
REGION="us-central1"

# Check if .env file exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found. Please create one with YELP_API_KEY and GEMINI_API_KEY."
  exit 1
fi

echo "Deploying $SERVICE_NAME to Cloud Run..."

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars YELP_API_KEY="$YELP_API_KEY",GEMINI_API_KEY="$GEMINI_API_KEY"

echo "Deployment complete!"
