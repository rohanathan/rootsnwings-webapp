from fastapi import APIRouter, Query, Depends
from typing import List
from app.models.mentor_models import MentorListResponse, FeaturedMentorsResponse, MentorResponse, MentorSearchQuery
from app.services.mentor_service import (
    search_mentors, fetch_all_mentors, fetch_featured_mentors, 
    fetch_mentor_by_id, get_mentor_categories, get_mentor_cities
)
from app.services.class_service import get_classes_by_mentor_id
from app.models.class_models import MentorClassesResponse

router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"]
)

@router.get("/", response_model=MentorListResponse)
def get_mentors(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page"),
    sortBy: str = Query("avgRating", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc")
):
    """
    Get all approved mentors with pagination and sorting.
    """
    mentors, total = fetch_all_mentors(page, pageSize)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "mentors": mentors,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/search", response_model=MentorListResponse)
def search_mentors_endpoint(
    q: str = Query(None, description="Search in name, headline, bio, tags"),
    category: str = Query(None, description="Filter by category"),
    city: str = Query(None, description="Filter by city"),
    country: str = Query(None, description="Filter by country"),
    teachingMode: str = Query(None, description="Filter by teaching mode"),
    teachingLevel: str = Query(None, description="Filter by teaching level"),
    ageGroup: str = Query(None, description="Filter by age group"),
    language: str = Query(None, description="Filter by language"),
    minRating: float = Query(None, ge=0, le=5, description="Minimum rating"),
    maxRate: float = Query(None, ge=0, description="Maximum hourly rate"),
    isVerified: bool = Query(None, description="Filter by verification status"),
    acceptingStudents: bool = Query(None, description="Filter by accepting students"),
    sortBy: str = Query("avgRating", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Search mentors with advanced filtering, sorting, and pagination.
    
    This endpoint allows you to:
    - Search by text in name, headline, bio, and tags
    - Filter by location, category, teaching preferences
    - Filter by rating, rates, verification status
    - Sort by rating, reviews, rate, or creation date
    - Paginate through results
    """
    search_query = MentorSearchQuery(
        q=q,
        category=category,
        city=city,
        country=country,
        teachingMode=teachingMode,
        teachingLevel=teachingLevel,
        ageGroup=ageGroup,
        language=language,
        minRating=minRating,
        maxRate=maxRate,
        isVerified=isVerified,
        acceptingStudents=acceptingStudents,
        sortBy=sortBy,
        sortOrder=sortOrder,
        page=page,
        pageSize=pageSize
    )
    
    mentors, total = search_mentors(search_query)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "mentors": mentors,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/featured", response_model=FeaturedMentorsResponse)
def get_featured_mentors(limit: int = Query(6, ge=1, le=20, description="Number of featured mentors")):
    """
    Get featured mentors based on performance metrics.
    Mentors are ranked by rating, student retention, and responsiveness.
    """
    return {"featured": fetch_featured_mentors(limit)}

@router.get("/categories", response_model=List[str])
def get_mentor_categories_list():
    """
    Get list of all available mentor categories.
    Useful for populating filter dropdowns.
    """
    return get_mentor_categories()

@router.get("/cities", response_model=List[str])
def get_mentor_cities_list():
    """
    Get list of all cities where mentors are available.
    Useful for populating location filters.
    """
    return get_mentor_cities()

@router.get("/{mentor_id}", response_model=MentorResponse)
def get_mentor_by_id(mentor_id: str):
    """
    Get detailed information about a specific mentor.
    """
    mentor = fetch_mentor_by_id(mentor_id)
    return {"mentor": mentor}

@router.get("/{mentor_id}/classes", response_model=MentorClassesResponse)
def get_mentor_classes(mentor_id: str):
    """
    Get all approved classes and workshops offered by this mentor.
    """
    classes = get_classes_by_mentor_id(mentor_id)
    return {"classes": classes}

