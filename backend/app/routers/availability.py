from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.models.availability_models import (
    MentorAvailability, AvailabilityResponse, AvailabilityListResponse,
    CreateAvailabilityRequest, UpdateAvailabilityRequest,
    SlotBookingRequest, SlotReleaseRequest, AvailableSlot, AvailableSlotsResponse,
    AvailableSlotQuery
)
from app.services.availability_service import AvailabilityService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/availability", tags=["availability"])
availability_service = AvailabilityService()

@router.post("/mentors/{mentor_id}/test", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_mentor_availability_test(
    mentor_id: str,
    request: CreateAvailabilityRequest
):
    """Create or update mentor's weekly availability schedule (test endpoint)"""
    try:
        availability = await availability_service.create_mentor_availability(mentor_id, request)
        return AvailabilityResponse(availability=availability)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create availability: {str(e)}"
        )

@router.post("/mentors/{mentor_id}", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_mentor_availability(
    mentor_id: str,
    request: CreateAvailabilityRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create or update mentor's weekly availability schedule"""
    try:
        # Verify user is the mentor or admin
        if current_user.get('uid') != mentor_id and not current_user.get('isAdmin', False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage this mentor's availability"
            )
        
        availability = await availability_service.create_mentor_availability(mentor_id, request)
        return AvailabilityResponse(availability=availability)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create availability: {str(e)}"
        )

@router.get("/mentors/{mentor_id}", response_model=AvailabilityResponse)
async def get_mentor_availability(mentor_id: str):
    """Get mentor's availability schedule"""
    availability = await availability_service.get_mentor_availability(mentor_id)
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found for this mentor"
        )
    
    return AvailabilityResponse(availability=availability)

@router.put("/mentors/{mentor_id}", response_model=AvailabilityResponse)
async def update_mentor_availability(
    mentor_id: str,
    request: UpdateAvailabilityRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update mentor's availability schedule"""
    # Verify user is the mentor or admin
    if current_user.get('uid') != mentor_id and not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this mentor's availability"
        )
    
    availability = await availability_service.update_mentor_availability(mentor_id, request)
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found for this mentor"
        )
    
    return AvailabilityResponse(availability=availability)

@router.delete("/mentors/{mentor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mentor_availability(
    mentor_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete mentor's availability schedule"""
    # Verify user is the mentor or admin
    if current_user.get('uid') != mentor_id and not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this mentor's availability"
        )
    
    success = await availability_service.delete_mentor_availability(mentor_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found for this mentor"
        )

@router.post("/mentors/{mentor_id}/book-slot/test", status_code=status.HTTP_200_OK)
async def book_time_slot_test(
    mentor_id: str,
    request: SlotBookingRequest
):
    """Book a specific time slot (test endpoint)"""
    success = await availability_service.book_time_slot(mentor_id, request)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to book time slot. Slot may be unavailable or not found."
        )
    
    return {"message": "Time slot booked successfully"}

@router.post("/mentors/{mentor_id}/book-slot", status_code=status.HTTP_200_OK)
async def book_time_slot(
    mentor_id: str,
    request: SlotBookingRequest,
    current_user: dict = Depends(get_current_user)
):
    """Book a specific time slot (internal use by booking service)"""
    success = await availability_service.book_time_slot(mentor_id, request)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to book time slot. Slot may be unavailable or not found."
        )
    
    return {"message": "Time slot booked successfully"}

@router.post("/mentors/{mentor_id}/release-slot", status_code=status.HTTP_200_OK)
async def release_time_slot(
    mentor_id: str,
    request: SlotReleaseRequest,
    current_user: dict = Depends(get_current_user)
):
    """Release a booked time slot (internal use by booking service)"""
    success = await availability_service.release_time_slot(mentor_id, request)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to release time slot. Slot may not be booked or not found."
        )
    
    return {"message": "Time slot released successfully"}

@router.get("/mentors/{mentor_id}/available-slots", response_model=AvailableSlotsResponse)
async def get_available_slots(
    mentor_id: str,
    day: Optional[str] = None,
    min_duration: Optional[int] = None
):
    """Get available time slots for a mentor"""
    available_slots = await availability_service.get_available_slots(
        mentor_id, day, min_duration
    )
    
    # Get mentor's timezone for response
    availability = await availability_service.get_mentor_availability(mentor_id)
    timezone = availability.timezone if availability else "Europe/London"
    
    return AvailableSlotsResponse(
        mentorId=mentor_id,
        slots=available_slots,
        timezone=timezone
    )

@router.get("/mentors-with-availability", response_model=List[str])
async def get_mentors_with_availability(
    day: Optional[str] = None,
    min_duration: Optional[int] = None
):
    """Get list of mentor IDs who have availability matching criteria"""
    mentor_ids = await availability_service.get_mentors_with_availability(day, min_duration)
    return mentor_ids

@router.get("/mentors/{mentor_id}/check-conflict")
async def check_slot_conflict(
    mentor_id: str,
    day: str,
    start_time: str,
    end_time: str
):
    """Check if a time slot conflicts with existing bookings"""
    has_conflict = await availability_service.check_slot_conflict(
        mentor_id, day, start_time, end_time
    )
    
    return {
        "mentorId": mentor_id,
        "day": day,
        "startTime": start_time,
        "endTime": end_time,
        "hasConflict": has_conflict,
        "available": not has_conflict
    }