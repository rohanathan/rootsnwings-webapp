from fastapi import FastAPI
from app.routers import mentors
from app.routers import classes
from app.routers import search
from app.routers import bookings
from app.routers import users
from app.routers import payments
from app.routers import debug
from fastapi.staticfiles import StaticFiles  
import os

app = FastAPI(
    title="Roots & Wings API",
    description="FastAPI backend for Roots & Wings on GCP",
    version="0.1.0"
)

# Include modular routes
app.include_router(mentors.router)
app.include_router(classes.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(debug.router)

# Create uploads directory if it doesn't exist
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    os.makedirs(os.path.join(uploads_dir, "profile-images"))

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "ok"}
