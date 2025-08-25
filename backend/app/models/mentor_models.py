from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum

class MentorStats(BaseModel):
    """
    Mentor performance metrics used across directory and detail pages.
    
    USAGE: Directory cards show avgRating (as stars) and totalReviews count.
    Detail page shows all stats. Admin dashboard uses for mentor evaluation.
    """
    avgRating: float = Field(0, description="Average rating 0-5 - displayed as star rating on all mentor cards and detail page")
    totalReviews: int = Field(0, description="Number of reviews - shown as '(X reviews)' text on directory cards and detail page")
    totalStudents: int = Field(0, description="ADMIN/DETAIL ONLY - total students taught, shown on detail page and admin dashboard")
    totalSessions: int = Field(0, description="ADMIN/DETAIL ONLY - total sessions completed, used for mentor performance tracking")
    responseTimeMinutes: int = Field(999, description="DETAIL PAGE ONLY - average response time, shown on mentor detail page")
    repeatStudentRate: float = Field(0, description="ADMIN ONLY - percentage of returning students, used for mentor evaluation")

class Coordinates(BaseModel):
    lat: float
    lng: float

class Pricing(BaseModel):
    """
    Mentor pricing structure displayed on directory cards and detail page.
    
    USAGE: Directory cards show oneOnOneRate OR groupRate with firstSessionFree badge.
    Detail page shows full pricing breakdown for booking decisions.
    """
    oneOnOneRate: float = Field(..., description="Hourly rate for 1-on-1 sessions - primary price shown on directory cards")
    groupRate: float = Field(..., description="Hourly rate for group sessions - shown on detail page and sometimes directory cards")
    currency: str = Field("GBP", description="Currency code - used for price display formatting (£, $, etc)")
    firstSessionFree: bool = Field(False, description="Free trial offer - displayed as green badge on directory cards and homepage")

class AvailabilitySummary(BaseModel):
    timezone: str
    generallyAvailable: List[str] = Field(default_factory=list)
    preferredHours: Optional[List[str]] = Field(default_factory=list)

class QualificationType(str, Enum):
    """
    Enhanced qualification types including cultural/traditional training.
    Used in mentor onboarding and profile display.
    """
    # === FORMAL QUALIFICATIONS ===
    DEGREE = "degree"
    CERTIFICATION = "certification" 
    PROFESSIONAL_EXPERIENCE = "professional_experience"
    
    # === CULTURAL/TRADITIONAL QUALIFICATIONS ===
    TRADITIONAL_LINEAGE = "traditional_lineage"  # "Student of Guru"
    CULTURAL_APPRENTICESHIP = "cultural_apprenticeship"  # "Apprenticed under Master craftsman"
    CULTURAL_IMMERSION = "cultural_immersion"  # "3 years studying in India"
    SELF_TAUGHT_CULTURAL = "self_taught_cultural"  # "20 years self-study of tradition"
    COMMUNITY_RECOGNITION = "community_recognition"  # "Recognized by cultural community"

class Qualification(BaseModel):
    id: str
    type: QualificationType = Field(..., description="Type of qualification - formal or cultural/traditional")
    title: str = Field(..., description="Qualification title or description")
    institution: str = Field(..., description="Institution, guru name, or 'Self-taught' for traditional learning")
    year: str = Field(..., description="Year obtained or period of study")
    icon: str = Field("🎓", description="Display icon - varies by type")
    certUrl: Optional[str] = None  # Optional certificate/document URL for admin validation
    
    # === ENHANCED CULTURAL CONTEXT ===
    cultural_subjects: Optional[List[str]] = []  # Subject IDs this qualification relates to
    description: Optional[str] = None  # Additional context for traditional/cultural qualifications
    verification_status: Optional[str] = "pending"  # Admin verification status
    
    def is_cultural_qualification(self) -> bool:
        """Check if this is a cultural/traditional qualification"""
        cultural_types = {
            QualificationType.TRADITIONAL_LINEAGE,
            QualificationType.CULTURAL_APPRENTICESHIP,
            QualificationType.CULTURAL_IMMERSION,
            QualificationType.SELF_TAUGHT_CULTURAL,
            QualificationType.COMMUNITY_RECOGNITION
        }
        return self.type in cultural_types
    
    def get_display_icon(self) -> str:
        """Get appropriate icon based on qualification type"""
        icon_mapping = {
            QualificationType.DEGREE: "🎓",
            QualificationType.CERTIFICATION: "📜", 
            QualificationType.PROFESSIONAL_EXPERIENCE: "💼",
            QualificationType.TRADITIONAL_LINEAGE: "🙏",
            QualificationType.CULTURAL_APPRENTICESHIP: "👨‍🏫",
            QualificationType.CULTURAL_IMMERSION: "🌍",
            QualificationType.SELF_TAUGHT_CULTURAL: "📚",
            QualificationType.COMMUNITY_RECOGNITION: "🏆"
        }
        return icon_mapping.get(self.type, "🎓")

class Mentor(BaseModel):
    """
    Mentor profile model used across multiple frontend pages.
    
    FRONTEND USAGE PATTERNS:
    - Mentor Directory (/mentor/directory): Uses displayName, photoURL, city, region, teachingModes, 
      stats.avgRating, stats.totalReviews, subjects, pricing.oneOnOneRate/groupRate, pricing.firstSessionFree
    - Homepage Featured (/): Uses displayName, headline, city, stats.avgRating, stats.totalReviews, pricing.firstSessionFree
    - Mentor Detail Page (/mentor/detailpage): Uses ALL fields for comprehensive profile display
    - Admin Dashboard (/admin/mentors): Uses status, isVerified, displayName, category, subjects, city, 
      country, stats, pricing, headline for management
    - Explore/Booking Pages: Uses displayName, photoURL, city for basic mentor info in class contexts
    - Search/Filtering: Uses searchKeywords, category, subjects, teachingModes, languages for backend filtering
    """
    
    # === CORE IDENTITY FIELDS (Used by ALL pages) ===
    uid: str = Field(..., description="Unique mentor identifier - used across all pages for identification and routing")
    displayName: str = Field(..., description="Mentor's public display name - shown on directory cards, detail page header, admin lists")
    
    # === VISUAL DISPLAY FIELDS (Used by directory, detail, homepage, booking pages) ===
    photoURL: Optional[str] = Field(None, description="Profile picture URL - displayed on mentor cards, detail page, directory listing")
    
    # === SUBJECT/CATEGORY FIELDS (Used by directory search, detail page, admin management) ===
    category: str = Field(..., description="Main teaching category - used for search filtering and organization in directory")
    subjects: Optional[List[str]] = Field(default_factory=list, description="List of subject IDs mentor teaches - displayed as tags on directory cards and used for filtering")
    searchKeywords: Optional[List[str]] = Field(default_factory=list, description="BACKEND ONLY - search optimization keywords, not displayed to users")
    
    # === PROFILE CONTENT FIELDS (Used primarily by detail page, some by homepage) ===
    headline: Optional[str] = Field(None, description="Brief mentor tagline - shown on homepage featured section and admin overview")
    bio: Optional[str] = Field(None, description="DETAIL PAGE ONLY - full mentor biography displayed on mentor detail page")
    
    # === TEACHING CAPABILITY FIELDS (Used by directory filters and detail page) ===
    languages: Optional[List[str]] = Field(default_factory=list, description="Languages spoken - used for directory filtering and detail page display")
    teachingLevels: Optional[List[str]] = Field(default_factory=list, description="DETAIL PAGE ONLY - experience levels taught (beginner, intermediate, advanced)")
    ageGroups: Optional[List[str]] = Field(default_factory=list, description="DETAIL PAGE ONLY - age groups served (child, teen, adult)")
    teachingModes: Optional[List[str]] = Field(default_factory=list, description="Teaching modes - displayed as badges on directory cards (online, in-person, hybrid)")
    
    # === LOCATION FIELDS (Used by directory cards, detail page, admin, search filtering) ===
    city: Optional[str] = Field(None, description="City name - prominently displayed on directory cards and homepage for location matching")
    region: Optional[str] = Field(None, description="Region/state - shown on directory cards and detail page for location context")
    country: Optional[str] = Field(None, description="Country - used by admin dashboard and detail page")
    postcode: Optional[str] = Field(None, description="BACKEND ONLY - not displayed to users, used for location-based search")
    coordinates: Optional[Coordinates] = Field(None, description="BACKEND ONLY - lat/lng for geographic search, not displayed")
    
    # === PRICING FIELDS (Used by directory cards, detail page booking section) ===
    pricing: Optional[Pricing] = Field(None, description="Rate structure - oneOnOneRate shown on directory cards, firstSessionFree displayed as badge")
    
    # === STATS/RATINGS FIELDS (Used by directory cards, homepage, detail page, admin dashboard) ===
    stats: Optional[MentorStats] = Field(None, description="Performance metrics - avgRating and totalReviews shown as stars on all mentor displays")
    
    # === ADMIN/STATUS FIELDS (Used primarily by admin dashboard) ===
    status: Optional[str] = Field("active", description="ADMIN FIELD - mentor approval status, used by admin dashboard for filtering and management")
    isVerified: Optional[bool] = Field(False, description="Verification status - shown as verified badge on detail page and admin dashboard")
    backgroundChecked: Optional[bool] = Field(False, description="ADMIN ONLY - background check status, used by admin dashboard")
    acceptingNewStudents: Optional[dict] = Field(None, description="DETAIL PAGE ONLY - availability for new bookings, shown on detail page")
    
    # === DETAIL PAGE SPECIFIC FIELDS ===
    qualifications: Optional[List[Qualification]] = Field(default_factory=list, description="DETAIL PAGE ONLY - mentor credentials displayed in qualifications section")
    availabilitySummary: Optional[AvailabilitySummary] = Field(None, description="DETAIL PAGE ONLY - general availability info for booking decisions")
    
    # === METADATA FIELDS (Used by backend, rarely displayed) ===
    createdAt: Optional[datetime] = Field(None, description="BACKEND ONLY - account creation timestamp, not displayed to users")
    updatedAt: Optional[datetime] = Field(None, description="BACKEND ONLY - last profile update, not displayed to users")
    
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