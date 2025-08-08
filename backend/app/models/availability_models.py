from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import date

class TimeRange(BaseModel):
    startTime: str = Field(..., description="Start time in HH:MM format (24-hour)")
    endTime: str = Field(..., description="End time in HH:MM format (24-hour)")
    
    @validator('startTime', 'endTime')
    def validate_time_format(cls, v):
        """Validate HH:MM format"""
        try:
            parts = v.split(':')
            if len(parts) != 2:
                raise ValueError('Time must be in HH:MM format')
            
            hour, minute = int(parts[0]), int(parts[1])
            if not (0 <= hour <= 23) or not (0 <= minute <= 59):
                raise ValueError('Invalid time values')
            
            return v
        except (ValueError, AttributeError):
            raise ValueError('Time must be in HH:MM format')
    
    @validator('endTime')
    def validate_end_after_start(cls, v, values):
        """Ensure end time is after start time"""
        if 'startTime' in values:
            start_parts = values['startTime'].split(':')
            end_parts = v.split(':')
            
            start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
            end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
            
            if end_minutes <= start_minutes:
                raise ValueError('End time must be after start time')
        return v

class DayAvailability(BaseModel):
    day: str = Field(..., description="Day of the week (Monday, Tuesday, etc.)")
    timeRanges: List[TimeRange] = Field(default_factory=list, description="Available time ranges for this day")
    
    @validator('day')
    def validate_day(cls, v):
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        if v not in valid_days:
            raise ValueError(f'Day must be one of: {", ".join(valid_days)}')
        return v

class DateRange(BaseModel):
    startDate: Optional[str] = None  # Store as string YYYY-MM-DD
    endDate: Optional[str] = None    # Store as string YYYY-MM-DD
    
    @validator('startDate', 'endDate')
    def validate_date_format(cls, v):
        if v:
            try:
                # Validate YYYY-MM-DD format
                from datetime import datetime
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v
    
    @validator('endDate')
    def validate_end_after_start(cls, v, values):
        if v and 'startDate' in values and values['startDate']:
            try:
                from datetime import datetime
                start_date = datetime.strptime(values['startDate'], '%Y-%m-%d').date()
                end_date = datetime.strptime(v, '%Y-%m-%d').date()
                if end_date <= start_date:
                    raise ValueError('End date must be after start date')
            except ValueError as e:
                if "End date must be after start date" in str(e):
                    raise e
                # If parsing fails, let the date format validator catch it
        return v

class MentorAvailability(BaseModel):
    mentorId: str = Field(..., description="Mentor's UID")
    availability: List[DayAvailability] = Field(default_factory=list, description="Weekly availability schedule")
    dateRange: Optional[DateRange] = None
    timezone: str = Field("Europe/London", description="Mentor's timezone")
    isActive: bool = Field(True, description="Whether availability is active")
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

# Request/Response Models
class AvailabilityRequest(BaseModel):
    availability: List[DayAvailability] = Field(..., description="Weekly availability schedule")
    dateRange: Optional[DateRange] = None
    timezone: str = Field("Europe/London", description="Mentor's timezone")

class AvailabilityResponse(BaseModel):
    availability: MentorAvailability

