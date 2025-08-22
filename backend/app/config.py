import os
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

class Settings:
    PROJECT_ID: str = os.getenv("PROJECT_ID", "rootsnwings-465610")
    GOOGLE_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "secrets/serviceAccountKey.json")
    FIRESTORE_LOCATION: str = os.getenv("FIRESTORE_LOCATION", "europe-west2")
    ENV: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", 8080))
    
    # Stripe Configuration (already configured in Secret Manager for production)
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
    stripe_publishable_key: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_...")
    
    # Frontend URL for Stripe redirects (localhost for now, update via env var later)
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Google AI (Gemini) Configuration
    google_ai_api_key: str = os.getenv("GOOGLE_AI_API_KEY", "")

settings = Settings()
