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

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    EXCUSED = "excused"

# MINIMAL BOOKING MODELS

class SimpleBookingRequest(BaseModel):
    studentId: str
    classId: str
    personalGoals: Optional[str] = None
    parentId: Optional[str] = None  # For young learners
    youngLearnerName: Optional[str] = None

class SimpleBookingUpdate(BaseModel):
    bookingStatus: Optional[BookingStatus] = None
    paymentStatus: Optional[PaymentStatus] = None
    personalGoals: Optional[str] = None
    mentorNotes: Optional[str] = None

class SimpleBooking(BaseModel):
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
    personalGoals: Optional[str] = None
    mentorNotes: Optional[str] = None
    bookedAt: str
    confirmedAt: Optional[str] = None
    completedAt: Optional[str] = None
    cancelledAt: Optional[str] = None

# OPTIONAL SIMPLE ATTENDANCE (separate collection)

class SessionAttendance(BaseModel):
    attendanceId: str
    bookingId: str
    studentId: str
    classId: str
    sessionDate: str  # YYYY-MM-DD
    status: AttendanceStatus
    notes: Optional[str] = None
    markedAt: str
    markedBy: str  # mentorId who marked attendance

class SessionAttendanceRequest(BaseModel):
    bookingId: str
    sessionDate: str
    status: AttendanceStatus
    notes: Optional[str] = None

# API RESPONSE MODELS

class SimpleBookingResponse(BaseModel):
    booking: SimpleBooking

class SimpleBookingListResponse(BaseModel):
    bookings: List[SimpleBooking]
    total: int
    page: int
    pageSize: int
    totalPages: int

class AttendanceResponse(BaseModel):
    attendance: SessionAttendance

class AttendanceListResponse(BaseModel):
    attendance: List[SessionAttendance]
    total: int

# BOOKING STATS (optional - can be calculated on demand)

class BookingStats(BaseModel):
    totalBookings: int
    pendingBookings: int
    confirmedBookings: int
    completedBookings: int
    cancelledBookings: int
    totalRevenue: float
    averageRating: Optional[float] = None

class BookingStatsResponse(BaseModel):
    stats: BookingStats