from app.services.firestore import db
from app.models.availability_models import MentorAvailability, AvailabilityRequest
from datetime import datetime
from typing import Optional
from fastapi import HTTPException

class AvailabilityService:
    
    def __init__(self):
        self.collection = db.collection('mentor_availability')
    
    def get_mentor_availability(self, mentor_id: str) -> Optional[MentorAvailability]:
        """Get mentor's current availability"""
        try:
            doc = self.collection.document(mentor_id).get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            data["mentorId"] = mentor_id
            
            return MentorAvailability(**data)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get availability: {str(e)}")
    
    def set_mentor_availability(self, mentor_id: str, request: AvailabilityRequest) -> MentorAvailability:
        """Set/update mentor's availability (replaces existing)"""
        try:
            # Get current availability to preserve createdAt
            current_doc = self.collection.document(mentor_id).get()
            created_at = None
            if current_doc.exists:
                current_data = current_doc.to_dict()
                created_at = current_data.get('createdAt')
            
            # Prepare new availability data
            availability_data = {
                "availability": [day.dict() for day in request.availability],
                "dateRange": request.dateRange.dict() if request.dateRange else None,
                "timezone": request.timezone,
                "isActive": True,
                "updatedAt": datetime.now().isoformat()
            }
            
            # Set createdAt if this is a new document
            if created_at:
                availability_data["createdAt"] = created_at
            else:
                availability_data["createdAt"] = datetime.now().isoformat()
            
            # Save to Firestore
            self.collection.document(mentor_id).set(availability_data)
            
            # Return the saved availability
            availability_data["mentorId"] = mentor_id
            return MentorAvailability(**availability_data)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to set availability: {str(e)}")
    
    
    def get_mentors_with_availability(self, day: Optional[str] = None) -> list:
        """Get list of mentor IDs who have active availability"""
        try:
            query = self.collection.where("isActive", "==", True)
            docs = list(query.stream())
            
            mentor_ids = []
            for doc in docs:
                data = doc.to_dict()
                mentor_id = doc.id
                
                # If specific day requested, check if mentor has availability on that day
                if day:
                    has_day_availability = False
                    for day_availability in data.get('availability', []):
                        if (day_availability.get('day') == day and 
                            len(day_availability.get('timeRanges', [])) > 0):
                            has_day_availability = True
                            break
                    
                    if has_day_availability:
                        mentor_ids.append(mentor_id)
                else:
                    # No specific day filter, include all active mentors
                    mentor_ids.append(mentor_id)
            
            return mentor_ids
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get mentors with availability: {str(e)}")
    
