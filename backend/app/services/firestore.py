from google.cloud import firestore
from google.oauth2 import service_account
from app.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# Initialize Firestore client
def initialize_firestore():
    try:
        # Try to use service account file if available
        if os.path.exists(settings.GOOGLE_CREDENTIALS):
            logger.info(f"Using service account file: {settings.GOOGLE_CREDENTIALS}")
            credentials = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_CREDENTIALS
            )
            return firestore.Client(project=settings.PROJECT_ID, credentials=credentials)
        else:
            # Use default credentials (works on Cloud Run, GCE, etc.)
            logger.info("Using default credentials (Cloud Run/GCE)")
            return firestore.Client(project=settings.PROJECT_ID)
    except Exception as e:
        logger.error(f"Failed to initialize Firestore: {e}")
        # For development/testing, create a mock client that will fail gracefully
        raise RuntimeError(f"Firestore initialization failed: {e}")

db = initialize_firestore()
