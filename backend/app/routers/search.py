# app/routers/search.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.models.class_models import ClassItem # Assuming you have a Pydantic model
from app.services import search_service # Import the corrected service

# It's better to have the search endpoint under a /search prefix
router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/classes", response_model=List[ClassItem])
def search_classes_endpoint(
    # Use Depends for cleaner function signature if you have many params,
    # but direct annotation is fine too.
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = None,
    q: Optional[str] = None # For keyword search
):
    """
    Searches for classes using multiple optional filters.
    This endpoint will now correctly trigger a Firestore error if an index is missing.
    """
    try:
        results = search_service.search_classes_with_filters(
            category=category,
            city=city,
            min_rating=min_rating,
            q=q
        )
        return results
    except Exception as e:
        # This ensures the detailed Firestore error is sent back to the developer.
        raise HTTPException(
            status_code=400, 
            detail=f"An error occurred with the search query. This likely requires a new composite index in Firestore. Original error: {e}"
        )

