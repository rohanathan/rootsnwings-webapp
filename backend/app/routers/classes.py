from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.class_models import ClassItem, ClassListResponse, FeaturedClassResponse, WorkshopListResponse, ClassSearchQuery
from app.services.class_service import (
    search_classes, fetch_all_classes, fetch_all_workshops, fetch_featured_classes,
    fetch_upcoming_workshops, fetch_class_by_id, get_class_categories, get_class_subjects
)

router = APIRouter(
    prefix="/classes",
    tags=["Classes"]
)

@router.get("/", response_model=ClassListResponse)
def get_classes(
    # Search & Filter Parameters
    q: str = Query(None, description="Search in title, description, subject"),
    featured: bool = Query(None, description="Get featured classes only"),
    type: str = Query(None, description="Class type: one-on-one, batch, workshop"),
    category: str = Query(None, description="Class category"),
    subject: str = Query(None, description="Subject of the class"),
    level: str = Query(None, description="Class level: beginner, intermediate, advanced"),
    ageGroup: str = Query(None, description="Age group: child, teen, adult"),
    format: str = Query(None, description="Class format: online, in-person, hybrid"),
    city: str = Query(None, description="City location"),
    country: str = Query(None, description="Country location"),
    minRating: float = Query(None, ge=0, le=5, description="Minimum mentor rating"),
    maxPrice: float = Query(None, ge=0, description="Maximum price per session"),
    minPrice: float = Query(None, ge=0, description="Minimum price per session"),
    upcoming: bool = Query(None, description="Filter upcoming workshops only"),
    isRecurring: bool = Query(None, description="Filter recurring classes"),
    hasAvailability: bool = Query(None, description="Filter classes with available spots"),
    startDateFrom: str = Query(None, description="Classes starting from date (YYYY-MM-DD)"),
    startDateTo: str = Query(None, description="Classes starting before date (YYYY-MM-DD)"),
    # Pagination & Sorting
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Unified classes endpoint with search, filtering, and pagination.
    
    Examples:
    - /classes - Get all classes
    - /classes?featured=true - Get featured classes
    - /classes?type=workshop&upcoming=true - Get upcoming workshops
    - /classes?q=guitar&level=beginner - Search beginner guitar classes
    """
    
    # Handle featured classes
    if featured is True:
        classes = fetch_featured_classes(pageSize if pageSize <= 20 else 6)
        return {
            "classes": classes,
            "total": len(classes),
            "page": 1,
            "pageSize": len(classes),
            "totalPages": 1
        }
    
    # Handle workshops with upcoming filter
    if type == "workshop":
        if upcoming is True:
            workshops, total = fetch_upcoming_workshops(page, pageSize)
        else:
            workshops, total = fetch_all_workshops(page, pageSize)
        
        total_pages = (total + pageSize - 1) // pageSize
        return {
            "classes": workshops,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": total_pages
        }
    
    # Handle search/filter or get all classes
    search_query = ClassSearchQuery(
        q=q,
        type=type,
        category=category,
        subject=subject,
        level=level,
        ageGroup=ageGroup,
        format=format,
        city=city,
        country=country,
        minRating=minRating,
        maxPrice=maxPrice,
        minPrice=minPrice,
        isRecurring=isRecurring,
        hasAvailability=hasAvailability,
        startDateFrom=startDateFrom,
        startDateTo=startDateTo,
        sortBy=sortBy,
        sortOrder=sortOrder,
        page=page,
        pageSize=pageSize
    )
    
    classes, total = search_classes(search_query)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "classes": classes,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/{class_id}")
def get_class_by_id(class_id: str):
    """
    Get detailed information about a specific class.
    
    Examples:
    - /classes/class_anime_001 - Get class details
    """
    class_item = fetch_class_by_id(class_id)
    if not class_item:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"class": class_item}


