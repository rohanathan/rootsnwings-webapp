from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from app.models.booking_models import (
    OneOnOneBookingRequest, RecurringOneOnOneBookingRequest,
    OneOnOneBooking, OneOnOneBookingResponse, OneOnOneBookingListResponse,
    OneOnOneAvailabilityResponse, RecurringBookingResponse, BookingStatus
)
from app.services.one_on_one_booking_service import OneOnOneBookingService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/bookings/one-on-one", tags=["one-on-one-bookings"])
booking_service = OneOnOneBookingService()

@router.get("/mentors/{mentor_id}/availability", response_model=OneOnOneAvailabilityResponse)
async def get_mentor_availability_for_booking(
    mentor_id: str,
    date_from: str = Query(..., description="Start date in YYYY-MM-DD format"),
    date_to: str = Query(..., description="End date in YYYY-MM-DD format")
):
    """Get available slots for a mentor within a date range for 1-on-1 bookings"""
    try:
        availability = await booking_service.get_mentor_available_slots(mentor_id, date_from, date_to)
        return availability
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get mentor availability: {str(e)}"
        )

@router.post("/", response_model=OneOnOneBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_one_on_one_booking(
    request: OneOnOneBookingRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a single 1-on-1 booking"""
    # Verify user is the student, parent, or admin
    user_id = current_user.get('uid')
    is_authorized = (
        user_id == request.studentId or 
        user_id == request.parentId or 
        current_user.get('isAdmin', False)
    )
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create this booking"
        )
    
    try:
        booking = await booking_service.create_one_on_one_booking(request)
        return OneOnOneBookingResponse(booking=booking)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {str(e)}"
        )

@router.post("/test", response_model=OneOnOneBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_one_on_one_booking_test(
    request: OneOnOneBookingRequest
):
    """Create a single 1-on-1 booking (test endpoint)"""
    try:
        booking = await booking_service.create_one_on_one_booking(request)
        return OneOnOneBookingResponse(booking=booking)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {str(e)}"
        )

@router.post("/recurring", response_model=RecurringBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring_one_on_one_booking(
    request: RecurringOneOnOneBookingRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create recurring 1-on-1 bookings"""
    # Verify user is the student, parent, or admin
    user_id = current_user.get('uid')
    is_authorized = (
        user_id == request.studentId or 
        user_id == request.parentId or 
        current_user.get('isAdmin', False)
    )
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create this booking"
        )
    
    try:
        parent_booking_id, bookings = await booking_service.create_recurring_booking(request)
        
        return RecurringBookingResponse(
            parentBookingId=parent_booking_id,
            bookings=bookings,
            totalSessions=request.numberOfSessions,
            bookedSessions=len(bookings),
            message=f"Successfully created {len(bookings)} out of {request.numberOfSessions} requested sessions"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create recurring booking: {str(e)}"
        )

@router.get("/{booking_id}/test", response_model=OneOnOneBookingResponse)
async def get_one_on_one_booking_test(booking_id: str):
    """Get a specific 1-on-1 booking (test endpoint)"""
    booking = await booking_service.get_booking(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return OneOnOneBookingResponse(booking=booking)

@router.get("/{booking_id}", response_model=OneOnOneBookingResponse)
async def get_one_on_one_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific 1-on-1 booking"""
    booking = await booking_service.get_booking(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify user has access to this booking
    user_id = current_user.get('uid')
    is_authorized = (
        user_id == booking.studentId or 
        user_id == booking.mentorId or 
        user_id == booking.parentId or 
        current_user.get('isAdmin', False)
    )
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    return OneOnOneBookingResponse(booking=booking)

@router.post("/{booking_id}/confirm/test", response_model=OneOnOneBookingResponse)
async def confirm_one_on_one_booking_test(
    booking_id: str
):
    """Confirm a 1-on-1 booking (test endpoint)"""
    confirmed_booking = await booking_service.confirm_booking(booking_id)
    
    if not confirmed_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return OneOnOneBookingResponse(booking=confirmed_booking)

@router.post("/{booking_id}/confirm", response_model=OneOnOneBookingResponse)
async def confirm_one_on_one_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Confirm a 1-on-1 booking (after payment)"""
    booking = await booking_service.get_booking(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify user is the student, parent, or admin
    user_id = current_user.get('uid')
    is_authorized = (
        user_id == booking.studentId or 
        user_id == booking.parentId or 
        current_user.get('isAdmin', False)
    )
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm this booking"
        )
    
    confirmed_booking = await booking_service.confirm_booking(booking_id)
    
    if not confirmed_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return OneOnOneBookingResponse(booking=confirmed_booking)

@router.post("/{booking_id}/cancel", response_model=OneOnOneBookingResponse)
async def cancel_one_on_one_booking(
    booking_id: str,
    reason: Optional[str] = Query(None, description="Cancellation reason"),
    current_user: dict = Depends(get_current_user)
):
    """Cancel a 1-on-1 booking"""
    booking = await booking_service.get_booking(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify user can cancel this booking
    user_id = current_user.get('uid')
    is_authorized = (
        user_id == booking.studentId or 
        user_id == booking.mentorId or 
        user_id == booking.parentId or 
        current_user.get('isAdmin', False)
    )
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
    cancelled_booking = await booking_service.cancel_booking(booking_id, reason)
    
    if not cancelled_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return OneOnOneBookingResponse(booking=cancelled_booking)

@router.get("/students/{student_id}/list", response_model=OneOnOneBookingListResponse)
async def get_student_one_on_one_bookings(
    student_id: str,
    status: Optional[BookingStatus] = Query(None, description="Filter by booking status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user)
):
    """Get all 1-on-1 bookings for a student"""
    # Verify user can access this student's bookings
    user_id = current_user.get('uid')
    if user_id != student_id and not current_user.get('isAdmin', False):
        # Check if user is parent of this student (you might need to implement this check)
        pass
    
    bookings = await booking_service.get_student_bookings(student_id, status)
    
    # Apply pagination
    total = len(bookings)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_bookings = bookings[start:end]
    total_pages = (total + page_size - 1) // page_size
    
    return OneOnOneBookingListResponse(
        bookings=paginated_bookings,
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages
    )

@router.get("/mentors/{mentor_id}/list", response_model=OneOnOneBookingListResponse)
async def get_mentor_one_on_one_bookings(
    mentor_id: str,
    status: Optional[BookingStatus] = Query(None, description="Filter by booking status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user)
):
    """Get all 1-on-1 bookings for a mentor"""
    # Verify user is the mentor or admin
    user_id = current_user.get('uid')
    if user_id != mentor_id and not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this mentor's bookings"
        )
    
    bookings = await booking_service.get_mentor_bookings(mentor_id, status)
    
    # Apply pagination
    total = len(bookings)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_bookings = bookings[start:end]
    total_pages = (total + page_size - 1) // page_size
    
    return OneOnOneBookingListResponse(
        bookings=paginated_bookings,
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages
    )