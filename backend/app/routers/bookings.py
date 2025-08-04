from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.booking_models import (
    Booking, BookingRequest, BookingUpdate, BookingResponse, 
    BookingListResponse, BookingStatsResponse, BookingStatus
)
from app.services.booking_service import (
    create_booking, get_booking_by_id, get_bookings_by_student,
    get_bookings_by_mentor, get_bookings_by_class, update_booking,
    cancel_booking, confirm_booking, get_booking_stats, get_all_bookings
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

@router.post("/", response_model=BookingResponse)
def create_new_booking(booking_request: BookingRequest):
    """
    Create a new booking for a class.
    
    This endpoint:
    - Creates a booking with PENDING status
    - Links student to class and mentor
    - Handles both regular students and young learners (via parent)
    - Sets initial payment status as UNPAID
    """
    booking = create_booking(booking_request)
    return {"booking": booking}

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str):
    """Get a specific booking by ID"""
    booking = get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": booking}

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_details(booking_id: str, booking_update: BookingUpdate):
    """
    Update booking details.
    
    Can update:
    - Booking status (pending -> confirmed -> completed)
    - Payment status
    - Scheduled slots (for rescheduling)
    - Personal goals
    - Mentor notes
    - Student rating and review
    """
    booking = update_booking(booking_id, booking_update)
    return {"booking": booking}

@router.post("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking_payment(booking_id: str):
    """
    Confirm a booking and mark as paid.
    This moves status from PENDING to CONFIRMED.
    """
    booking = confirm_booking(booking_id)
    return {"booking": booking}

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking_request(booking_id: str):
    """
    Cancel a booking and process refund.
    This moves status to CANCELLED and payment to REFUNDED.
    """
    booking = cancel_booking(booking_id)
    return {"booking": booking}

@router.post("/{booking_id}/review", response_model=BookingResponse)
def submit_booking_review(booking_id: str, rating: int = Query(..., ge=1, le=5), review: Optional[str] = None):
    """
    Submit a rating and optional review for a booking.
    
    Requirements:
    - Booking must be in 'confirmed' or 'completed' status (students can review ongoing classes)
    - Rating must be between 1-5
    - Can only be submitted by the student who made the booking
    
    This will also trigger mentor stats update.
    """
    from app.models.booking_models import BookingUpdate
    
    # Create update with review data
    booking_update = BookingUpdate(
        studentRating=rating,
        studentReview=review
    )
    
    booking = update_booking(booking_id, booking_update)
    
    # Trigger mentor stats update
    from app.services.mentor_stats_service import update_mentor_stats
    update_mentor_stats(booking.mentorId)
    
    return {"booking": booking}

@router.get("/student/{student_id}", response_model=BookingListResponse)
def get_student_bookings(student_id: str):
    """
    Get all bookings for a specific student.
    Returns bookings sorted by booking date (newest first).
    """
    bookings = get_bookings_by_student(student_id)
    return {"bookings": bookings}

@router.get("/mentor/{mentor_id}", response_model=BookingListResponse)
def get_mentor_bookings(mentor_id: str):
    """
    Get all bookings for a specific mentor.
    Useful for mentor dashboard to see all their students.
    """
    bookings = get_bookings_by_mentor(mentor_id)
    return {"bookings": bookings}

@router.get("/class/{class_id}", response_model=BookingListResponse)
def get_class_bookings(class_id: str):
    """
    Get all bookings for a specific class.
    Useful to see enrollment and manage capacity.
    """
    bookings = get_bookings_by_class(class_id)
    return {"bookings": bookings}

@router.get("/my-bookings", response_model=BookingListResponse)
def get_my_bookings(user_id: str = Query(..., description="User ID (temporary - will be from auth token)")):
    """
    Get all bookings for the currently logged-in user.
    
    Returns bookings where:
    - studentId matches the authenticated user (for regular students)
    - parentId matches the authenticated user (for young learners)
    
    TODO: Replace user_id query param with authentication middleware
    """
    # Get bookings where user is either student or parent
    student_bookings = get_bookings_by_student(user_id)
    # TODO: Add logic to also get bookings where parentId matches user_id
    return {"bookings": student_bookings}

@router.get("/admin/bookings", response_model=BookingListResponse)
def get_all_bookings_admin(
    limit: Optional[int] = Query(None, description="Limit number of results"),
    status: Optional[BookingStatus] = Query(None, description="Filter by booking status")
):
    """
    [ADMIN ONLY] Get all bookings with optional filtering.
    
    Query parameters:
    - limit: Limit number of results returned
    - status: Filter by booking status (pending, confirmed, completed, cancelled)
    
    Security: This endpoint should be protected with admin authentication
    """
    bookings = get_all_bookings(limit=limit, status=status)
    return {"bookings": bookings}

@router.get("/admin/stats", response_model=BookingStatsResponse)
def get_booking_statistics():
    """
    Get booking statistics for admin dashboard.
    
    Returns:
    - Total bookings count
    - Bookings by status
    - Total revenue
    """
    stats = get_booking_stats()
    return stats