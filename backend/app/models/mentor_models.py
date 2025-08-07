from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MentorStats(BaseModel):
    avgRating: float = 0
    totalReviews: int = 0
    totalStudents: int = 0
    totalSessions: int = 0
    responseTimeMinutes: int = 999
    repeatStudentRate: float = 0

class Coordinates(BaseModel):
    lat: float
    lng: float

class Pricing(BaseModel):
    oneOnOneRate: float
    groupRate: float
    currency: str = "GBP"
    firstSessionFree: bool = False

class AvailabilitySummary(BaseModel):
    timezone: str
    generallyAvailable: List[str] = Field(default_factory=list)
    preferredHours: Optional[List[str]] = Field(default_factory=list)

class Qualification(BaseModel):
    id: str
    type: str  # "degree", "certification", "experience"
    title: str
    institution: str
    year: str
    icon: str = "🎓"
    certUrl: Optional[str] = None  # Optional certificate/document URL for admin validation

class Mentor(BaseModel):
    uid: str
    displayName: str
    photoURL: Optional[str] = None
    category: str
    searchKeywords: Optional[List[str]] = Field(default_factory=list)
    headline: Optional[str] = None
    bio: Optional[str] = None
    languages: Optional[List[str]] = Field(default_factory=list)
    teachingLevels: Optional[List[str]] = Field(default_factory=list)
    ageGroups: Optional[List[str]] = Field(default_factory=list)
    teachingModes: Optional[List[str]] = Field(default_factory=list)
    subjects: Optional[List[str]] = Field(default_factory=list)
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    postcode: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    pricing: Optional[Pricing] = None
    stats: Optional[MentorStats] = None
    status: Optional[str] = "active"
    isVerified: Optional[bool] = False
    backgroundChecked: Optional[bool] = False
    acceptingNewStudents: Optional[dict] = None
    qualifications: Optional[List[Qualification]] = Field(default_factory=list)
    availabilitySummary: Optional[AvailabilitySummary] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    
    class Config:
        arbitrary_types_allowed = True

class MentorListResponse(BaseModel):
    mentors: List[Mentor]
    total: int
    page: int
    pageSize: int
    totalPages: int

class FeaturedMentorsResponse(BaseModel):
    featured: List[Mentor]

class MentorResponse(BaseModel):
    mentor: Mentor

class MentorSearchQuery(BaseModel):
    q: Optional[str] = Field(None, description="Search in name, headline, bio, tags")
    category: Optional[str] = Field(None, description="Filter by category")
    city: Optional[str] = Field(None, description="Filter by city")
    country: Optional[str] = Field(None, description="Filter by country")
    teachingMode: Optional[str] = Field(None, description="Filter by teaching mode (online, in-person)")
    teachingLevel: Optional[str] = Field(None, description="Filter by teaching level")
    ageGroup: Optional[str] = Field(None, description="Filter by age group")
    language: Optional[str] = Field(None, description="Filter by language")
    minRating: Optional[float] = Field(None, ge=0, le=5, description="Minimum rating")
    maxRate: Optional[float] = Field(None, ge=0, description="Maximum hourly rate")
    isVerified: Optional[bool] = Field(None, description="Filter by verification status")
    acceptingStudents: Optional[bool] = Field(None, description="Filter by accepting new students status")
    sortBy: Optional[str] = Field("avgRating", description="Sort field: avgRating, totalReviews, oneOnOneRate, createdAt")
    sortOrder: Optional[str] = Field("desc", description="Sort order: asc or desc")
    page: int = Field(1, ge=1, description="Page number")
    pageSize: int = Field(20, ge=1, le=100, description="Items per page")