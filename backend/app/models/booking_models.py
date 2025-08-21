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
    COMPLETED = "completed"  # Legacy value from existing bookings

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
    """
    Booking model used across user dashboards, mentor interfaces, and admin management.
    
    FRONTEND USAGE PATTERNS:
    - User Bookings Page (/user/bookings): Uses studentName, className, bookingStatus, bookedAt, 
      progress tracking fields for "My Sessions" display
    - Mentor Dashboard (/mentor/dashboard): Uses studentId, studentName, classId for enrollment 
      counts and "active students" summary
    - User Dashboard (/user/dashboard): Uses className, bookingStatus for personal booking stats
    - Booking Confirmation (/booking/confirmbooking): Creates bookings with studentId, classId, 
      personalGoals, parentId fields
    - Mentor Classes (/mentor/myclass): Uses enrollment data for class capacity tracking
    - Admin Interface: Uses all fields for comprehensive booking management and revenue tracking
    """
    
    # === CORE IDENTITY FIELDS (Used by ALL interfaces) ===
    bookingId: str = Field(..., description="Unique booking identifier - used across all interfaces for booking tracking and actions")
    studentId: str = Field(..., description="Student's unique ID - used for mentor dashboard student lists and admin tracking")
    studentName: str = Field(..., description="Student display name - prominently shown on mentor dashboard and user booking lists")
    
    # === CLASS RELATIONSHIP FIELDS (Used by dashboards and management) ===
    classId: str = Field(..., description="Class unique ID - used for linking bookings to specific classes in mentor/admin interfaces")
    className: str = Field(..., description="Class title - displayed on user bookings page and mentor enrollment lists")
    
    # === MENTOR RELATIONSHIP FIELDS (Used by user interfaces and admin) ===
    mentorId: str = Field(..., description="Mentor's unique ID - used for mentor-specific booking queries and messaging context")
    mentorName: str = Field(..., description="Mentor display name - shown on user booking lists for mentor identification")
    
    # === FAMILY STRUCTURE FIELDS (Used by booking creation and young learner support) ===
    parentId: Optional[str] = Field(None, description="YOUNG LEARNER SUPPORT - parent's ID when booking for children, used in family account management")
    youngLearnerName: Optional[str] = Field(None, description="YOUNG LEARNER SUPPORT - child's name when parent books for children")
    
    # === STATUS FIELDS (Used by all interfaces for state management) ===
    bookingStatus: BookingStatus = Field(..., description="Booking state - displayed as colored badges on user/mentor/admin dashboards")
    paymentStatus: PaymentStatus = Field(..., description="Payment state - used for billing status display and payment flow management")
    
    # === EDUCATIONAL CONTENT FIELDS (Used by progress tracking and mentor notes) ===
    personalGoals: Optional[str] = Field(None, description="USER BOOKING PAGE - student's learning goals displayed in booking details section")
    mentorNotes: Optional[str] = Field(None, description="MENTOR DASHBOARD - private mentor notes for student progress tracking")
    
    # === TIMELINE FIELDS (Used by progress tracking and admin reporting) ===
    bookedAt: str = Field(..., description="Booking creation timestamp - displayed on user bookings and admin reporting for chronological tracking")
    confirmedAt: Optional[str] = Field(None, description="ADMIN/MENTOR - payment confirmation timestamp for booking lifecycle tracking")
    completedAt: Optional[str] = Field(None, description="ADMIN/PROGRESS - class completion timestamp for progress reporting")
    cancelledAt: Optional[str] = Field(None, description="ADMIN/BILLING - cancellation timestamp for refund processing and reporting")

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