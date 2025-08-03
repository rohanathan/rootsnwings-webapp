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

settings = Settings()
