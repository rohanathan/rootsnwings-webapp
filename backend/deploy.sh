#!/bin/bash

# Roots & Wings API - Cloud Run Deployment Script
# Run this from the backend directory

set -e

# Configuration - UPDATE THESE VALUES
PROJECT_ID="rootsnwings-465610"
SERVICE_NAME="rootsnwings-api"
REGION="europe-west2"  # London region
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Starting deployment to Google Cloud Run..."

# Step 1: Set the project
echo "📋 Setting GCP project to $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 3: Build and push the container
echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "📤 Pushing image to Container Registry..."
docker push $IMAGE_NAME:latest

# Step 4: Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1000m \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300s \
  --port 8080 \
  --set-env-vars ENVIRONMENT=production

# Step 5: Get the service URL
echo "🌐 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment completed successfully!"
echo "🔗 Service URL: $SERVICE_URL"
echo "📊 Health check: $SERVICE_URL/health"
echo "📖 API docs: $SERVICE_URL/docs"
echo ""
echo "🔧 Next steps:"
echo "1. Update your frontend CORS origins in main.py"
echo "2. Test the API endpoints"
echo "3. Set up custom domain (optional)"
echo "4. Configure monitoring and logging"