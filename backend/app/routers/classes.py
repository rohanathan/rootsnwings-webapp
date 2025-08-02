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
def get_all_classes(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page"),
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc")
):
    """
    Get all batch classes with pagination and sorting.
    """
    classes, total = fetch_all_classes(page, pageSize)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "classes": classes,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/search", response_model=ClassListResponse)
def search_classes_endpoint(
    q: str = Query(None, description="Search in title, description, subject"),
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
    isRecurring: bool = Query(None, description="Filter recurring classes"),
    hasAvailability: bool = Query(None, description="Filter classes with available spots"),
    startDateFrom: str = Query(None, description="Classes starting from date (YYYY-MM-DD)"),
    startDateTo: str = Query(None, description="Classes starting before date (YYYY-MM-DD)"),
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Search classes with advanced filtering, sorting, and pagination.
    
    This endpoint allows you to:
    - Search by text in title, description, subject
    - Filter by type, category, level, format, location
    - Filter by pricing, rating, availability
    - Filter by date ranges
    - Sort by various fields
    - Paginate through results
    
    Note: Some filter combinations may require Firestore composite indexes.
    """
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

@router.get("/featured", response_model=FeaturedClassResponse)
def get_featured_classes(limit: int = Query(6, ge=1, le=20, description="Number of featured classes")):
    """
    Get featured classes based on performance metrics.
    Classes are ranked by mentor rating and enrollment rate.
    """
    return {"featured": fetch_featured_classes(limit)}

@router.get("/workshops", response_model=WorkshopListResponse)
def get_all_workshops(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all workshops with pagination.
    """
    workshops, total = fetch_all_workshops(page, pageSize)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "workshops": workshops,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/workshops/upcoming", response_model=WorkshopListResponse)
def get_upcoming_workshops(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get upcoming workshops (starting from today) with pagination.
    """
    workshops, total = fetch_upcoming_workshops(page, pageSize)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "workshops": workshops,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/categories", response_model=List[str])
def get_class_categories_list():
    """
    Get list of all available class categories.
    Useful for populating filter dropdowns.
    """
    return get_class_categories()

@router.get("/subjects", response_model=List[str])
def get_class_subjects_list():
    """
    Get list of all available class subjects.
    Useful for populating filter dropdowns.
    """
    return get_class_subjects()

@router.get("/{class_id}", response_model=ClassItem)
def get_class_by_id(class_id: str):
    """
    Get detailed information about a specific class.
    """
    class_item = fetch_class_by_id(class_id)
    if not class_item:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_item


