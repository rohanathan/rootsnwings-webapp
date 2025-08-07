from app.services.firestore import db
from app.models.booking_models import (
    SimpleBooking, SimpleBookingRequest, SimpleBookingUpdate, 
    BookingStatus, PaymentStatus, SessionAttendance, SessionAttendanceRequest
)
from datetime import datetime
from typing import List, Optional, Dict, Tuple
from fastapi import HTTPException
import uuid

def create_simple_booking(booking_request: SimpleBookingRequest) -> SimpleBooking:
    """Create a minimal booking - just references classId for all schedule info"""
    try:
        # Generate unique booking ID
        booking_id = f"booking_{uuid.uuid4().hex[:12]}"
        
        # Get student and class information
        student_doc = db.collection("users").document(booking_request.studentId).get()
        if not student_doc.exists:
            raise HTTPException(status_code=404, detail="Student not found")
        
        class_doc = db.collection("classes").document(booking_request.classId).get()
        if not class_doc.exists:
            raise HTTPException(status_code=404, detail="Class not found")
        
        student_data = student_doc.to_dict()
        class_data = class_doc.to_dict()
        
        # Create minimal booking data - NO session generation!
        booking_data = {
            "bookingId": booking_id,
            "studentId": booking_request.studentId,
            "studentName": student_data.get("displayName", "Unknown Student"),
            "classId": booking_request.classId,
            "className": class_data.get("title", "Unknown Class"),
            "mentorId": class_data.get("mentorId"),
            "mentorName": class_data.get("mentorName", "Unknown Mentor"),
            "parentId": booking_request.parentId,
            "youngLearnerName": booking_request.youngLearnerName,
            "bookingStatus": BookingStatus.PENDING,
            "paymentStatus": PaymentStatus.UNPAID,
            "pricing": booking_request.pricing.dict(),
            "personalGoals": booking_request.personalGoals,
            "mentorNotes": None,
            "studentRating": None,
            "studentReview": None,
            "bookedAt": datetime.now().isoformat(),
            "confirmedAt": None,
            "completedAt": None,
            "cancelledAt": None
        }
        
        # Save to Firestore
        db.collection("bookings").document(booking_id).set(booking_data)
        
        return SimpleBooking(**booking_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

def get_simple_booking(booking_id: str) -> Optional[SimpleBooking]:
    """Get a booking by ID"""
    doc = db.collection("bookings").document(booking_id).get()
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    data["bookingId"] = doc.id
    return SimpleBooking(**data)

def update_simple_booking(booking_id: str, booking_update: SimpleBookingUpdate) -> SimpleBooking:
    """Update booking status and basic fields"""
    try:
        doc_ref = db.collection("bookings").document(booking_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Prepare update data
        update_data = {}
        
        # Update fields if provided
        if booking_update.bookingStatus is not None:
            update_data["bookingStatus"] = booking_update.bookingStatus
            
            # Set timestamp based on status
            if booking_update.bookingStatus == BookingStatus.CONFIRMED:
                update_data["confirmedAt"] = datetime.now().isoformat()
            elif booking_update.bookingStatus == BookingStatus.COMPLETED:
                update_data["completedAt"] = datetime.now().isoformat()
            elif booking_update.bookingStatus == BookingStatus.CANCELLED:
                update_data["cancelledAt"] = datetime.now().isoformat()
        
        if booking_update.paymentStatus is not None:
            update_data["paymentStatus"] = booking_update.paymentStatus
        
        if booking_update.personalGoals is not None:
            update_data["personalGoals"] = booking_update.personalGoals
        
        if booking_update.mentorNotes is not None:
            update_data["mentorNotes"] = booking_update.mentorNotes
        
        if booking_update.studentRating is not None:
            update_data["studentRating"] = booking_update.studentRating
        
        if booking_update.studentReview is not None:
            update_data["studentReview"] = booking_update.studentReview
        
        # Update Firestore
        doc_ref.update(update_data)
        
        # Return updated booking
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data["bookingId"] = booking_id
        return SimpleBooking(**data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update booking: {str(e)}")

def get_bookings_by_student(student_id: str, page: int = 1, page_size: int = 20) -> Tuple[List[SimpleBooking], int]:
    """Get bookings for a student with pagination"""
    query = db.collection("bookings").where("studentId", "==", student_id)
    
    # Get total count
    total = len(list(query.stream()))
    
    # Get paginated results
    offset = (page - 1) * page_size
    docs = query.limit(page_size).offset(offset).stream()
    
    bookings = []
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(SimpleBooking(**data))
    
    return bookings, total

def get_bookings_by_mentor(mentor_id: str, page: int = 1, page_size: int = 20) -> Tuple[List[SimpleBooking], int]:
    """Get bookings for a mentor with pagination"""
    query = db.collection("bookings").where("mentorId", "==", mentor_id)
    
    # Get total count
    total = len(list(query.stream()))
    
    # Get paginated results
    offset = (page - 1) * page_size
    docs = query.limit(page_size).offset(offset).stream()
    
    bookings = []
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(SimpleBooking(**data))
    
    return bookings, total

def get_bookings_by_class(class_id: str, page: int = 1, page_size: int = 20) -> Tuple[List[SimpleBooking], int]:
    """Get bookings for a specific class with pagination"""
    query = db.collection("bookings").where("classId", "==", class_id)
    
    # Get total count
    total = len(list(query.stream()))
    
    # Get paginated results
    offset = (page - 1) * page_size
    docs = query.limit(page_size).offset(offset).stream()
    
    bookings = []
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(SimpleBooking(**data))
    
    return bookings, total

def confirm_booking(booking_id: str) -> SimpleBooking:
    """Confirm booking and mark as paid"""
    booking_update = SimpleBookingUpdate(
        bookingStatus=BookingStatus.CONFIRMED,
        paymentStatus=PaymentStatus.PAID
    )
    return update_simple_booking(booking_id, booking_update)

def cancel_booking(booking_id: str) -> SimpleBooking:
    """Cancel booking and mark as refunded"""
    booking_update = SimpleBookingUpdate(
        bookingStatus=BookingStatus.CANCELLED,
        paymentStatus=PaymentStatus.REFUNDED
    )
    return update_simple_booking(booking_id, booking_update)

# OPTIONAL ATTENDANCE FUNCTIONS

def mark_attendance(attendance_request: SessionAttendanceRequest, marked_by: str) -> SessionAttendance:
    """Mark attendance for a specific session"""
    try:
        # Verify booking exists
        booking = get_simple_booking(attendance_request.bookingId)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Generate attendance ID
        attendance_id = f"attendance_{uuid.uuid4().hex[:12]}"
        
        # Create attendance record
        attendance_data = {
            "attendanceId": attendance_id,
            "bookingId": attendance_request.bookingId,
            "studentId": booking.studentId,
            "classId": booking.classId,
            "sessionDate": attendance_request.sessionDate,
            "status": attendance_request.status,
            "notes": attendance_request.notes,
            "markedAt": datetime.now().isoformat(),
            "markedBy": marked_by
        }
        
        # Save to separate attendance collection
        db.collection("attendance").document(attendance_id).set(attendance_data)
        
        return SessionAttendance(**attendance_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark attendance: {str(e)}")

def get_attendance_by_booking(booking_id: str) -> List[SessionAttendance]:
    """Get all attendance records for a booking"""
    docs = db.collection("attendance").where("bookingId", "==", booking_id).stream()
    
    attendance_records = []
    for doc in docs:
        data = doc.to_dict()
        data["attendanceId"] = doc.id
        attendance_records.append(SessionAttendance(**data))
    
    return sorted(attendance_records, key=lambda x: x.sessionDate)

def get_all_bookings(limit: int = 100) -> List[SimpleBooking]:
    """Get all bookings (for reviews/testimonials)"""
    try:
        docs = db.collection("bookings").limit(limit).stream()
        bookings = []
        
        for doc in docs:
            booking_data = doc.to_dict()
            booking_data["bookingId"] = doc.id
            
            # Convert to SimpleBooking model
            try:
                booking = SimpleBooking(**booking_data)
                bookings.append(booking)
            except Exception as e:
                # Skip invalid bookings
                continue
                
        return bookings
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get all bookings: {str(e)}")