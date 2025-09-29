from fastapi import APIRouter, Query, Depends
from typing import List
from app.models.mentor_models import MentorListResponse, FeaturedMentorsResponse, MentorResponse, MentorSearchQuery, Mentor
from app.services.mentor_service import (
    search_mentors, fetch_all_mentors, fetch_featured_mentors, 
    fetch_mentor_by_id, get_mentor_categories, get_mentor_cities, update_mentor_flexible
)
from app.services.class_service import get_classes_by_mentor_id
from app.models.class_models import MentorClassesResponse

router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"]
)

@router.get("", response_model=MentorListResponse)
@router.get("/", response_model=MentorListResponse)
def get_mentors(
    # Search & Filter Parameters
    q: str = Query(None, description="Search in name, headline, bio, tags"),
    featured: bool = Query(None, description="Get featured mentors only - USED BY: Homepage featured section (?featured=true&pageSize=6)"),
    category: str = Query(None, description="Filter by category - USED BY: Mentor directory category filter dropdown"),
    city: str = Query(None, description="Filter by city - USED BY: Mentor directory location filter"),
    country: str = Query(None, description="Filter by country - USED BY: Admin dashboard and advanced filtering"),
    teachingMode: str = Query(None, description="Filter by teaching mode (online/in-person) - USED BY: Directory teaching mode filter"),
    teachingLevel: str = Query(None, description="Filter by teaching level - USED BY: Directory advanced filters"),
    ageGroup: str = Query(None, description="Filter by age group - USED BY: Directory age group filter"),
    language: str = Query(None, description="Filter by language - USED BY: Directory language filter dropdown"),
    minRating: float = Query(None, ge=0, le=5, description="Minimum rating filter - USED BY: Directory rating filter"),
    maxRate: float = Query(None, ge=0, description="Maximum hourly rate filter - USED BY: Directory price range slider"),
    isVerified: bool = Query(None, description="Filter by verification status - USED BY: Admin dashboard mentor filtering"),
    acceptingStudents: bool = Query(None, description="Filter by accepting students - USED BY: Directory availability filter"),
    # Pagination & Sorting
    sortBy: str = Query("avgRating", description="Sort field - USED BY: Directory sort dropdown (avgRating, price-low, price-high, newest)"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc - USED BY: Directory sort implementation"),
    page: int = Query(1, ge=1, description="Page number - USED BY: Directory pagination component"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page - USED BY: Directory pagination (20), Homepage featured (6)")
):
    """
    Primary mentors endpoint used across multiple frontend pages with different parameter combinations.
    
    FRONTEND USAGE PATTERNS:
    - Homepage Featured: GET /mentors?featured=true&pageSize=6
      Returns 6 featured mentors for homepage cards (uses: displayName, headline, city, stats, pricing.firstSessionFree)
    
    - Mentor Directory: GET /mentors?category=music&city=london&page=1&pageSize=20&sortBy=avgRating
      Returns filtered mentor list for directory grid (uses: displayName, photoURL, city, region, teachingModes, 
      stats.avgRating, stats.totalReviews, subjects, pricing, status=active filter applied in frontend)
    
    - Admin Dashboard: GET /mentors?isVerified=false&page=1
      Returns mentors for admin management (uses: status, isVerified, displayName, category, subjects, 
      city, country, stats, pricing, headline)
    
    - User Saved Mentors: GET /mentors (filtered by saved IDs on frontend)
      Returns user's favorite mentors (uses: displayName, photoURL, subjects, city, stats, pricing)
    
    FILTERING NOTES:
    - Frontend applies additional status='active' filter for public-facing pages
    - Admin pages show all statuses for management purposes
    - Search combines multiple fields using backend search algorithms
    
    RESPONSE FIELD USAGE:
    - Directory cards: Core display fields + pricing + stats
    - Admin interface: Status fields + core info + performance metrics  
    - Homepage: Minimal display fields for featured showcase
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
@router.get("/{mentor_id}/")
def get_mentor_by_id(
    mentor_id: str,
    include_classes: bool = Query(False, description="Include mentor's classes in response - USED BY: Admin dashboard for mentor management")
):
    """
    Get individual mentor profile by ID - used by detail pages and booking flows.
    
    FRONTEND USAGE PATTERNS:
    - Mentor Detail Page: GET /mentors/{mentorId}
      Used to display complete mentor profile (uses: ALL fields for comprehensive view including bio, 
      qualifications, availability, full stats, pricing details, teaching capabilities)
    
    - Explore/Booking Pages: GET /mentors/{mentorId} 
      Used to show mentor info in class booking context (uses: displayName, photoURL, city, pricing)
    
    - Admin Management: GET /mentors/{mentorId}?include_classes=true
      Used for admin mentor review with classes (uses: status, verification fields, all profile data)
    
    - Mentor Dashboard: GET /mentors/{currentUserId}
      Used for mentor's own profile management (uses: ALL fields for self-editing)
    
    RESPONSE FIELD USAGE:
    - Detail page: Complete mentor profile with all personal, professional, and contact info
    - Booking context: Basic mentor info for booking confirmation
    - Admin view: All fields plus associated classes for management decisions
    
    SECURITY NOTE: Returns all profile fields - ensure proper access control at application level
    """
    mentor = fetch_mentor_by_id(mentor_id)
    
    response = {"mentor": mentor}
    
    if include_classes:
        classes = get_classes_by_mentor_id(mentor_id)
        response["classes"] = classes
    
    return response

@router.put("/{mentor_id}")
@router.put("/{mentor_id}/")
def update_mentor_profile(mentor_id: str, update_data: dict):
    """
    Pure MongoDB-style flexible mentor updates.
    
    Frontend can send ANY field it wants:
    - { "headline": "New headline" }
    - { "isAcceptingStudents": false, "customField": "value" }
    - { "pricing.oneOnOneRate": 50.0 }
    - { "subjects": ["new", "subjects"], "bio": "Updated bio", "anyField": "anyValue" }
    """
    mentor = update_mentor_flexible(mentor_id, update_data)
    return {"mentor": mentor}

