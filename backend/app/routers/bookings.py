from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.models.booking_models import (
    SimpleBookingRequest, SimpleBookingResponse, SimpleBookingListResponse
)
from app.services.booking_service import (
    create_simple_booking, get_simple_booking, update_booking_flexible,
    get_bookings_by_student, get_bookings_by_mentor, get_bookings_by_class
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings - Simplified API"]
)

# ==========================================
# SIMPLIFIED BOOKINGS API - 3 ENDPOINTS ONLY
# ==========================================

@router.post("/")
def create_booking(booking_request: SimpleBookingRequest):
    """
    Create a booking with complete MongoDB flexibility.
    
    Example:
    {
      "studentId": "user031",
      "classId": "class_anime_001", 
      "personalGoals": "Learn anime character design",
      "pricing": {
        "finalPrice": 480,
        "currency": "GBP"
      },
      "anyCustomField": "any value"
    }
    """
    booking = create_simple_booking(booking_request)
    return {"booking": booking}

@router.put("/{booking_id}")
def update_booking(
    booking_id: str, 
    update_data: Dict[str, Any],
    action: Optional[str] = Query(None, description="Quick action: confirm, cancel, mark_attendance")
):
    """
    Universal booking updater - handles everything in one endpoint.
    
    Supports all operations:
    - Basic updates: PUT /bookings/123 with JSON body
    - Quick actions: PUT /bookings/123?action=confirm
    - Attendance: PUT /bookings/123?action=mark_attendance with session data
    - Cancellation: PUT /bookings/123?action=cancel
    - Any custom fields: { "mentorNotes": "Great student", "customField": "value" }
    
    Examples:
    
    # Confirm booking (payment received)
    PUT /bookings/123?action=confirm
    Body: { "paymentId": "pay_123", "confirmedAt": "2025-08-12T10:30:00Z" }
    
    # Cancel booking
    PUT /bookings/123?action=cancel
    Body: { "cancelReason": "Student unavailable", "refundAmount": 480 }
    
    # Mark session attendance
    PUT /bookings/123?action=mark_attendance
    Body: { 
      "sessionDate": "2025-08-15", 
      "status": "present", 
      "notes": "Great participation",
      "markedBy": "mentor_id"
    }
    
    # Custom update
    PUT /bookings/123
    Body: { "specialRequests": "Need earlier time slot", "priorityLevel": "high" }
    """
    try:
        # Handle quick actions with predefined logic
        if action == "confirm":
            # Merge user data with confirmation defaults
            confirm_data = {
                "bookingStatus": "confirmed",
                "paymentStatus": "paid",
                **update_data  # User can override defaults
            }
            booking = update_booking_flexible(booking_id, confirm_data)
            
        elif action == "cancel":
            # Merge user data with cancellation defaults
            cancel_data = {
                "bookingStatus": "cancelled",
                "isCancelled": True,
                "cancelledAt": update_data.get("cancelledAt"),
                **update_data  # User can override defaults
            }
            booking = update_booking_flexible(booking_id, cancel_data)
            
        elif action == "mark_attendance":
            # Handle attendance as part of booking data
            # Get current booking to update attendance records
            current_booking = get_simple_booking(booking_id)
            if not current_booking:
                raise HTTPException(status_code=404, detail="Booking not found")
            
            # Initialize attendance array if doesn't exist
            attendance_records = current_booking.get("attendance", [])
            
            # Add new attendance record
            session_date = update_data.get("sessionDate")
            if not session_date:
                raise HTTPException(status_code=400, detail="sessionDate required for attendance")
            
            # Remove existing attendance for same date (update scenario)
            attendance_records = [a for a in attendance_records if a.get("sessionDate") != session_date]
            
            # Add new attendance record
            new_attendance = {
                "sessionDate": session_date,
                "status": update_data.get("status", "present"),
                "notes": update_data.get("notes", ""),
                "markedBy": update_data.get("markedBy", ""),
                "markedAt": update_data.get("markedAt")
            }
            attendance_records.append(new_attendance)
            
            # Update booking with attendance data
            attendance_update = {
                "attendance": attendance_records,
                **{k: v for k, v in update_data.items() if k not in ['sessionDate', 'status', 'notes', 'markedBy', 'markedAt']}
            }
            booking = update_booking_flexible(booking_id, attendance_update)
            
        else:
            # Direct flexible update - no action processing
            booking = update_booking_flexible(booking_id, update_data)
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        response = {"booking": booking}
        if action:
            response["action_performed"] = action
            
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update booking: {str(e)}")

@router.get("/")
def get_bookings(
    bookingId: Optional[str] = Query(None, description="Get specific booking by ID"),
    studentId: Optional[str] = Query(None, description="Get bookings for student"),
    mentorId: Optional[str] = Query(None, description="Get bookings for mentor"), 
    classId: Optional[str] = Query(None, description="Get bookings for class"),
    include_attendance: bool = Query(True, description="Include attendance records"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Universal booking getter - handles single booking and filtered lists.
    
    Examples:
    - GET /bookings?bookingId=booking_123 - Get specific booking
    - GET /bookings?studentId=user031 - Student's bookings
    - GET /bookings?mentorId=user026 - Mentor's bookings  
    - GET /bookings?classId=class_anime_001 - Class bookings
    - GET /bookings?studentId=user031&include_attendance=false - Without attendance data
    """
    try:
        # Handle single booking request
        if bookingId:
            booking = get_simple_booking(bookingId)
            if not booking:
                raise HTTPException(status_code=404, detail="Booking not found")
            
            # Optionally filter out attendance data
            if not include_attendance and "attendance" in booking:
                booking_copy = booking.copy()
                del booking_copy["attendance"]
                booking = booking_copy
                
            return {"booking": booking}
        
        # Handle filtered list requests
        if studentId:
            bookings, total = get_bookings_by_student(studentId, page, pageSize)
        elif mentorId:
            bookings, total = get_bookings_by_mentor(mentorId, page, pageSize)
        elif classId:
            bookings, total = get_bookings_by_class(classId, page, pageSize)
        else:
            raise HTTPException(status_code=400, detail="Must provide bookingId, studentId, mentorId, or classId")
        
        # Optionally filter out attendance data from list results
        if not include_attendance:
            filtered_bookings = []
            for booking in bookings:
                if "attendance" in booking:
                    booking_copy = booking.copy()
                    del booking_copy["attendance"]
                    filtered_bookings.append(booking_copy)
                else:
                    filtered_bookings.append(booking)
            bookings = filtered_bookings
        
        total_pages = (total + pageSize - 1) // pageSize
        
        return {
            "bookings": bookings,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": total_pages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get bookings: {str(e)}")

# ==========================================
# SIMPLIFIED TO 3 ENDPOINTS TOTAL
# POST /bookings/ - Create booking
# GET /bookings/ - Get bookings (supports bookingId filter for single booking)
# PUT /bookings/{booking_id} - Update everything (confirmation, cancellation, attendance, custom fields)
# ==========================================