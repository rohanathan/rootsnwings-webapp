from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.class_models import ClassItem, ClassListResponse, FeaturedClassResponse, WorkshopListResponse, ClassSearchQuery
from app.services.class_service import (
    search_classes, fetch_all_classes, fetch_all_workshops, fetch_featured_classes,
    fetch_upcoming_workshops, fetch_class_by_id, get_class_categories, get_class_subjects,
    create_class, update_class_flexible, approve_class
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
    mentorId: str = Query(None, description="Filter classes by specific mentor ID"),
    mentorName: str = Query(None, description="Filter classes by mentor name"),
    minRating: float = Query(None, ge=0, le=5, description="Minimum mentor rating"),
    maxPrice: float = Query(None, ge=0, description="Maximum price per session"),
    minPrice: float = Query(None, ge=0, description="Minimum price per session"),
    upcoming: bool = Query(None, description="Filter upcoming workshops only"),
    isRecurring: bool = Query(None, description="Filter recurring classes"),
    hasAvailability: bool = Query(None, description="Filter classes with available spots"),
    startDateFrom: str = Query(None, description="Classes starting from date (YYYY-MM-DD)"),
    startDateTo: str = Query(None, description="Classes starting before date (YYYY-MM-DD)"),
    status: str = Query(None, description="Filter by class status: approved, pending_approval, rejected"),
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
    - /classes?mentorId=user026&status=approved - Get approved classes by specific mentor
    - /classes?mentorName=Sarah&subject=anime - Find anime classes by mentors named Sarah
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
        mentorId=mentorId,
        mentorName=mentorName,
        minRating=minRating,
        maxPrice=maxPrice,
        minPrice=minPrice,
        isRecurring=isRecurring,
        hasAvailability=hasAvailability,
        startDateFrom=startDateFrom,
        startDateTo=startDateTo,
        status=status,
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

@router.post("/")
def create_new_class(class_data: dict):
    """
    Create a new class with auto-generated searchMetadata.
    
    The class will be created with status 'pending_approval' and include:
    - Auto-generated searchMetadata for AI-powered search
    - Approval workflow initialization
    - System timestamps
    
    Example payload:
    {
        "type": "group",
        "title": "Beginner Guitar Lessons", 
        "subject": "guitar",
        "category": "Music",
        "description": "Learn basic guitar chords and techniques",
        "mentorId": "user123",
        "level": "beginner",
        "ageGroup": "adult",
        "format": "online",
        "pricing": {
            "perSessionRate": 35.0,
            "totalSessions": 8,
            "currency": "GBP"
        },
        "schedule": {
            "startDate": "2025-09-01",
            "endDate": "2025-10-20", 
            "weeklySchedule": [
                {"day": "Tuesday", "startTime": "18:00", "endTime": "19:00"}
            ],
            "sessionDuration": 60
        },
        "capacity": {
            "maxStudents": 6,
            "minStudents": 2
        }
    }
    """
    class_id = create_class(class_data)
    return {
        "message": "Class created successfully",
        "classId": class_id,
        "status": "pending_approval"
    }

@router.put("/{class_id}")
def update_existing_class(class_id: str, update_data: dict):
    """
    Pure MongoDB-style flexible class updates.
    
    Frontend can send ANY field it wants:
    - { "title": "New title" }
    - { "pricing.perSessionRate": 40.0, "capacity.maxStudents": 10 }
    - { "status": "approved", "customField": "value" }
    - { "schedule": {...}, "anyField": "anyValue" }
    """
    updated_class = update_class_flexible(class_id, update_data)
    return {"class": updated_class}

@router.post("/{class_id}/approve")
def approve_existing_class(class_id: str, admin_notes: str = ""):
    """
    Approve a class and finalize searchMetadata.
    
    This endpoint is typically used by admin users to approve pending classes.
    """
    success = approve_class(class_id, admin_notes)
    if success:
        return {
            "message": "Class approved successfully",
            "classId": class_id,
            "status": "approved"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to approve class")



