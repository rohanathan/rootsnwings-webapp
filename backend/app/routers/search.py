from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.models.class_models import ClassItem
from app.models.search_models import UnifiedSearchQuery, UnifiedSearchResponse
from app.services.search_service import search_classes_with_filters, unified_search

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=UnifiedSearchResponse)
def unified_search_endpoint(
    q: str = Query(None, description="Search text across mentors and classes"),
    type: str = Query(None, description="Filter by result type: mentor, class"),
    category: str = Query(None, description="Filter by category"),
    city: str = Query(None, description="Filter by city"),
    country: str = Query(None, description="Filter by country"),
    minRating: float = Query(None, ge=0, le=5, description="Minimum rating"),
    maxPrice: float = Query(None, ge=0, description="Maximum price"),
    isOnline: bool = Query(None, description="Filter for online offerings"),
    isVerified: bool = Query(None, description="Filter for verified mentors only"),
    sortBy: str = Query("relevance", description="Sort by: relevance, rating, price, date"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Unified search across mentors and classes with intelligent ranking.
    
    This endpoint searches both mentors and classes simultaneously and returns
    unified results with relevance-based ranking. Results can be filtered by:
    
    - **Text search**: Searches across names, titles, descriptions, tags
    - **Type**: Filter to show only mentors or classes
    - **Category**: Filter by category (e.g., "wellness", "music")
    - **Location**: Filter by city or country
    - **Rating**: Minimum rating filter
    - **Price**: Maximum price filter
    - **Online**: Filter for online-only offerings
    - **Verified**: Filter for verified mentors only
    
    Results are sorted by relevance by default, but can be sorted by rating,
    price, or date. Each result includes standardized fields plus the full
    original data object.
    """
    try:
        search_query = UnifiedSearchQuery(
            q=q,
            type=type,
            category=category,
            city=city,
            country=country,
            minRating=minRating,
            maxPrice=maxPrice,
            isOnline=isOnline,
            isVerified=isVerified,
            sortBy=sortBy,
            sortOrder=sortOrder,
            page=page,
            pageSize=pageSize
        )
        
        results, stats = unified_search(search_query)
        
        total_pages = (stats["total"] + pageSize - 1) // pageSize
        
        # Create filter summary
        active_filters = {}
        if q: active_filters["q"] = q
        if type: active_filters["type"] = type
        if category: active_filters["category"] = category
        if city: active_filters["city"] = city
        if country: active_filters["country"] = country
        if minRating: active_filters["minRating"] = minRating
        if maxPrice: active_filters["maxPrice"] = maxPrice
        if isOnline is not None: active_filters["isOnline"] = isOnline
        if isVerified is not None: active_filters["isVerified"] = isVerified
        
        return UnifiedSearchResponse(
            results=results,
            total=stats["total"],
            mentorCount=stats["mentorCount"],
            classCount=stats["classCount"],
            page=page,
            pageSize=pageSize,
            totalPages=total_pages,
            query=q or "",
            filters=active_filters
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )

@router.get("/classes", response_model=List[ClassItem])
def search_classes_endpoint(
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
    Legacy class search endpoint for backward compatibility.
    
    **Recommendation**: Use the unified search endpoint (`GET /search/`) instead
    for better features and consistent results.
    
    This endpoint may require Firestore composite indexes for multiple filters.
    """
    try:
        results = search_classes_with_filters(
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
        raise HTTPException(
            status_code=400,
            detail=f"Firestore query failed. This indicates a missing composite index. "
                   f"Check your backend terminal logs for the error message from Google, "
                   f"which includes a URL to create the required index. "
                   f"Original Error: {e}"
        )

