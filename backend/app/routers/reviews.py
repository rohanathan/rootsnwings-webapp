from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.services.booking_service import get_all_bookings
from app.models.booking_models import BookingStatus

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

class TestimonialResponse(BaseModel):
    studentName: str  # Always "Anonymous" for privacy
    studentInitial: str
    mentorName: str  # OK to show - mentors are public figures
    className: str   # OK to show - classes are public
    rating: int
    review: str
    userType: str  # "Student" or "Parent"

class TestimonialsListResponse(BaseModel):
    testimonials: List[TestimonialResponse]
    count: int

@router.get("/testimonials", response_model=TestimonialsListResponse)
def get_testimonials(
    min_rating: int = Query(4, ge=1, le=5, description="Minimum rating to include"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of testimonials")
):
    """
    Get high-rated reviews for homepage testimonials.
    
    Filters bookings to find:
    - Completed bookings with reviews
    - Rating >= min_rating (default 4)
    - Has non-empty review text
    
    Returns formatted testimonials for frontend display.
    """
    # Get all bookings (not just completed - students can review ongoing classes)
    all_bookings = get_all_bookings()
    
    testimonials = []
    
    for booking in all_bookings:
        # Filter for bookings with reviews and high ratings
        if (hasattr(booking, 'studentRating') and booking.studentRating and 
            hasattr(booking, 'studentReview') and booking.studentReview and 
            booking.studentRating >= min_rating and
            len(booking.studentReview.strip()) > 0):
            
            # Determine user type based on parentId
            user_type = "Parent" if hasattr(booking, 'parentId') and booking.parentId else "Student"
            
            # Get student initial - need to fetch from user data since new bookings don't store names
            student_initial = "S"  # Default fallback
            
            # For now, use placeholder data - frontend can fetch actual names if needed
            testimonial = TestimonialResponse(
                studentName="Anonymous",  # Always anonymous for privacy
                studentInitial=student_initial,
                mentorName="Mentor",  # Placeholder - frontend can fetch from mentorId
                className="Class",    # Placeholder - frontend can fetch from classId
                rating=booking.studentRating,
                review=booking.studentReview,
                userType=user_type
            )
            
            testimonials.append(testimonial)
            
            # Stop when we reach the limit
            if len(testimonials) >= limit:
                break
    
    return TestimonialsListResponse(
        testimonials=testimonials,
        count=len(testimonials)
    )

@router.get("/mentor/{mentor_id}", response_model=TestimonialsListResponse)
def get_mentor_reviews(mentor_id: str):
    """
    Get all reviews for a specific mentor.
    Used for mentor profile pages.
    """
    from app.services.booking_service import get_bookings_by_mentor
    
    mentor_bookings, total = get_bookings_by_mentor(mentor_id, page=1, page_size=100)
    
    testimonials = []
    
    for booking in mentor_bookings:
        # Include all bookings with reviews (any rating)
        if (hasattr(booking, 'studentRating') and booking.studentRating and
            hasattr(booking, 'studentReview') and booking.studentReview):
            user_type = "Parent" if hasattr(booking, 'parentId') and booking.parentId else "Student"
            student_initial = "S"  # Default fallback
            
            testimonial = TestimonialResponse(
                studentName="Anonymous",  # Always anonymous for privacy
                studentInitial=student_initial,
                mentorName="Mentor",  # Placeholder - frontend can fetch from mentorId
                className="Class",    # Placeholder - frontend can fetch from classId
                rating=booking.studentRating,
                review=booking.studentReview,
                userType=user_type
            )
            
            testimonials.append(testimonial)
    
    return TestimonialsListResponse(
        testimonials=testimonials,
        count=len(testimonials)
    )