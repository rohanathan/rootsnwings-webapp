from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class PaymentStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    REFUNDED = "refunded"
    PARTIAL = "partial"

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    PARTIAL = "partial"
    EXCUSED = "excused"

class SlotStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

class Discount(BaseModel):
    type: str
    amount: float
    description: str

class Pricing(BaseModel):
    basePrice: float
    discountsApplied: Optional[List[Discount]] = Field(default_factory=list)
    finalPrice: float
    currency: str = "GBP"

class ScheduledSlot(BaseModel):
    sessionNumber: int  # Session 1, 2, 3... up to totalSessions
    date: str  # YYYY-MM-DD format
    dayOfWeek: str  # Monday, Tuesday, etc.
    startTime: str  # HH:MM format
    endTime: str  # HH:MM format
    status: SlotStatus = SlotStatus.CONFIRMED
    attendanceStatus: Optional[str] = "pending"  # pending, present, absent, excused

class AttendanceRecord(BaseModel):
    sessionNumber: int  # Which session this attendance is for
    sessionDate: str  # YYYY-MM-DD format
    status: AttendanceStatus
    notes: Optional[str] = None
    markedAt: Optional[datetime] = None  # When attendance was marked

class BookingRequest(BaseModel):
    studentId: str
    classId: str
    parentId: Optional[str] = None
    youngLearnerName: Optional[str] = None
    scheduledSlots: Optional[List[ScheduledSlot]] = None  # Auto-generate if not provided
    personalGoals: Optional[str] = None
    pricing: Pricing

class BookingUpdate(BaseModel):
    bookingStatus: Optional[BookingStatus] = None
    paymentStatus: Optional[PaymentStatus] = None
    scheduledSlots: Optional[List[ScheduledSlot]] = None
    personalGoals: Optional[str] = None
    mentorNotes: Optional[str] = None
    studentRating: Optional[float] = Field(None, ge=1, le=5)
    studentReview: Optional[str] = None

class SessionProgress(BaseModel):
    totalSessions: int
    completedSessions: int = 0
    attendedSessions: int = 0
    missedSessions: int = 0
    nextSessionNumber: Optional[int] = 1
    progressPercentage: float = 0.0

class Booking(BaseModel):
    bookingId: str
    studentId: str
    studentName: str
    classId: str
    className: str
    mentorId: str
    mentorName: str
    parentId: Optional[str] = None
    youngLearnerName: Optional[str] = None
    bookingStatus: BookingStatus
    paymentStatus: PaymentStatus
    pricing: Pricing
    scheduledSlots: List[ScheduledSlot]
    attendanceRecord: Optional[List[AttendanceRecord]] = Field(default_factory=list)
    sessionProgress: Optional[SessionProgress] = None
    personalGoals: Optional[str] = None
    mentorNotes: Optional[str] = None
    studentRating: Optional[float] = Field(None, ge=1, le=5)
    studentReview: Optional[str] = None
    bookedAt: datetime
    confirmedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    cancelledAt: Optional[datetime] = None

class BookingListResponse(BaseModel):
    bookings: List[Booking]

class BookingResponse(BaseModel):
    booking: Booking

class BookingStatsResponse(BaseModel):
    totalBookings: int
    pendingBookings: int
    confirmedBookings: int
    completedBookings: int
    cancelledBookings: int
    totalRevenue: float
    currency: str

# 1-on-1 Booking Models
class OneOnOneBookingRequest(BaseModel):
    mentorId: str = Field(..., description="Mentor's UID")
    studentId: str = Field(..., description="Student's UID")
    sessionDate: str = Field(..., description="Session date in YYYY-MM-DD format")
    startTime: str = Field(..., description="Start time in HH:MM format")
    endTime: str = Field(..., description="End time in HH:MM format")
    subject: Optional[str] = Field(None, description="Subject or topic for the session")
    learningGoals: Optional[str] = Field(None, description="Student's learning objectives")
    specialRequests: Optional[str] = Field(None, description="Any special requests or accommodations")
    parentId: Optional[str] = Field(None, description="Parent ID if booking for young learner")
    youngLearnerName: Optional[str] = Field(None, description="Young learner's name")
    isRecurring: bool = Field(False, description="Whether this is a recurring booking")
    recurringWeeks: Optional[int] = Field(None, description="Number of weeks for recurring booking")
    timezone: Optional[str] = Field("Europe/London", description="Timezone for the session")

class RecurringOneOnOneBookingRequest(BaseModel):
    mentorId: str = Field(..., description="Mentor's UID")
    studentId: str = Field(..., description="Student's UID")
    dayOfWeek: str = Field(..., description="Day of week (Monday, Tuesday, etc.)")
    startTime: str = Field(..., description="Start time in HH:MM format")
    endTime: str = Field(..., description="End time in HH:MM format")
    startDate: str = Field(..., description="First session date in YYYY-MM-DD format")
    numberOfSessions: int = Field(..., ge=1, le=52, description="Number of sessions (1-52)")
    subject: Optional[str] = Field(None, description="Subject or topic for the sessions")
    learningGoals: Optional[str] = Field(None, description="Student's learning objectives")
    parentId: Optional[str] = Field(None, description="Parent ID if booking for young learner")
    youngLearnerName: Optional[str] = Field(None, description="Young learner's name")
    timezone: Optional[str] = Field("Europe/London", description="Timezone for the sessions")

class OneOnOneBooking(BaseModel):
    bookingId: str
    bookingType: str = Field("one-on-one", description="Type of booking")
    mentorId: str
    mentorName: str
    studentId: str
    studentName: str
    parentId: Optional[str] = None
    youngLearnerName: Optional[str] = None
    sessionDate: str  # YYYY-MM-DD
    dayOfWeek: str  # Monday, Tuesday, etc.
    startTime: str  # HH:MM
    endTime: str  # HH:MM
    timezone: str
    durationMinutes: int
    subject: Optional[str] = None
    learningGoals: Optional[str] = None
    specialRequests: Optional[str] = None
    bookingStatus: BookingStatus
    paymentStatus: PaymentStatus
    pricing: Pricing
    isRecurring: bool = False
    parentBookingId: Optional[str] = None  # For recurring sessions, links to parent booking
    sessionNumber: Optional[int] = None  # For recurring sessions (1, 2, 3...)
    totalSessions: Optional[int] = None  # For recurring sessions
    attendanceStatus: Optional[AttendanceStatus] = None
    mentorNotes: Optional[str] = None
    studentRating: Optional[float] = Field(None, ge=1, le=5)
    studentReview: Optional[str] = None
    bookedAt: datetime
    confirmedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    cancelledAt: Optional[datetime] = None
    lastUpdated: Optional[datetime] = None

class AvailableSlotForBooking(BaseModel):
    mentorId: str
    mentorName: str
    day: str
    date: str  # YYYY-MM-DD for specific date
    startTime: str
    endTime: str
    durationMinutes: int
    timezone: str
    oneOnOneRate: float
    currency: str = "GBP"
    isFirstSessionFree: bool = False

class OneOnOneAvailabilityResponse(BaseModel):
    mentorId: str
    mentorName: str
    availableSlots: List[AvailableSlotForBooking]
    timezone: str
    oneOnOneRate: float
    currency: str = "GBP"
    isFirstSessionFree: bool = False

class OneOnOneBookingResponse(BaseModel):
    booking: OneOnOneBooking

class OneOnOneBookingListResponse(BaseModel):
    bookings: List[OneOnOneBooking]
    total: int
    page: int = 1
    pageSize: int = 20
    totalPages: int

class RecurringBookingResponse(BaseModel):
    parentBookingId: str
    bookings: List[OneOnOneBooking]
    totalSessions: int
    bookedSessions: int
    message: str