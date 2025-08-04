# 🚀 Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Docker** installed locally
3. **Google Cloud SDK** (`gcloud`) installed and authenticated
4. **Service Account Key** for Firebase Admin (in secrets folder)

## Quick Deployment

### 1. Update Configuration

Update these values in `deploy.sh`:
```bash
PROJECT_ID="your-actual-gcp-project-id"
SERVICE_NAME="rootsnwings-api"
REGION="europe-west2"  # or your preferred region
```

### 2. Update CORS Origins

In `app/main.py`, update the CORS origins:
```python
allow_origins=[
    "http://localhost:3000",  # Development
    "https://your-frontend-domain.vercel.app",  # Production
    "https://rootsnwings.com",  # Your domain
],
```

### 3. Deploy

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

## Production Considerations

### Security
- ✅ Non-root user in Docker container
- ✅ Environment variables for secrets
- ✅ CORS configured
- ✅ HTTPS enforced by Cloud Run
- ⚠️ Consider adding rate limiting
- ⚠️ Add API authentication for sensitive endpoints

### Performance
- ✅ Memory: 1Gi (sufficient for FastAPI)
- ✅ CPU: 1000m (1 vCPU)
- ✅ Concurrency: 80 requests per instance
- ✅ Auto-scaling: 0-10 instances
- ✅ Health checks configured

### Monitoring
```bash
# View logs
gcloud logs read --service=rootsnwings-api --limit=50

# Monitor metrics
gcloud run services describe rootsnwings-api --region=europe-west2
```

### Environment Variables

Set these in Cloud Run (if needed):
```bash
gcloud run services update rootsnwings-api \
  --region=europe-west2 \
  --set-env-vars ENVIRONMENT=production,LOG_LEVEL=INFO
```

### Custom Domain (Optional)

1. Map custom domain:
```bash
gcloud run domain-mappings create \
  --service=rootsnwings-api \
  --domain=api.rootsnwings.com \
  --region=europe-west2
```

2. Update DNS records as instructed by gcloud

## Testing Deployment

1. **Health Check**
```bash
curl https://your-service-url.run.app/health
```

2. **API Documentation**
Visit: `https://your-service-url.run.app/docs`

3. **Test Endpoints**
```bash
# Get mentors
curl https://your-service-url.run.app/mentors/

# Check availability
curl "https://your-service-url.run.app/availability/mentors/user026"
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker builds locally first
   - Verify requirements_prod.txt is valid

2. **Service Account Issues**
   - Ensure serviceAccountKey.json is in secrets folder
   - Check Firebase project permissions

3. **CORS Errors**
   - Update allow_origins in main.py
   - Redeploy after changes

4. **Memory Issues**
   - Monitor memory usage in Cloud Console
   - Increase memory limit if needed

### Useful Commands

```bash
# View service details
gcloud run services describe rootsnwings-api --region=europe-west2

# Update service
gcloud run services update rootsnwings-api --region=europe-west2 --memory=2Gi

# View logs
gcloud logs tail --service=rootsnwings-api

# Delete service
gcloud run services delete rootsnwings-api --region=europe-west2
```

## Cost Optimization

- ✅ Min instances: 0 (no cold start costs)
- ✅ Auto-scaling based on traffic
- ✅ Only pay for actual requests
- 💡 Consider Cloud Scheduler for health checks if needed

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Configure monitoring alerts
3. Add API versioning
4. Implement rate limiting
5. Set up backup strategies for Firestore