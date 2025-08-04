from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime, time
from enum import Enum

class SlotStatus(str, Enum):
    AVAILABLE = "available"
    BOOKED = "booked"

class TimeSlot(BaseModel):
    startTime: str = Field(..., description="Start time in HH:MM format")
    endTime: str = Field(..., description="End time in HH:MM format")
    status: SlotStatus = SlotStatus.AVAILABLE
    bookingId: Optional[str] = Field(None, description="Optional booking reference")
    
    @validator('startTime', 'endTime')
    def validate_time_format(cls, v):
        try:
            time.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Time must be in HH:MM format')
    
    @validator('endTime')
    def validate_end_after_start(cls, v, values):
        if 'startTime' in values:
            start = time.fromisoformat(values['startTime'])
            end = time.fromisoformat(v)
            if end <= start:
                raise ValueError('End time must be after start time')
        return v

class DayAvailability(BaseModel):
    day: str = Field(..., description="Day of the week (Monday, Tuesday, etc.)")
    slots: List[TimeSlot] = Field(..., description="List of time slots for availability")
    isRecurring: Optional[bool] = Field(True, description="Indicates if the availability recurs weekly")
    timezone: Optional[str] = Field("Europe/London", description="Timezone identifier")
    
    @validator('day')
    def validate_day(cls, v):
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        if v not in valid_days:
            raise ValueError(f'Day must be one of: {", ".join(valid_days)}')
        return v

class MentorAvailability(BaseModel):
    mentorId: str = Field(..., description="Mentor's UID")
    weeklyAvailability: List[DayAvailability] = Field(..., description="Weekly availability schedule")
    timezone: str = Field("Europe/London", description="Mentor's timezone")
    isActive: bool = Field(True, description="Whether availability is active")
    lastUpdated: Optional[datetime] = Field(None, description="Last update timestamp")
    createdAt: Optional[datetime] = Field(None, description="Creation timestamp")

class AvailabilityResponse(BaseModel):
    availability: MentorAvailability

class AvailabilityListResponse(BaseModel):
    availabilities: List[MentorAvailability]
    total: int

class CreateAvailabilityRequest(BaseModel):
    weeklyAvailability: List[DayAvailability]
    timezone: str = Field("Europe/London", description="Mentor's timezone")

class UpdateAvailabilityRequest(BaseModel):
    weeklyAvailability: Optional[List[DayAvailability]] = None
    timezone: Optional[str] = None
    isActive: Optional[bool] = None

class SlotBookingRequest(BaseModel):
    day: str
    startTime: str
    endTime: str
    bookingId: str

class SlotReleaseRequest(BaseModel):
    day: str
    startTime: str
    endTime: str

class AvailableSlotQuery(BaseModel):
    mentorId: str
    day: Optional[str] = None
    date: Optional[str] = None  # Specific date in YYYY-MM-DD format
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    minDuration: Optional[int] = Field(None, description="Minimum slot duration in minutes")

class AvailableSlot(BaseModel):
    day: str
    startTime: str
    endTime: str
    durationMinutes: int
    timezone: str

class AvailableSlotsResponse(BaseModel):
    mentorId: str
    slots: List[AvailableSlot]
    timezone: str