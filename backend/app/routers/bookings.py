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
    tags=["Bookings"]
)

# ==========================================
# SIMPLIFIED BOOKINGS API - 3 ENDPOINTS ONLY
# ==========================================

@router.post("")
def create_booking(booking_request: SimpleBookingRequest):
    """
    Create new booking - used by booking confirmation flow and admin booking creation.
    
    FRONTEND USAGE PATTERNS:
    - Booking Confirmation Page: POST /bookings
      Creates booking with studentId, classId, personalGoals, parentId (for young learners)
      
    - Admin Booking Creation: POST /bookings  
      Administrative booking creation with full field flexibility
      
    - One-on-One Booking: POST /bookings
      Direct booking creation for immediate mentor-student sessions
      
    REQUEST FIELDS USAGE:
    - studentId, classId: Core relationship fields (always required)
    - personalGoals: Student's learning objectives (displayed on user booking page)
    - parentId, youngLearnerName: Family account support for child bookings
    - Custom pricing, notes: Admin/special booking scenarios
    
    RESPONSE: Returns complete booking object for immediate frontend display
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
    - Basic updates: PUT /bookings123 with JSON body
    - Quick actions: PUT /bookings123?action=confirm
    - Attendance: PUT /bookings123?action=mark_attendance with session data
    - Cancellation: PUT /bookings123?action=cancel
    - Any custom fields: { "mentorNotes": "Great student", "customField": "value" }
    
    Examples:
    
    # Confirm booking (payment received)
    PUT /bookings123?action=confirm
    Body: { "paymentId": "pay_123", "confirmedAt": "2025-08-12T10:30:00Z" }
    
    # Cancel booking
    PUT /bookings123?action=cancel
    Body: { "cancelReason": "Student unavailable", "refundAmount": 480 }
    
    # Mark session attendance
    PUT /bookings123?action=mark_attendance
    Body: { 
      "sessionDate": "2025-08-15", 
      "status": "present", 
      "notes": "Great participation",
      "markedBy": "mentor_id"
    }
    
    # Custom update
    PUT /bookings123
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

@router.get("")
def get_bookings(
    bookingId: Optional[str] = Query(None, description="Get specific booking by ID - USED BY: Booking detail views and status checks"),
    studentId: Optional[str] = Query(None, description="Get student's bookings - USED BY: User bookings page (?studentId={uid}), User dashboard enrollment list"),
    mentorId: Optional[str] = Query(None, description="Get mentor's bookings - USED BY: Mentor dashboard student lists, Mentor class management"), 
    classId: Optional[str] = Query(None, description="Get class enrollments - USED BY: Mentor class pages (?classId={id}), Admin class enrollment tracking"),
    include_attendance: bool = Query(True, description="Include attendance data - USED BY: Progress tracking (true), Basic lists (false)"),
    page: int = Query(1, ge=1, description="Page number - USED BY: User bookings pagination, Admin booking lists"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page - USED BY: Dashboard summaries (5-10), Full lists (20-50)")
):
    """
    Universal booking retrieval endpoint used across user dashboards, mentor management, and admin interfaces.
    
    FRONTEND USAGE PATTERNS:
    - User Bookings Page: GET /bookings?studentId={uid}&pageSize=20
      Returns user's enrolled classes (uses: studentName, className, bookingStatus, bookedAt, progress data)
      
    - User Dashboard: GET /bookings?studentId={uid}&pageSize=5&include_attendance=false  
      Returns recent bookings summary (uses: className, bookingStatus for stats widget)
      
    - Mentor Dashboard: GET /bookings?classId={id}&pageSize=50
      Returns class enrollment list (uses: studentId, studentName for "active students" display)
      
    - Mentor Class Management: GET /bookings?classId={id}
      Returns full enrollment with attendance (uses: ALL fields for comprehensive class management)
      
    - Admin Booking Management: GET /bookings?mentorId={id} OR ?studentId={id}
      Returns user's booking history for admin review and support
      
    FILTERING BEHAVIOR:
    - Single booking: bookingId parameter returns individual booking details
    - Student focus: studentId returns user's personal booking history
    - Mentor focus: mentorId returns all bookings for mentor's classes
    - Class focus: classId returns enrollment list for specific class
    
    RESPONSE FIELD USAGE:
    - User interfaces: Student/class names, status, progress, timeline data
    - Mentor interfaces: Student info, payment status, attendance tracking
    - Admin interfaces: Complete booking data for support and management
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
# POST /bookings - Create booking
# GET /bookings - Get bookings (supports bookingId filter for single booking)
# PUT /bookings{booking_id} - Update everything (confirmation, cancellation, attendance, custom fields)
# ==========================================