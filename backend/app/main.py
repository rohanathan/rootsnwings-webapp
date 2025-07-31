from fastapi import FastAPI
from app.routers import mentors
from app.routers import classes
from app.routers import search

app = FastAPI(
    title="Roots & Wings API",
    description="FastAPI backend for Roots & Wings on GCP",
    version="0.1.0"
)

# Include modular routes
app.include_router(mentors.router)
app.include_router(classes.router)
app.include_router(search.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
