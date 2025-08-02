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