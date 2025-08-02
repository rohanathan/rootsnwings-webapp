from app.services.firestore import db
from app.models.user_models import (
    StudentProfile, ActiveBookingsSummary, NextSession, 
    UpcomingSessions, UpcomingSession
)
from app.models.booking_models import Booking, BookingStatus
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class StudentBookingService:
    """Service to update student profiles with booking information"""
    
    @staticmethod
    def update_student_booking_summary(student_id: str, booking: Booking) -> None:
        """
        Update student profile with booking information
        Called when booking is created, confirmed, or cancelled
        """
        try:
            # Get student profile
            student_doc = db.collection("students").document(student_id).get()
            if not student_doc.exists:
                logger.warning(f"Student profile not found for ID: {student_id}")
                return
            
            # Get all active bookings for this student
            active_bookings = StudentBookingService._get_active_bookings(student_id)
            
            # Get upcoming sessions
            upcoming_sessions = StudentBookingService._get_upcoming_sessions(student_id)
            
            # Find next session
            next_session = StudentBookingService._find_next_session(upcoming_sessions)
            
            # Update student profile
            update_data = {
                "activeBookingsSummary": {
                    "count": len(active_bookings),
                    "nextSession": next_session.dict() if next_session else NextSession().dict()
                },
                "upcomingSessions": {
                    "items": [session.dict() for session in upcoming_sessions]
                },
                "updatedAt": datetime.now().isoformat()
            }
            
            db.collection("students").document(student_id).update(update_data)
            logger.info(f"Updated student {student_id} booking summary: {len(active_bookings)} active bookings")
            
        except Exception as e:
            logger.error(f"Failed to update student booking summary: {str(e)}")
            # Don't raise exception - this is a supporting function
    
    @staticmethod
    def _get_active_bookings(student_id: str) -> List[Booking]:
        """Get all active bookings for a student"""
        try:
            bookings_query = db.collection("bookings").where("studentId", "==", student_id)
            docs = bookings_query.stream()
            
            active_bookings = []
            for doc in docs:
                booking_data = doc.to_dict()
                
                # Handle missing sessionProgress for existing bookings
                if 'sessionProgress' not in booking_data:
                    total_sessions = len(booking_data.get('scheduledSlots', []))
                    booking_data['sessionProgress'] = {
                        'totalSessions': total_sessions,
                        'completedSessions': 0,
                        'attendedSessions': 0,
                        'missedSessions': 0,
                        'nextSessionNumber': 1,
                        'progressPercentage': 0.0
                    }
                
                # Handle missing sessionNumber in scheduledSlots for existing bookings
                scheduled_slots = booking_data.get('scheduledSlots', [])
                for i, slot in enumerate(scheduled_slots):
                    if isinstance(slot, dict) and 'sessionNumber' not in slot:
                        slot['sessionNumber'] = i + 1
                    if isinstance(slot, dict) and 'dayOfWeek' not in slot:
                        slot['dayOfWeek'] = 'TBD'
                    if isinstance(slot, dict) and 'attendanceStatus' not in slot:
                        slot['attendanceStatus'] = 'pending'
                
                booking = Booking(**booking_data)
                
                # Only include confirmed bookings
                if booking.bookingStatus in [BookingStatus.CONFIRMED, BookingStatus.PENDING]:
                    active_bookings.append(booking)
            
            return active_bookings
            
        except Exception as e:
            logger.error(f"Failed to get active bookings: {str(e)}")
            return []
    
    @staticmethod
    def _get_upcoming_sessions(student_id: str) -> List[UpcomingSession]:
        """Get upcoming sessions for a student"""
        try:
            bookings = StudentBookingService._get_active_bookings(student_id)
            upcoming_sessions = []
            
            for booking in bookings:
                for slot_data in booking.scheduledSlots:
                    # Handle both dict and object formats
                    if isinstance(slot_data, dict):
                        slot_date = slot_data.get('date')
                        slot_start_time = slot_data.get('startTime')
                        slot_end_time = slot_data.get('endTime')
                        session_number = slot_data.get('sessionNumber', 1)
                        day_of_week = slot_data.get('dayOfWeek', '')
                    else:
                        slot_date = slot_data.date
                        slot_start_time = slot_data.startTime
                        slot_end_time = slot_data.endTime
                        session_number = getattr(slot_data, 'sessionNumber', 1)
                        day_of_week = getattr(slot_data, 'dayOfWeek', '')
                    
                    # Parse session date and check if it's in the future
                    try:
                        session_date = datetime.strptime(slot_date, '%Y-%m-%d')
                        if session_date.date() >= datetime.now().date():
                            upcoming_session = UpcomingSession(
                                bookingId=booking.bookingId,
                                classId=booking.classId,
                                classTitle=f"{booking.className} (Session {session_number})",
                                mentorName=booking.mentorName,
                                sessionDate=slot_date,
                                sessionTime=f"{slot_start_time} - {slot_end_time}",
                                format="online" if "online" in booking.className.lower() else "in-person",
                                status=f"{booking.bookingStatus.value} - Session {session_number}"
                            )
                            upcoming_sessions.append(upcoming_session)
                    except (ValueError, AttributeError) as e:
                        logger.warning(f"Invalid date format in booking {booking.bookingId}: {str(e)}")
                        continue
            
            # Sort by session date
            upcoming_sessions.sort(key=lambda x: x.sessionDate)
            return upcoming_sessions[:10]  # Limit to 10 upcoming sessions
            
        except Exception as e:
            logger.error(f"Failed to get upcoming sessions: {str(e)}")
            return []
    
    @staticmethod
    def _find_next_session(upcoming_sessions: List[UpcomingSession]) -> Optional[NextSession]:
        """Find the next upcoming session"""
        if not upcoming_sessions:
            return None
        
        # Return the earliest upcoming session
        next_upcoming = upcoming_sessions[0]
        return NextSession(
            bookingId=next_upcoming.bookingId,
            classId=next_upcoming.classId,
            classTitle=next_upcoming.classTitle,
            mentorName=next_upcoming.mentorName,
            sessionDate=next_upcoming.sessionDate,
            format=next_upcoming.format
        )
    
    @staticmethod
    def refresh_all_student_summaries() -> int:
        """
        Refresh booking summaries for all students (utility function for data migration)
        Returns number of students updated
        """
        try:
            students_docs = db.collection("students").stream()
            updated_count = 0
            
            for student_doc in students_docs:
                student_id = student_doc.id
                StudentBookingService.update_student_booking_summary(student_id, None)
                updated_count += 1
            
            logger.info(f"Refreshed booking summaries for {updated_count} students")
            return updated_count
            
        except Exception as e:
            logger.error(f"Failed to refresh student summaries: {str(e)}")
            return 0

# Convenience function for easy import
def update_student_booking_summary(student_id: str, booking: Optional[Booking] = None) -> None:
    """Update student booking summary - convenience function"""
    StudentBookingService.update_student_booking_summary(student_id, booking)