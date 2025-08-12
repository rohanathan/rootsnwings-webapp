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
from app.routers import auth
from app.routers import user_onboarding
from app.routers import messages
from fastapi.staticfiles import StaticFiles  
import os

app = FastAPI(
    title="Roots & Wings API",
    description="FastAPI backend for Roots & Wings on GCP",
    version="0.1.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development
        "http://localhost:3001",  # Alternative dev port
        "http://127.0.0.1:3000",  # Local development alternative
        "https://*.vercel.app",   # Vercel deployments
        "https://rootsnwings.com",  # Production domain
        "https://www.rootsnwings.com",  # WWW version
        # Add more domains as needed
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include modular routes
app.include_router(auth.router)
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

# Create uploads directory if it doesn't exist
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
            "bookings": "/bookings/",
            "reviews": "/reviews/"
        }
    }
