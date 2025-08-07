from fastapi import APIRouter, Query, Depends
from typing import List
from app.models.mentor_models import MentorListResponse, FeaturedMentorsResponse, MentorResponse, MentorSearchQuery, Mentor
from app.services.mentor_service import (
    search_mentors, fetch_all_mentors, fetch_featured_mentors, 
    fetch_mentor_by_id, get_mentor_categories, get_mentor_cities, update_mentor
)
from app.services.class_service import get_classes_by_mentor_id
from app.models.class_models import MentorClassesResponse

router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"]
)

@router.get("/", response_model=MentorListResponse)
def get_mentors(
    # Search & Filter Parameters
    q: str = Query(None, description="Search in name, headline, bio, tags"),
    featured: bool = Query(None, description="Get featured mentors only"),
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
    # Pagination & Sorting
    sortBy: str = Query("avgRating", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Unified mentors endpoint with search, filtering, and pagination.
    
    Examples:
    - /mentors - Get all mentors
    - /mentors?featured=true - Get featured mentors
    - /mentors?q=guitar&city=london - Search guitar mentors in London
    - /mentors?category=music&minRating=4.5 - Music mentors with high ratings
    """
    
    # Handle featured mentors
    if featured is True:
        mentors = fetch_featured_mentors(pageSize if pageSize <= 20 else 6)
        return {
            "mentors": mentors,
            "total": len(mentors),
            "page": 1,
            "pageSize": len(mentors),
            "totalPages": 1
        }
    
    # Handle search/filter (if any parameters provided) or get all
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

@router.get("/{mentor_id}")
def get_mentor_by_id(
    mentor_id: str,
    include_classes: bool = Query(False, description="Include mentor's classes in response")
):
    """
    Get detailed information about a specific mentor.
    
    Examples:
    - /mentors/user026 - Get mentor details only
    - /mentors/user026?include_classes=true - Get mentor with their classes
    """
    mentor = fetch_mentor_by_id(mentor_id)
    
    response = {"mentor": mentor}
    
    if include_classes:
        classes = get_classes_by_mentor_id(mentor_id)
        response["classes"] = classes
    
    return response

@router.put("/{mentor_id}", response_model=MentorResponse)
def update_mentor_profile(mentor_id: str, mentor_data: dict):
    """
    Update mentor profile with all fields exposed for frontend editing.
    
    Frontend can update any mentor field:
    - Profile info (displayName, headline, bio, photoURL)  
    - Teaching details (subjects, levels, ageGroups, teachingModes)
    - Location (city, country, coordinates)
    - Pricing (oneOnOneRate, groupRate, firstSessionFree)
    - Qualifications, languages, searchKeywords
    - Admin fields (isVerified, acceptingStudents, featuredRank)
    
    Example:
    PUT /mentors/user026
    {
      "headline": "Updated headline",
      "bio": "Updated bio text",
      "subjects": ["anime", "character design", "digital art"],
      "pricing": {
        "oneOnOneRate": 45.0,
        "groupRate": 25.0,
        "currency": "GBP"
      },
      "acceptingStudents": true
    }
    """
    mentor = update_mentor(mentor_id, mentor_data)
    return {"mentor": mentor}

