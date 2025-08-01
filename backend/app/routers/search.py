from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional, List
from app.models.class_models import ClassItem
from app.services import search_service

# Using a dedicated /search router is cleaner.
# Note the prefix change from "/classes" to "/search"
router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/classes", response_model=List[ClassItem])
def search_classes_endpoint(
    # Using Query() adds validation and improves the auto-generated API docs.
    category: Optional[str] = Query(None, description="Filter by class category"),
    city: Optional[str] = Query(None, description="Filter by city"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    level: Optional[str] = Query(None, description="Filter by difficulty level"),
    ageGroup: Optional[str] = Query(None, alias="age_group", description="Filter by age group"),
    format: Optional[str] = Query(None, alias="class_format", description="Filter by class format"),
    isOnline: Optional[bool] = Query(None, alias="is_online", description="Filter for online classes"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Filter by minimum mentor rating")
):
    """
    Performs a multi-filter search for classes. This endpoint will now correctly
    raise an error if a Firestore composite index is missing.
    """
    try:
        results = search_service.search_classes_with_filters(
            category=category,
            city=city,
            subject=subject,
            level=level,
            age_group=ageGroup,
            class_format=format,
            is_online=isOnline,
            min_rating=min_rating
        )
        return results
    except Exception as e:
        # This catches the error from the service and returns a helpful message.
        raise HTTPException(
            status_code=400,
            detail=f"Firestore query failed. This indicates a missing composite index. "
                   f"Check your backend terminal logs for the error message from Google, "
                   f"which includes a URL to create the required index. "
                   f"Original Error: {e}"
        )

