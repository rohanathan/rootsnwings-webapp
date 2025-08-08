from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ReviewRequest(BaseModel):
    classId: str
    rating: int = Field(ge=1, le=5)
    review: str = Field(min_length=1, max_length=1000)

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review: Optional[str] = Field(None, min_length=1, max_length=1000)

class Review(BaseModel):
    reviewId: str
    classId: Optional[str] = None
    mentorId: Optional[str] = None
    studentId: Optional[str] = None     
    bookingId: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    review: str
    isAnonymous: bool = True
    createdAt: str
    updatedAt: Optional[str] = None

class ReviewResponse(BaseModel):
    review: Review

class ReviewListResponse(BaseModel):
    reviews: List[Review]
    total: int
    avgRating: Optional[float] = None

# For testimonials/public display
class TestimonialResponse(BaseModel):
    studentName: str = "Anonymous"  # Always anonymous
    studentInitial: str
    mentorName: str
    className: str
    rating: int
    review: str
    userType: str  # "Student" or "Parent"
    createdAt: str

class TestimonialsListResponse(BaseModel):
    testimonials: List[TestimonialResponse]
    count: int