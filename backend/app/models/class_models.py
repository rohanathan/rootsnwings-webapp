from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class Schedule(BaseModel):
    startDate: Optional[date] = None
    endDate: Optional[date] = None
    weeklySchedule: Optional[List[dict]] = Field(default_factory=list)
    sessionDuration: Optional[int]

class Location(BaseModel):
    type: Optional[str]
    details: Optional[dict]

class Capacity(BaseModel):
    maxStudents: int
    minStudents: int
    currentEnrollment: int

class Pricing(BaseModel):
    perSessionRate: float
    totalSessions: int
    subtotal: float
    currency: str

class ClassItem(BaseModel):
    classId: str
    type: str
    title: str
    subject: str
    category: str
    description: Optional[str] = None
    mentorId: str
    mentorName: str
    mentorPhotoURL: Optional[str] = None
    mentorRating: Optional[float] = None
    level: Optional[str] = None
    ageGroup: Optional[str] = None
    format: Optional[str] = None
    schedule: Optional[Schedule] = None
    capacity: Optional[Capacity] = None
    pricing: Optional[Pricing] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class ClassListResponse(BaseModel):
    classes: List[ClassItem]

class FeaturedClassResponse(BaseModel):
    featured: List[ClassItem]

class WorkshopListResponse(BaseModel):
    workshops: List[ClassItem]

class MentorClassesResponse(BaseModel):
    classes: List[ClassItem]

class ClassSearchQuery(BaseModel):
    q: Optional[str] = None               # text search (matches keywords)
    category: Optional[str] = None        # e.g., "wellness"
    location: Optional[str] = None        # e.g., "Birmingham"
    min_rating: Optional[float] = None    # e.g., 4.0
    max_price: Optional[float] = None     # max price per session    