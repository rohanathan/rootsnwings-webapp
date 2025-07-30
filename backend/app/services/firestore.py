from google.cloud import firestore
from google.oauth2 import service_account
from app.config import settings

credentials = service_account.Credentials.from_service_account_file(
    settings.GOOGLE_CREDENTIALS
)
db = firestore.Client(project=settings.PROJECT_ID, credentials=credentials)
