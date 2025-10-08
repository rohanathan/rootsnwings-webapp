from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mentors
from app.routers import classes
from app.routers import search
from app.routers import bookings
from app.routers import users
from app.routers import payments
from app.routers import availability
from app.routers import reviews
from app.routers import metadata
from app.routers import firebase_auth
from app.routers import user_onboarding
from app.routers import messages
from app.routers import young_learners
from app.ai import ai_router
from fastapi.staticfiles import StaticFiles  
import os
import logging
import firebase_admin
from firebase_admin import credentials
import json

# Set up a loggers
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Roots & Wings API",
    description="FastAPI backend for Roots & Wings on GCP",
    version="0.1.0",
    redirect_slashes=False  # Disable auto trailing slash redirects
)

# --- Firebase Initialization ---
def initialize_firebase():
    """Initialize Firebase Admin SDK based on the environment."""
    # KUBERNETES_SERVICE_HOST is always present in a GKE pod.
    is_kubernetes_env = os.getenv('KUBERNETES_SERVICE_HOST')

    # GOOGLE_CLOUD_PROJECT is usually set in GCP environments.
    is_gcp_project = os.getenv('GOOGLE_CLOUD_PROJECT')

    # Define the environment as 'production' if it's running in Kubernetes or Cloud Run.
    is_production = bool(is_kubernetes_env or os.getenv('K_SERVICE'))

    # Environment supplied credentials
    service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')

    try:
        # Check if the app is already initialized to prevent errors.
        if firebase_admin._apps:
            logger.info("Firebase Admin SDK already initialized; skipping re-initialization.")
            return

        cred = None

        if service_account_json:
            logger.info("Initializing Firebase using FIREBASE_SERVICE_ACCOUNT_JSON environment variable.")
            try:
                cred_dict = json.loads(service_account_json)
                cred = credentials.Certificate(cred_dict)
            except json.JSONDecodeError as decode_error:
                logger.error("Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON environment variable.")
                raise decode_error
        elif service_account_path and os.path.exists(service_account_path):
            logger.info("Initializing Firebase using GOOGLE_APPLICATION_CREDENTIALS file.")
            cred = credentials.Certificate(service_account_path)
        elif is_production:
            # --- PRODUCTION PATH (ON GKE/CLOUD RUN) ---
            # On GKE, this path uses Application Default Credentials (ADC)
            # provided by Workload Identity.
            logger.info("Production environment detected. Initializing Firebase SDK with Application Default Credentials...")
            cred = credentials.ApplicationDefault()
        else:
            # --- LOCAL DEVELOPMENT PATH ---
            logger.info("Local environment detected. Initializing Firebase SDK with service account key file...")
            default_service_account_path = "secrets/serviceAccountKey.json"

            if not os.path.exists(default_service_account_path):
                error_msg = (
                    f"Service account key not found at {default_service_account_path}. "
                    "Please ensure the file exists for local development."
                )
                logger.error(error_msg)
                raise FileNotFoundError(error_msg)

            cred = credentials.Certificate(default_service_account_path)

        if cred:
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()

        logger.info("Firebase Admin SDK initialized successfully.")

    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
        raise e

# Initialize Firebase Admin SDK at startup
initialize_firebase()

# Configure CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development
        "http://localhost:3001",  # Alternative dev port
        "http://127.0.0.1:3000",  # Local development alternative
        "https://*.vercel.app",   # Vercel deployments
        "https://rootsnwings.com",  # Production domain
        "https://www.rootsnwings.com",  # WWW version
        "https://frontend-944856745086.europe-west2.run.app",  # Cloud Run frontend
        "https://rootsnwings-frontend-944856745086.europe-west2.run.app",  # Alternative naming
        "*"  # Allow all origins for debugging (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include modular routes
app.include_router(firebase_auth.router)
app.include_router(user_onboarding.router)
app.include_router(mentors.router)
app.include_router(classes.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(availability.router)
app.include_router(reviews.router)
app.include_router(metadata.router)
app.include_router(messages.router)
app.include_router(young_learners.router)
app.include_router(ai_router.router, prefix="/ai", tags=["ai"])

# Create uploads directory if it does not exist
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    os.makedirs(os.path.join(uploads_dir, "profile-images"))

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Roots & Wings API",
        "version": "0.1.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "endpoints": {
            "docs": "/docs",
            "mentors": "/mentors/",
            "availability": "/availability/",
            "qualifications": "/qualifications/",
            "bookings": "/bookings",
            "reviews": "/reviews",
            "young-learners": "/young-learners/"
        }
    }
