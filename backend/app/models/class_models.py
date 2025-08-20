from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union
from datetime import date, datetime

class Schedule(BaseModel):
    startDate: Optional[Union[date, List[date]]] = None  # Support single date or array of dates
    endDate: Optional[Union[date, List[date]]] = None    # Support single date or array of dates
    weeklySchedule: Optional[List[dict]] = Field(default_factory=list)
    sessionDuration: Optional[int]

class Location(BaseModel):
    type: Optional[str]
    details: Optional[dict]

class Capacity(BaseModel):
    maxStudents: Optional[int] = None
    minStudents: Optional[int] = None
    currentEnrollment: Optional[Union[int, str]] = 0
    
    @validator('currentEnrollment', pre=True)
    def convert_current_enrollment(cls, v):
        if v is None:
            return 0
        if isinstance(v, str):
            try:
                return int(v)
            except ValueError:
                return 0
        return v

class Pricing(BaseModel):
    perSessionRate: Optional[float] = None
    totalSessions: Optional[int] = None
    subtotal: Optional[Union[float, str]] = None
    currency: Optional[str] = None
    
    @validator('subtotal', pre=True)
    def convert_subtotal(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return float(v)
            except ValueError:
                return None
        return v
    
    @validator('perSessionRate', pre=True)
    def convert_per_session_rate(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return float(v)
            except ValueError:
                return None
        return v

class ClassItem(BaseModel):
    classId: str
    type: str
    title: str
    subject: str
    category: str
    description: Optional[str] = None
    mentorId: str
    mentorName: Optional[str] = "Unknown Mentor"  # Made optional with default
    mentorPhotoURL: Optional[str] = None
    mentorRating: Optional[float] = None
    classImage: Optional[str] = None  # Subject-based class image
    level: Optional[str] = None
    ageGroup: Optional[str] = None
    format: Optional[str] = None
    schedule: Optional[Schedule] = None
    capacity: Optional[Capacity] = None
    pricing: Optional[Pricing] = None
    avgRating: Optional[float] = None
    totalReviews: Optional[int] = 0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    status: Optional[str] = None  # Add status field for admin functionality

class ClassListResponse(BaseModel):
    classes: List[ClassItem]
    total: int
    page: int
    pageSize: int
    totalPages: int

class FeaturedClassResponse(BaseModel):
    featured: List[ClassItem]

class WorkshopListResponse(BaseModel):
    workshops: List[ClassItem]
    total: int
    page: int
    pageSize: int
    totalPages: int

class MentorClassesResponse(BaseModel):
    classes: List[ClassItem]

class ClassSearchQuery(BaseModel):
    q: Optional[str] = Field(None, description="Search in title, description, subject")
    type: Optional[str] = Field(None, description="Class type: one-on-one, batch, workshop")
    category: Optional[str] = Field(None, description="Class category")
    subject: Optional[str] = Field(None, description="Subject of the class")
    level: Optional[str] = Field(None, description="Class level: beginner, intermediate, advanced")
    ageGroup: Optional[str] = Field(None, description="Age group: child, teen, adult")
    format: Optional[str] = Field(None, description="Class format: online, in-person, hybrid")
    city: Optional[str] = Field(None, description="City location")
    country: Optional[str] = Field(None, description="Country location")
    mentorId: Optional[str] = Field(None, description="Filter classes by specific mentor ID")
    mentorName: Optional[str] = Field(None, description="Filter classes by mentor name")
    minRating: Optional[float] = Field(None, ge=0, le=5, description="Minimum mentor rating")
    maxPrice: Optional[float] = Field(None, ge=0, description="Maximum price per session")
    minPrice: Optional[float] = Field(None, ge=0, description="Minimum price per session")
    isRecurring: Optional[bool] = Field(None, description="Filter recurring classes")
    hasAvailability: Optional[bool] = Field(None, description="Filter classes with available spots")
    startDateFrom: Optional[str] = Field(None, description="Classes starting from date (YYYY-MM-DD)")
    startDateTo: Optional[str] = Field(None, description="Classes starting before date (YYYY-MM-DD)")
    status: Optional[str] = Field(None, description="Filter by class status: approved, pending_approval, rejected")
    sortBy: Optional[str] = Field("createdAt", description="Sort field: createdAt, startDate, price, rating, title")
    sortOrder: Optional[str] = Field("desc", description="Sort order: asc or desc")
    page: int = Field(1, ge=1, description="Page number")
    pageSize: int = Field(20, ge=1, le=100, description="Items per page")
