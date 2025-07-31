from pydantic import BaseModel, Field
from typing import List, Optional

class MentorStats(BaseModel):
    avgRating: float = 0
    repeatStudentRate: float = 0
    totalStudents: int = 0
    totalSessions: int = 0
    responseTimeMinutes: int = 999
    totalReviews: Optional[int] = None

class Mentor(BaseModel):
    id: str
    displayName: str
    isVerified: bool
    headline: Optional[str] = None
    bio: Optional[str] = None
    photoURL: Optional[str] = None
    specialties: Optional[List[str]] = Field(default_factory=list)
    subjects: Optional[List[str]] = Field(default_factory=list)
    stats: Optional[MentorStats] = Field(default_factory=MentorStats)

class AllMentorsResponse(BaseModel):
    mentors: List[Mentor]

class FeaturedMentorsResponse(BaseModel):
    featured: List[Mentor]

class MentorResponse(BaseModel):
    mentor: Mentor

class MentorSearchQuery(BaseModel):
    q: Optional[str] = None                 # text search
    specialty: Optional[str] = None         # e.g., "piano"
    location: Optional[str] = None          # e.g., "Birmingham"
    min_rating: Optional[float] = None      # rating >= this