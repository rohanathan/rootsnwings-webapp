import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env from backend folder

class Settings:
    PROJECT_ID: str = os.getenv("PROJECT_ID")
    GOOGLE_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    FIRESTORE_LOCATION: str = os.getenv("FIRESTORE_LOCATION")
    ENV: str = os.getenv("ENV")
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
