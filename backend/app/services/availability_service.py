from typing import List, Optional, Dict, Any
from datetime import datetime, time, timedelta
import pytz
from app.services.firestore import db
from app.models.availability_models import (
    MentorAvailability, DayAvailability, TimeSlot, SlotStatus,
    CreateAvailabilityRequest, UpdateAvailabilityRequest,
    SlotBookingRequest, SlotReleaseRequest, AvailableSlot
)

class AvailabilityService:
    def __init__(self):
        self.collection = db.collection('availability')
    
    async def create_mentor_availability(self, mentor_id: str, request: CreateAvailabilityRequest) -> MentorAvailability:
        """Create or update mentor's weekly availability"""
        availability_data = {
            'mentorId': mentor_id,
            'weeklyAvailability': [day.dict() for day in request.weeklyAvailability],
            'timezone': request.timezone,
            'isActive': True,
            'createdAt': datetime.utcnow(),
            'lastUpdated': datetime.utcnow()
        }
        
        # Use mentor_id as document ID for easy lookup
        doc_ref = self.collection.document(mentor_id)
        doc_ref.set(availability_data)
        
        return MentorAvailability(**availability_data)
    
    async def get_mentor_availability(self, mentor_id: str) -> Optional[MentorAvailability]:
        """Get mentor's availability by ID"""
        doc = self.collection.document(mentor_id).get()
        if doc.exists:
            data = doc.to_dict()
            return MentorAvailability(**data)
        return None
    
    async def update_mentor_availability(self, mentor_id: str, request: UpdateAvailabilityRequest) -> Optional[MentorAvailability]:
        """Update mentor's availability"""
        doc_ref = self.collection.document(mentor_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        update_data = {'lastUpdated': datetime.utcnow()}
        
        if request.weeklyAvailability is not None:
            update_data['weeklyAvailability'] = [day.dict() for day in request.weeklyAvailability]
        
        if request.timezone is not None:
            update_data['timezone'] = request.timezone
        
        if request.isActive is not None:
            update_data['isActive'] = request.isActive
        
        doc_ref.update(update_data)
        
        # Get updated document
        updated_doc = doc_ref.get()
        return MentorAvailability(**updated_doc.to_dict())
    
    async def delete_mentor_availability(self, mentor_id: str) -> bool:
        """Delete mentor's availability"""
        doc_ref = self.collection.document(mentor_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False
    
    async def book_time_slot(self, mentor_id: str, booking_request: SlotBookingRequest) -> bool:
        """Book a specific time slot"""
        doc_ref = self.collection.document(mentor_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        data = doc.to_dict()
        weekly_availability = data.get('weeklyAvailability', [])
        
        # Find the day and slot to book
        for day_data in weekly_availability:
            if day_data['day'] == booking_request.day:
                for slot in day_data['slots']:
                    if (slot['startTime'] == booking_request.startTime and 
                        slot['endTime'] == booking_request.endTime and
                        slot['status'] == SlotStatus.AVAILABLE):
                        
                        slot['status'] = SlotStatus.BOOKED
                        slot['bookingId'] = booking_request.bookingId
                        
                        # Update the document
                        doc_ref.update({
                            'weeklyAvailability': weekly_availability,
                            'lastUpdated': datetime.utcnow()
                        })
                        return True
        
        return False
    
    async def release_time_slot(self, mentor_id: str, release_request: SlotReleaseRequest) -> bool:
        """Release a booked time slot"""
        doc_ref = self.collection.document(mentor_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        data = doc.to_dict()
        weekly_availability = data.get('weeklyAvailability', [])
        
        # Find the day and slot to release
        for day_data in weekly_availability:
            if day_data['day'] == release_request.day:
                for slot in day_data['slots']:
                    if (slot['startTime'] == release_request.startTime and 
                        slot['endTime'] == release_request.endTime and
                        slot['status'] == SlotStatus.BOOKED):
                        
                        slot['status'] = SlotStatus.AVAILABLE
                        slot['bookingId'] = None
                        
                        # Update the document
                        doc_ref.update({
                            'weeklyAvailability': weekly_availability,
                            'lastUpdated': datetime.utcnow()
                        })
                        return True
        
        return False
    
    async def get_available_slots(self, mentor_id: str, day: Optional[str] = None, 
                                 min_duration: Optional[int] = None) -> List[AvailableSlot]:
        """Get available time slots for a mentor"""
        availability = await self.get_mentor_availability(mentor_id)
        if not availability:
            return []
        
        available_slots = []
        
        for day_availability in availability.weeklyAvailability:
            # Filter by day if specified
            if day and day_availability.day != day:
                continue
            
            for slot in day_availability.slots:
                if slot.status == SlotStatus.AVAILABLE:
                    # Calculate duration
                    start_time = time.fromisoformat(slot.startTime)
                    end_time = time.fromisoformat(slot.endTime)
                    
                    # Convert to datetime for calculation
                    start_dt = datetime.combine(datetime.today(), start_time)
                    end_dt = datetime.combine(datetime.today(), end_time)
                    duration_minutes = int((end_dt - start_dt).total_seconds() / 60)
                    
                    # Filter by minimum duration if specified
                    if min_duration and duration_minutes < min_duration:
                        continue
                    
                    available_slots.append(AvailableSlot(
                        day=day_availability.day,
                        startTime=slot.startTime,
                        endTime=slot.endTime,
                        durationMinutes=duration_minutes,
                        timezone=availability.timezone
                    ))
        
        return available_slots
    
    async def get_mentors_with_availability(self, day: Optional[str] = None, 
                                          min_duration: Optional[int] = None) -> List[str]:
        """Get list of mentor IDs who have availability"""
        query = self.collection.where('isActive', '==', True)
        docs = query.stream()
        
        mentor_ids = []
        
        for doc in docs:
            data = doc.to_dict()
            mentor_id = data.get('mentorId')
            
            if mentor_id:
                # Check if mentor has available slots matching criteria
                available_slots = await self.get_available_slots(mentor_id, day, min_duration)
                if available_slots:
                    mentor_ids.append(mentor_id)
        
        return mentor_ids
    
    async def check_slot_conflict(self, mentor_id: str, day: str, start_time: str, end_time: str) -> bool:
        """Check if a time slot conflicts with existing bookings"""
        availability = await self.get_mentor_availability(mentor_id)
        if not availability:
            return True  # No availability means conflict
        
        start = time.fromisoformat(start_time)
        end = time.fromisoformat(end_time)
        
        for day_availability in availability.weeklyAvailability:
            if day_availability.day == day:
                for slot in day_availability.slots:
                    slot_start = time.fromisoformat(slot.startTime)
                    slot_end = time.fromisoformat(slot.endTime)
                    
                    # Check for time overlap
                    if (start < slot_end and end > slot_start):
                        # There's an overlap - check if slot is available
                        if slot.status == SlotStatus.BOOKED:
                            return True  # Conflict with booked slot
                        
                        # Check if the requested time fits within available slot
                        if start >= slot_start and end <= slot_end:
                            return False  # No conflict, fits within available slot
        
        return True  # No suitable slot found
    
    def _convert_timezone(self, time_str: str, from_tz: str, to_tz: str) -> str:
        """Convert time from one timezone to another"""
        try:
            from_timezone = pytz.timezone(from_tz)
            to_timezone = pytz.timezone(to_tz)
            
            # Parse time and add timezone info
            time_obj = time.fromisoformat(time_str)
            dt = datetime.combine(datetime.today(), time_obj)
            dt_with_tz = from_timezone.localize(dt)
            
            # Convert to target timezone
            converted_dt = dt_with_tz.astimezone(to_timezone)
            
            return converted_dt.time().strftime('%H:%M')
        except Exception:
            return time_str  # Return original if conversion fails