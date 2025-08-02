from app.services.firestore import db
from app.models.booking_models import Booking, BookingRequest, BookingUpdate, BookingStatus, PaymentStatus
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import HTTPException
import uuid

def create_booking(booking_request: BookingRequest) -> Booking:
    """Create a new booking"""
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
        
        # Generate session slots based on class schedule
        from app.services.session_generator_service import SessionGeneratorService
        
        # Use provided slots or generate from class schedule
        if booking_request.scheduledSlots:
            # Manual slots provided (for workshops or custom scheduling)
            scheduled_slots = [slot.dict() for slot in booking_request.scheduledSlots]
        else:
            # Auto-generate slots for multi-session classes
            generated_slots = SessionGeneratorService.generate_session_slots(class_data)
            scheduled_slots = [slot.dict() for slot in generated_slots]
        
        # Create session progress tracking
        total_sessions = class_data.get('pricing', {}).get('totalSessions', len(scheduled_slots))
        session_progress = SessionGeneratorService.create_session_progress(total_sessions)
        
        # Create booking data
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
            "scheduledSlots": scheduled_slots,
            "attendanceRecord": [],
            "sessionProgress": session_progress.dict(),
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
        
        booking = Booking(**booking_data)
        
        # Update student booking summary
        try:
            from app.services.student_booking_service import update_student_booking_summary
            update_student_booking_summary(booking_request.studentId, booking)
        except Exception as e:
            # Log error but don't fail the booking creation
            print(f"Warning: Failed to update student booking summary: {str(e)}")
        
        # Return booking object
        return booking
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

def get_booking_by_id(booking_id: str) -> Optional[Booking]:
    """Get a booking by ID"""
    doc = db.collection("bookings").document(booking_id).get()
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    data["bookingId"] = doc.id
    return Booking(**data)

def get_bookings_by_student(student_id: str) -> List[Booking]:
    """Get all bookings for a student"""
    docs = db.collection("bookings").where("studentId", "==", student_id).stream()
    bookings = []
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(Booking(**data))
    
    return sorted(bookings, key=lambda x: x.bookedAt, reverse=True)

def get_bookings_by_mentor(mentor_id: str) -> List[Booking]:
    """Get all bookings for a mentor"""
    docs = db.collection("bookings").where("mentorId", "==", mentor_id).stream()
    bookings = []
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(Booking(**data))
    
    return sorted(bookings, key=lambda x: x.bookedAt, reverse=True)

def get_bookings_by_class(class_id: str) -> List[Booking]:
    """Get all bookings for a specific class"""
    docs = db.collection("bookings").where("classId", "==", class_id).stream()
    bookings = []
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(Booking(**data))
    
    return sorted(bookings, key=lambda x: x.bookedAt, reverse=True)

def update_booking(booking_id: str, booking_update: BookingUpdate) -> Booking:
    """Update a booking"""
    try:
        doc_ref = db.collection("bookings").document(booking_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Prepare update data
        update_data = {}
        current_data = doc.to_dict()
        
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
        
        if booking_update.scheduledSlots is not None:
            update_data["scheduledSlots"] = [slot.dict() for slot in booking_update.scheduledSlots]
        
        if booking_update.personalGoals is not None:
            update_data["personalGoals"] = booking_update.personalGoals
        
        if booking_update.mentorNotes is not None:
            update_data["mentorNotes"] = booking_update.mentorNotes
        
        if booking_update.studentRating is not None:
            update_data["studentRating"] = booking_update.studentRating
        
        if booking_update.studentReview is not None:
            update_data["studentReview"] = booking_update.studentReview
        
        # Update the document
        doc_ref.update(update_data)
        
        # Return updated booking
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data["bookingId"] = updated_doc.id
        updated_booking = Booking(**data)
        
        # Update student booking summary
        try:
            from app.services.student_booking_service import update_student_booking_summary
            update_student_booking_summary(updated_booking.studentId, updated_booking)
        except Exception as e:
            # Log error but don't fail the booking update
            print(f"Warning: Failed to update student booking summary: {str(e)}")
        
        return updated_booking
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update booking: {str(e)}")

def cancel_booking(booking_id: str) -> Booking:
    """Cancel a booking"""
    booking_update = BookingUpdate(
        bookingStatus=BookingStatus.CANCELLED,
        paymentStatus=PaymentStatus.REFUNDED  # Assuming refund on cancellation
    )
    return update_booking(booking_id, booking_update)

def confirm_booking(booking_id: str) -> Booking:
    """Confirm a booking"""
    booking_update = BookingUpdate(
        bookingStatus=BookingStatus.CONFIRMED,
        paymentStatus=PaymentStatus.PAID
    )
    return update_booking(booking_id, booking_update)

def get_booking_stats() -> Dict:
    """Get booking statistics"""
    try:
        docs = db.collection("bookings").stream()
        
        stats = {
            "totalBookings": 0,
            "pendingBookings": 0,
            "confirmedBookings": 0,
            "completedBookings": 0,
            "cancelledBookings": 0,
            "totalRevenue": 0.0,
            "currency": "GBP"
        }
        
        for doc in docs:
            data = doc.to_dict()
            stats["totalBookings"] += 1
            
            status = data.get("bookingStatus")
            if status == BookingStatus.PENDING:
                stats["pendingBookings"] += 1
            elif status == BookingStatus.CONFIRMED:
                stats["confirmedBookings"] += 1
            elif status == BookingStatus.COMPLETED:
                stats["completedBookings"] += 1
            elif status == BookingStatus.CANCELLED:
                stats["cancelledBookings"] += 1
            
            # Add to revenue if paid or completed
            if data.get("paymentStatus") in [PaymentStatus.PAID] or status == BookingStatus.COMPLETED:
                pricing = data.get("pricing", {})
                stats["totalRevenue"] += pricing.get("finalPrice", 0)
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get booking stats: {str(e)}")

def get_all_bookings(limit: Optional[int] = None, status: Optional[BookingStatus] = None) -> List[Booking]:
    """Get all bookings with optional filtering"""
    query = db.collection("bookings")
    
    if status:
        query = query.where("bookingStatus", "==", status)
    
    if limit:
        query = query.limit(limit)
    
    docs = query.stream()
    bookings = []
    
    for doc in docs:
        data = doc.to_dict()
        data["bookingId"] = doc.id
        bookings.append(Booking(**data))
    
    return sorted(bookings, key=lambda x: x.bookedAt, reverse=True)