from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.models.availability_models import (
    MentorAvailability, AvailabilityRequest, AvailabilityResponse
)
from app.services.availability_service import AvailabilityService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/availability", tags=["Availability"])
availability_service = AvailabilityService()

@router.get("/mentors/{mentor_id}", response_model=AvailabilityResponse)
def get_mentor_availability(mentor_id: str):
    """
    Get mentor's availability schedule.
    
    Returns simplified availability with time ranges per day.
    If no availability is set, returns null.
    
    Example response:
    {
      "availability": {
        "mentorId": "user026",
        "availability": [
          {
            "day": "Monday",
            "timeRanges": [
              {"startTime": "09:00", "endTime": "12:00"},
              {"startTime": "14:00", "endTime": "17:00"}
            ]
          }
        ],
        "dateRange": {"startDate": "2025-08-01", "endDate": "2025-12-31"},
        "timezone": "Europe/London"
      }
    }
    """
    availability = availability_service.get_mentor_availability(mentor_id)
    
    if not availability:
        raise HTTPException(status_code=404, detail="No availability set for this mentor")
    
    return AvailabilityResponse(availability=availability)

@router.put("/mentors/{mentor_id}", response_model=AvailabilityResponse)
def set_mentor_availability(
    mentor_id: str,
    request: AvailabilityRequest
):
    """
    Set/update mentor's availability (replaces existing).
    
    This completely replaces the mentor's availability schedule.
    Frontend should send the complete desired schedule.
    
    Example request:
    {
      "availability": [
        {
          "day": "Monday", 
          "timeRanges": [
            {"startTime": "09:00", "endTime": "12:00"},
            {"startTime": "14:00", "endTime": "17:00"}
          ]
        },
        {
          "day": "Tuesday",
          "timeRanges": [
            {"startTime": "10:00", "endTime": "15:00"}
          ]
        }
      ],
      "dateRange": {"startDate": "2025-08-01", "endDate": "2025-12-31"},
      "timezone": "Europe/London"  
    }
    """
    # TODO: Add authentication back for production
    # For now, allow any mentor availability updates for testing
    
    availability = availability_service.set_mentor_availability(mentor_id, request)
    return AvailabilityResponse(availability=availability)


@router.get("/mentors-with-availability")
def get_mentors_with_availability(day: Optional[str] = Query(None, description="Filter by specific day")):
    """
    Get list of mentor IDs who have active availability.
    
    Optionally filter by specific day of the week.
    """
    mentor_ids = availability_service.get_mentors_with_availability(day)
    
    return {
        "mentorIds": mentor_ids,
        "total": len(mentor_ids),
        "day": day
    }

