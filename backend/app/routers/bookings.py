from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.booking_models import (
    SimpleBooking, SimpleBookingRequest, SimpleBookingUpdate, 
    SimpleBookingResponse, SimpleBookingListResponse,
    SessionAttendance, SessionAttendanceRequest, AttendanceResponse, AttendanceListResponse
)
from app.services.booking_service import (
    create_simple_booking, get_simple_booking, update_booking_flexible,
    get_bookings_by_student, get_bookings_by_mentor, get_bookings_by_class,
    confirm_booking, cancel_booking, mark_attendance, get_attendance_by_booking
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

# CORE 3 BOOKING ENDPOINTS

@router.post("/", response_model=SimpleBookingResponse)
def create_booking(booking_request: SimpleBookingRequest):
    """
    Create a minimal booking - just references classId for schedule info.
    
    Frontend handles all session calculations from class.schedule.weeklySchedule
    
    Example:
    {
      "studentId": "user031",
      "classId": "class_anime_001", 
      "personalGoals": "Learn anime character design",
      "pricing": {
        "finalPrice": 480,
        "currency": "GBP"
      }
    }
    """
    booking = create_simple_booking(booking_request)
    return {"booking": booking}

@router.put("/{booking_id}")
def update_booking_status(booking_id: str, update_data: dict):
    """
    Update booking with any fields - pure MongoDB flexibility.
    
    Frontend can send ANY field it wants:
    - { "isCancelled": true }
    - { "bookingStatus": "confirmed", "paymentStatus": "paid", "customField": "value" }
    - { "mentorNotes": "Excellent student" }
    - { "anyField": "anyValue" }
    """
    booking = update_booking_flexible(booking_id, update_data)
    return {"booking": booking}

@router.get("/", response_model=SimpleBookingListResponse)
def get_bookings(
    studentId: Optional[str] = Query(None, description="Get bookings for student"),
    mentorId: Optional[str] = Query(None, description="Get bookings for mentor"), 
    classId: Optional[str] = Query(None, description="Get bookings for class"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get bookings with filtering and pagination.
    
    Examples:
    - /simple-bookings?studentId=user031 - Student's bookings
    - /simple-bookings?mentorId=user026 - Mentor's bookings  
    - /simple-bookings?classId=class_anime_001 - Class bookings
    """
    if studentId:
        bookings, total = get_bookings_by_student(studentId, page, pageSize)
    elif mentorId:
        bookings, total = get_bookings_by_mentor(mentorId, page, pageSize)
    elif classId:
        bookings, total = get_bookings_by_class(classId, page, pageSize)
    else:
        raise HTTPException(status_code=400, detail="Must provide studentId, mentorId, or classId")
    
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "bookings": bookings,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

# CONVENIENCE ENDPOINTS

@router.get("/{booking_id}", response_model=SimpleBookingResponse)
def get_booking_by_id(booking_id: str):
    """Get specific booking by ID"""
    booking = get_simple_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": booking}

@router.post("/{booking_id}/confirm", response_model=SimpleBookingResponse)
def confirm_booking_payment(booking_id: str):
    """Confirm booking and mark as paid (moves from pending → confirmed)"""
    booking = confirm_booking(booking_id)
    return {"booking": booking}

@router.post("/{booking_id}/cancel", response_model=SimpleBookingResponse)
def cancel_booking_request(booking_id: str):
    """Cancel booking and mark as refunded"""
    booking = cancel_booking(booking_id)
    return {"booking": booking}

# OPTIONAL ATTENDANCE ENDPOINTS

@router.post("/{booking_id}/attendance", response_model=AttendanceResponse)
def mark_session_attendance(
    booking_id: str, 
    attendance_request: SessionAttendanceRequest,
    marked_by: str = Query(..., description="Mentor ID marking attendance")
):
    """
    Mark attendance for a specific session (optional feature).
    
    Example:
    {
      "bookingId": "booking_123",
      "sessionDate": "2025-08-05", 
      "status": "present",
      "notes": "Great participation"
    }
    """
    # Override bookingId from URL path
    attendance_request.bookingId = booking_id
    attendance = mark_attendance(attendance_request, marked_by)
    return {"attendance": attendance}

@router.get("/{booking_id}/attendance", response_model=AttendanceListResponse)
def get_booking_attendance(booking_id: str):
    """Get all attendance records for a booking"""
    attendance_records = get_attendance_by_booking(booking_id)
    return {
        "attendance": attendance_records,
        "total": len(attendance_records)
    }