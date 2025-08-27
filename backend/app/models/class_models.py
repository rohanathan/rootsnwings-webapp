from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union
from datetime import date, datetime

class Schedule(BaseModel):
    """
    Class scheduling information displayed across discovery and management pages.
    
    USAGE: Workshop cards show formatted date ranges and session times. 
    Mentor dashboard shows weekly schedule for "next sessions" display.
    """
    startDate: Optional[Union[date, List[date]]] = Field(None, description="Class start date - displayed as 'Aug 16, 2025' on workshop cards and booking confirmation")
    endDate: Optional[Union[date, List[date]]] = Field(None, description="Class end date - shown as date range 'Aug 16 - Aug 17' on multi-day workshops") 
    weeklySchedule: Optional[List[dict]] = Field(default_factory=list, description="Weekly time slots - displayed as 'Sat & Sun | 10:00 - 16:00' on cards, 'Tuesday • 09:00' on mentor dashboard")
    sessionDuration: Optional[int] = Field(None, description="Session length in minutes - displayed as '6h 0m per session' on workshop cards")

class Location(BaseModel):
    type: Optional[str]
    details: Optional[dict]

class Capacity(BaseModel):
    """
    Class enrollment capacity used for availability display and admin management.
    
    USAGE: Discovery pages show 'X spots left' based on maxStudents - currentEnrollment.
    Admin dashboard displays maxStudents for class size evaluation.
    """
    maxStudents: Optional[int] = Field(None, description="Maximum enrollment - shown on discovery cards as capacity indicator, used by admin for class evaluation")
    minStudents: Optional[int] = Field(None, description="ADMIN ONLY - minimum to run class, used for viability assessment")
    currentEnrollment: Optional[Union[int, str]] = Field(0, description="Current enrolled count - used to calculate 'X spots left' on workshop cards")
    
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
    """
    Class pricing structure displayed on discovery pages and booking flows.
    
    USAGE: Workshop cards prominently display perSessionRate. Admin dashboard shows 
    perSessionRate for financial evaluation. Booking uses totalSessions for calculations.
    """
    perSessionRate: Optional[float] = Field(None, description="Price per session - prominently displayed as '£120' on workshop cards and admin dashboard")
    totalSessions: Optional[int] = Field(None, description="Number of sessions - used for booking total calculations and course duration display")
    subtotal: Optional[Union[float, str]] = Field(None, description="BOOKING ONLY - total course cost calculated from perSessionRate × totalSessions")
    currency: Optional[str] = Field(None, description="Currency code - used for price formatting (£, $, €)")
    
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
    """
    Class/Workshop model used across multiple frontend pages for course management and booking.
    
    FRONTEND USAGE PATTERNS:
    - Workshop Listing (/explore/workshops): Uses title, description, mentorName, pricing, schedule, 
      capacity, format, level, ageGroup, classImage for workshop discovery cards
    - Mentor Dashboard (/mentor/dashboard): Uses title, subject, type, schedule.weeklySchedule for 
      "upcoming sessions" display and class management
    - Admin Dashboard (/admin/classes): Uses status, title, subject, category, mentorName, capacity.maxStudents,
      pricing.perSessionRate, type, createdAt for approval workflow  
    - Booking Pages (/booking/confirmbooking): Uses title, mentorName, pricing, schedule for booking confirmation
    - User Dashboard (/user/dashboard): Uses title, basic info for user's enrolled class display
    - Homepage (/): Uses title, schedule, mentorName, format for featured workshop cards
    - Group Batches (/explore/group-batches): Uses similar fields as workshops for group class discovery
    """
    
    # === CORE IDENTITY FIELDS (Used by ALL pages) ===
    classId: str = Field(..., description="Unique class identifier - used across all pages for routing and identification")
    type: str = Field(..., description="Class type (workshop, group, one-on-one) - displayed on admin dashboard and used for filtering")
    title: str = Field(..., description="Class title - prominently displayed on all cards, dashboards, and booking pages")
    
    # === SUBJECT/CATEGORY FIELDS (Used by discovery pages, admin, mentor dashboard) ===
    subject: str = Field(..., description="Subject ID - used for filtering and displayed on mentor dashboard, admin interface")
    category: str = Field(..., description="Subject category - used by admin dashboard and filtering systems")
    
    # === CONTENT FIELDS (Used primarily by workshop listing, booking confirmation) ===
    description: Optional[str] = Field(None, description="DISCOVERY PAGES - full class description shown on workshop cards and booking confirmation")
    classImage: Optional[str] = Field(None, description="DISCOVERY PAGES - subject-based hero image displayed on workshop/group batch cards")
    
    # === MENTOR INFO FIELDS (Used by discovery pages, booking, admin) ===
    mentorId: str = Field(..., description="Mentor's unique ID - used for mentor filtering and linking to mentor profiles")
    mentorName: Optional[str] = Field("Unknown Mentor", description="Mentor display name - shown on all class cards, admin dashboard, booking pages")
    mentorPhotoURL: Optional[str] = Field(None, description="DISCOVERY PAGES - mentor profile photo displayed on workshop cards")
    mentorRating: Optional[float] = Field(None, description="DISCOVERY PAGES - mentor's rating displayed on workshop cards for credibility")
    
    # === CLASS CHARACTERISTICS (Used by discovery pages, admin filtering) ===
    level: Optional[str] = Field(None, description="DISCOVERY PAGES - difficulty level (beginner/intermediate/advanced) shown as badges on workshop cards")
    ageGroup: Optional[str] = Field(None, description="DISCOVERY PAGES - target age group (child/teen/adult) displayed on workshop cards and used for filtering")
    format: Optional[str] = Field(None, description="DISCOVERY PAGES - delivery format (online/in-person/hybrid) prominently displayed with icons on cards")
    
    # === SCHEDULING FIELDS (Used by all pages for time/date display) ===
    schedule: Optional[Schedule] = Field(None, description="Schedule details - startDate/endDate shown on cards, weeklySchedule used for 'next session' displays")
    
    # === CAPACITY FIELDS (Used by discovery pages for availability, admin for management) ===
    capacity: Optional[Capacity] = Field(None, description="Enrollment info - maxStudents used by admin, available spots ('X spots left') shown on discovery cards")
    
    # === PRICING FIELDS (Used by discovery pages, booking, admin dashboard) ===
    pricing: Optional[Pricing] = Field(None, description="Cost structure - perSessionRate displayed prominently on cards, totalSessions used for booking calculations")
    
    # === RATING FIELDS (Used by discovery pages for social proof) ===
    avgRating: Optional[float] = Field(None, description="DISCOVERY PAGES - class rating displayed as stars on workshop cards")
    totalReviews: Optional[int] = Field(0, description="DISCOVERY PAGES - review count shown as '(X reviews)' on cards")
    
    # === ADMIN/STATUS FIELDS (Used primarily by admin dashboard) ===
    status: Optional[str] = Field(None, description="ADMIN DASHBOARD - approval status (pending/approved/rejected) with color-coded badges and action buttons")
    
    # === METADATA FIELDS (Used by admin dashboard, rarely displayed to users) ===
    createdAt: Optional[str] = Field(None, description="ADMIN DASHBOARD - class creation date shown in admin list for chronological tracking")
    updatedAt: Optional[str] = Field(None, description="BACKEND ONLY - last modification timestamp, not displayed to users")
    searchMetadata: Optional[dict] = Field(None, description="SEARCH & MAP FUNCTIONALITY - cultural context, keywords, pricing info, and regional data for enhanced search and map visualization")

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
