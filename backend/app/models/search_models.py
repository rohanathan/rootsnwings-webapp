from pydantic import BaseModel, Field
from typing import List, Optional, Union
from app.models.mentor_models import Mentor
from app.models.class_models import ClassItem

class SearchResultType(str):
    MENTOR = "mentor"
    CLASS = "class"

class SearchResult(BaseModel):
    """Unified search result that can contain either a mentor or class"""
    type: str  # "mentor" or "class"
    id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    rating: Optional[float] = None
    price: Optional[float] = None
    location: Optional[str] = None
    imageUrl: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    data: Union[Mentor, ClassItem]  # The full object data
    
    class Config:
        arbitrary_types_allowed = True

class UnifiedSearchQuery(BaseModel):
    q: Optional[str] = Field(None, description="Search text across mentors and classes")
    type: Optional[str] = Field(None, description="Filter by result type: mentor, class")
    category: Optional[str] = Field(None, description="Filter by category")
    city: Optional[str] = Field(None, description="Filter by city")
    country: Optional[str] = Field(None, description="Filter by country")
    minRating: Optional[float] = Field(None, ge=0, le=5, description="Minimum rating")
    maxPrice: Optional[float] = Field(None, ge=0, description="Maximum price")
    isOnline: Optional[bool] = Field(None, description="Filter for online offerings")
    isVerified: Optional[bool] = Field(None, description="Filter for verified mentors only")
    sortBy: Optional[str] = Field("relevance", description="Sort by: relevance, rating, price, date")
    sortOrder: Optional[str] = Field("desc", description="Sort order: asc or desc")
    page: int = Field(1, ge=1, description="Page number")
    pageSize: int = Field(20, ge=1, le=100, description="Items per page")

class UnifiedSearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    mentorCount: int
    classCount: int
    page: int
    pageSize: int
    totalPages: int
    query: str
    filters: dict