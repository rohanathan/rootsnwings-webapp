from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import uuid
from app.services.firestore import db
from app.services.availability_service import AvailabilityService
from app.services.mentor_service import fetch_mentor_by_id
from app.models.booking_models import (
    OneOnOneBookingRequest, RecurringOneOnOneBookingRequest, OneOnOneBooking,
    AvailableSlotForBooking, OneOnOneAvailabilityResponse,
    BookingStatus, PaymentStatus, AttendanceStatus, Pricing, Discount
)
from app.models.availability_models import SlotBookingRequest, SlotReleaseRequest

class OneOnOneBookingService:
    def __init__(self):
        self.collection = db.collection('one_on_one_bookings')
        self.availability_service = AvailabilityService()
    
    async def get_mentor_available_slots(self, mentor_id: str, date_from: str, date_to: str) -> OneOnOneAvailabilityResponse:
        """Get available slots for a mentor within a date range"""
        # Get mentor details for pricing
        mentor = fetch_mentor_by_id(mentor_id)
        if not mentor:
            raise ValueError(f"Mentor {mentor_id} not found")
        
        # Get mentor's availability
        availability = await self.availability_service.get_mentor_availability(mentor_id)
        if not availability:
            return OneOnOneAvailabilityResponse(
                mentorId=mentor_id,
                mentorName=mentor.displayName,
                availableSlots=[],
                timezone="Europe/London",
                oneOnOneRate=0.0,
                currency="GBP",
                isFirstSessionFree=False
            )
        
        available_slots = []
        current_date = datetime.strptime(date_from, '%Y-%m-%d')
        end_date = datetime.strptime(date_to, '%Y-%m-%d')
        
        while current_date <= end_date:
            day_name = current_date.strftime('%A')  # Monday, Tuesday, etc.
            date_str = current_date.strftime('%Y-%m-%d')
            
            # Find availability for this day
            for day_availability in availability.weeklyAvailability:
                if day_availability.day == day_name:
                    for slot in day_availability.slots:
                        if slot.status == "available":
                            # Calculate duration
                            start_time = datetime.strptime(slot.startTime, '%H:%M').time()
                            end_time = datetime.strptime(slot.endTime, '%H:%M').time()
                            duration = int((datetime.combine(datetime.today(), end_time) - 
                                          datetime.combine(datetime.today(), start_time)).total_seconds() / 60)
                            
                            # Check if slot is already booked for this specific date
                            is_slot_booked = await self._is_slot_booked_for_date(
                                mentor_id, date_str, slot.startTime, slot.endTime
                            )
                            
                            if not is_slot_booked:
                                available_slots.append(AvailableSlotForBooking(
                                    mentorId=mentor_id,
                                    mentorName=mentor.displayName,
                                    day=day_name,
                                    date=date_str,
                                    startTime=slot.startTime,
                                    endTime=slot.endTime,
                                    durationMinutes=duration,
                                    timezone=availability.timezone,
                                    oneOnOneRate=mentor.pricing.oneOnOneRate if mentor.pricing else 50.0,
                                    currency=mentor.pricing.currency if mentor.pricing else "GBP",
                                    isFirstSessionFree=mentor.pricing.firstSessionFree if mentor.pricing else False
                                ))
            
            current_date += timedelta(days=1)
        
        return OneOnOneAvailabilityResponse(
            mentorId=mentor_id,
            mentorName=mentor.displayName,
            availableSlots=available_slots,
            timezone=availability.timezone,
            oneOnOneRate=mentor.pricing.oneOnOneRate if mentor.pricing else 50.0,
            currency=mentor.pricing.currency if mentor.pricing else "GBP",
            isFirstSessionFree=mentor.pricing.firstSessionFree if mentor.pricing else False
        )
    
    async def _is_slot_booked_for_date(self, mentor_id: str, date: str, start_time: str, end_time: str) -> bool:
        """Check if a specific slot is already booked for a specific date"""
        query = (self.collection
                .where('mentorId', '==', mentor_id)
                .where('sessionDate', '==', date)
                .where('startTime', '==', start_time)
                .where('endTime', '==', end_time)
                .where('bookingStatus', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED]))
        
        docs = list(query.stream())
        return len(docs) > 0
    
    async def create_one_on_one_booking(self, request: OneOnOneBookingRequest) -> OneOnOneBooking:
        """Create a single 1-on-1 booking"""
        booking_id = str(uuid.uuid4())
        
        # Get mentor and student details
        mentor = fetch_mentor_by_id(request.mentorId)
        if not mentor:
            raise ValueError(f"Mentor {request.mentorId} not found")
        
        # Get student details (you might need to implement a student service)
        student_name = f"Student {request.studentId}"  # Placeholder
        
        # Check if slot is available
        is_available = await self._check_slot_availability(
            request.mentorId, request.sessionDate, request.startTime, request.endTime
        )
        if not is_available:
            raise ValueError("Time slot is not available")
        
        # Calculate pricing
        pricing = await self._calculate_pricing(request, mentor)
        
        # Calculate duration
        start_time = datetime.strptime(request.startTime, '%H:%M').time()
        end_time = datetime.strptime(request.endTime, '%H:%M').time()
        duration = int((datetime.combine(datetime.today(), end_time) - 
                       datetime.combine(datetime.today(), start_time)).total_seconds() / 60)
        
        # Get day of week
        session_date = datetime.strptime(request.sessionDate, '%Y-%m-%d')
        day_of_week = session_date.strftime('%A')
        
        booking_data = {
            'bookingId': booking_id,
            'bookingType': 'one-on-one',
            'mentorId': request.mentorId,
            'mentorName': mentor.displayName,
            'studentId': request.studentId,
            'studentName': student_name,
            'parentId': request.parentId,
            'youngLearnerName': request.youngLearnerName,
            'sessionDate': request.sessionDate,
            'dayOfWeek': day_of_week,
            'startTime': request.startTime,
            'endTime': request.endTime,
            'timezone': request.timezone,
            'durationMinutes': duration,
            'subject': request.subject,
            'learningGoals': request.learningGoals,
            'specialRequests': request.specialRequests,
            'bookingStatus': BookingStatus.PENDING,
            'paymentStatus': PaymentStatus.UNPAID,
            'pricing': pricing.dict(),
            'isRecurring': request.isRecurring,
            'parentBookingId': None,
            'sessionNumber': 1,
            'totalSessions': 1,
            'attendanceStatus': None,
            'mentorNotes': None,
            'bookedAt': datetime.utcnow(),
            'confirmedAt': None,
            'completedAt': None,
            'cancelledAt': None,
            'lastUpdated': datetime.utcnow()
        }
        
        # Create the booking
        doc_ref = self.collection.document(booking_id)
        doc_ref.set(booking_data)
        
        # Mark the availability slot as booked (we'll do this after payment confirmation)
        # For now, we'll mark it as pending
        
        return OneOnOneBooking(**booking_data)
    
    async def _check_slot_availability(self, mentor_id: str, date: str, start_time: str, end_time: str) -> bool:
        """Check if a mentor's slot is available for booking"""
        # Check against availability system
        has_conflict = await self.availability_service.check_slot_conflict(
            mentor_id, datetime.strptime(date, '%Y-%m-%d').strftime('%A'), start_time, end_time
        )
        if has_conflict:
            return False
        
        # Check against existing bookings
        is_booked = await self._is_slot_booked_for_date(mentor_id, date, start_time, end_time)
        return not is_booked
    
    async def _calculate_pricing(self, request: OneOnOneBookingRequest, mentor) -> Pricing:
        """Calculate pricing for the booking"""
        base_price = mentor.pricing.oneOnOneRate if mentor.pricing else 50.0
        currency = mentor.pricing.currency if mentor.pricing else "GBP"
        
        # Calculate duration in hours
        start_time = datetime.strptime(request.startTime, '%H:%M').time()
        end_time = datetime.strptime(request.endTime, '%H:%M').time()
        duration_hours = (datetime.combine(datetime.today(), end_time) - 
                         datetime.combine(datetime.today(), start_time)).total_seconds() / 3600
        
        total_price = base_price * duration_hours
        discounts_applied = []
        
        # Apply first session free discount if applicable
        is_first_session = await self._is_first_session_for_student(request.studentId, request.mentorId)
        if is_first_session and mentor.pricing and mentor.pricing.firstSessionFree:
            discounts_applied.append(Discount(
                type="first_session_free",
                amount=total_price,
                description="First session free"
            ))
            total_price = 0.0
        
        return Pricing(
            basePrice=base_price * duration_hours,
            discountsApplied=discounts_applied,
            finalPrice=total_price,
            currency=currency
        )
    
    async def _is_first_session_for_student(self, student_id: str, mentor_id: str) -> bool:
        """Check if this is the student's first session with this mentor"""
        query = (self.collection
                .where('studentId', '==', student_id)
                .where('mentorId', '==', mentor_id)
                .where('bookingStatus', 'in', [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]))
        
        docs = list(query.stream())
        return len(docs) == 0
    
    async def confirm_booking(self, booking_id: str) -> Optional[OneOnOneBooking]:
        """Confirm a booking after payment is successful"""
        doc_ref = self.collection.document(booking_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        booking_data = doc.to_dict()
        
        # Update booking status
        update_data = {
            'bookingStatus': BookingStatus.CONFIRMED,
            'paymentStatus': PaymentStatus.PAID,
            'confirmedAt': datetime.utcnow(),
            'lastUpdated': datetime.utcnow()
        }
        
        doc_ref.update(update_data)
        
        # Mark availability slot as booked
        session_date = datetime.strptime(booking_data['sessionDate'], '%Y-%m-%d')
        day_of_week = session_date.strftime('%A')
        
        booking_request = SlotBookingRequest(
            day=day_of_week,
            startTime=booking_data['startTime'],
            endTime=booking_data['endTime'],
            bookingId=booking_id
        )
        
        await self.availability_service.book_time_slot(booking_data['mentorId'], booking_request)
        
        # Get updated booking
        updated_doc = doc_ref.get()
        return OneOnOneBooking(**updated_doc.to_dict())
    
    async def cancel_booking(self, booking_id: str, reason: Optional[str] = None) -> Optional[OneOnOneBooking]:
        """Cancel a booking and release the time slot"""
        doc_ref = self.collection.document(booking_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        booking_data = doc.to_dict()
        
        # Update booking status
        update_data = {
            'bookingStatus': BookingStatus.CANCELLED,
            'cancelledAt': datetime.utcnow(),
            'lastUpdated': datetime.utcnow()
        }
        
        if reason:
            update_data['cancellationReason'] = reason
        
        doc_ref.update(update_data)
        
        # Release availability slot if it was confirmed
        if booking_data.get('bookingStatus') == BookingStatus.CONFIRMED:
            session_date = datetime.strptime(booking_data['sessionDate'], '%Y-%m-%d')
            day_of_week = session_date.strftime('%A')
            
            release_request = SlotReleaseRequest(
                day=day_of_week,
                startTime=booking_data['startTime'],
                endTime=booking_data['endTime']
            )
            
            await self.availability_service.release_time_slot(booking_data['mentorId'], release_request)
        
        # Get updated booking
        updated_doc = doc_ref.get()
        return OneOnOneBooking(**updated_doc.to_dict())
    
    async def get_booking(self, booking_id: str) -> Optional[OneOnOneBooking]:
        """Get a booking by ID"""
        doc = self.collection.document(booking_id).get()
        if doc.exists:
            data = doc.to_dict()
            return OneOnOneBooking(**data)
        return None
    
    async def get_student_bookings(self, student_id: str, status: Optional[BookingStatus] = None) -> List[OneOnOneBooking]:
        """Get all bookings for a student"""
        query = self.collection.where('studentId', '==', student_id)
        
        if status:
            query = query.where('bookingStatus', '==', status)
        
        docs = query.order_by('sessionDate', direction='DESCENDING').stream()
        
        bookings = []
        for doc in docs:
            data = doc.to_dict()
            bookings.append(OneOnOneBooking(**data))
        
        return bookings
    
    async def get_mentor_bookings(self, mentor_id: str, status: Optional[BookingStatus] = None) -> List[OneOnOneBooking]:
        """Get all bookings for a mentor"""
        query = self.collection.where('mentorId', '==', mentor_id)
        
        if status:
            query = query.where('bookingStatus', '==', status)
        
        docs = query.order_by('sessionDate', direction='ASCENDING').stream()
        
        bookings = []
        for doc in docs:
            data = doc.to_dict()
            bookings.append(OneOnOneBooking(**data))
        
        return bookings
    
    async def create_recurring_booking(self, request: RecurringOneOnOneBookingRequest) -> Tuple[str, List[OneOnOneBooking]]:
        """Create recurring 1-on-1 bookings"""
        parent_booking_id = str(uuid.uuid4())
        bookings = []
        
        current_date = datetime.strptime(request.startDate, '%Y-%m-%d')
        
        for session_number in range(1, request.numberOfSessions + 1):
            # Find the next occurrence of the specified day
            while current_date.strftime('%A') != request.dayOfWeek:
                current_date += timedelta(days=1)
            
            # Create individual booking request
            individual_request = OneOnOneBookingRequest(
                mentorId=request.mentorId,
                studentId=request.studentId,
                sessionDate=current_date.strftime('%Y-%m-%d'),
                startTime=request.startTime,
                endTime=request.endTime,
                subject=request.subject,
                learningGoals=request.learningGoals,
                parentId=request.parentId,
                youngLearnerName=request.youngLearnerName,
                timezone=request.timezone,
                isRecurring=True
            )
            
            # Check availability before creating
            is_available = await self._check_slot_availability(
                request.mentorId, current_date.strftime('%Y-%m-%d'), 
                request.startTime, request.endTime
            )
            
            if is_available:
                booking = await self.create_one_on_one_booking(individual_request)
                
                # Update with recurring session info
                doc_ref = self.collection.document(booking.bookingId)
                doc_ref.update({
                    'parentBookingId': parent_booking_id,
                    'sessionNumber': session_number,
                    'totalSessions': request.numberOfSessions
                })
                
                # Get updated booking
                updated_doc = doc_ref.get()
                updated_booking = OneOnOneBooking(**updated_doc.to_dict())
                bookings.append(updated_booking)
            
            # Move to next week
            current_date += timedelta(days=7)
        
        return parent_booking_id, bookings