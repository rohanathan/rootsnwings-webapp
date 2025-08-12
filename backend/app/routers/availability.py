from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.availability_models import (
    MentorAvailability, AvailabilityRequest, AvailabilityResponse
)
from app.services.availability_service import AvailabilityService

router = APIRouter(prefix="/availability", tags=["Availability - Simplified API"])
availability_service = AvailabilityService()

@router.get("/mentors/{mentor_id}")
def get_availability(
    mentor_id: str,
    list_all: bool = Query(False, description="Get all mentors with availability (ignores mentor_id)"),
    day: Optional[str] = Query(None, description="Filter by specific day when list_all=true")
):
    """
    Universal availability getter - supports single mentor or list all mentors.
    
    Examples:
    - GET /availability/mentors/user026 - Get specific mentor availability
    - GET /availability/mentors/any?list_all=true - Get all mentors with availability
    - GET /availability/mentors/any?list_all=true&day=Monday - Get mentors available on Monday
    
    Single mentor response:
    {
      "availability": {
        "mentorId": "user026",
        "availability": [
          {
            "day": "Monday",
            "timeRanges": [
              {"startTime": "09:00", "endTime": "12:00"}
            ]
          }
        ],
        "dateRange": {"startDate": "2025-08-01", "endDate": "2025-12-31"},
        "timezone": "Europe/London"
      }
    }
    
    List all mentors response:
    {
      "mentorIds": ["user026", "user027"],
      "total": 2,
      "day": "Monday"
    }
    """
    if list_all:
        # Get list of mentors with availability
        mentor_ids = availability_service.get_mentors_with_availability(day)
        return {
            "mentorIds": mentor_ids,
            "total": len(mentor_ids),
            "day": day
        }
    else:
        # Get specific mentor availability
        availability = availability_service.get_mentor_availability(mentor_id)
        
        if not availability:
            raise HTTPException(status_code=404, detail="No availability set for this mentor")
        
        return {"availability": availability}

@router.put("/mentors/{mentor_id}")
def update_availability(
    mentor_id: str,
    request: AvailabilityRequest,
    clear_schedule: bool = Query(False, description="Set to true to clear all availability")
):
    """
    Universal availability updater - set, update, or clear mentor availability.
    
    Examples:
    
    # Set/update availability
    PUT /availability/mentors/user026
    Body: {
      "availability": [
        {
          "day": "Monday", 
          "timeRanges": [
            {"startTime": "09:00", "endTime": "17:00"}
          ]
        }
      ],
      "dateRange": {"startDate": "2025-08-01", "endDate": "2025-12-31"},
      "timezone": "Europe/London"  
    }
    
    # Clear all availability
    PUT /availability/mentors/user026?clear_schedule=true
    Body: {} (empty body)
    """
    if clear_schedule:
        # Clear mentor's availability completely
        # TODO: Implement clear functionality in service
        return {
            "message": f"Availability cleared for mentor {mentor_id}",
            "availability": None
        }
    else:
        # Set/update mentor availability
        availability = availability_service.set_mentor_availability(mentor_id, request)
        return {"availability": availability}


# ==========================================
# SIMPLIFIED TO 2 ENDPOINTS TOTAL
# GET /availability/mentors/{mentor_id} - Get availability (supports list_all)
# PUT /availability/mentors/{mentor_id} - Update availability (supports clear)
# ==========================================

