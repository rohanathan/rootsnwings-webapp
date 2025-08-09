from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    MENTOR = "mentor"
    STUDENT = "student"
    PARENT = "parent"
    ADMIN = "admin"

class AccountStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class VerificationLevel(str, Enum):
    UNVERIFIED = "unverified"
    BASIC = "basic"
    EMAIL_VERIFIED = "email_verified"
    PHONE_VERIFIED = "phone_verified"
    VERIFIED = "verified"

class GeoLocation(BaseModel):
    lat: float
    lng: float

class Location(BaseModel):
    city: str
    region: str
    country: str
    postcode: Optional[str] = None
    geo: Optional[GeoLocation] = None

class PrivacySettings(BaseModel):
    showEmail: bool = False
    showPhone: bool = False
    showLocation: bool = True
    showProfileInSearch: bool = True
    allowDirectMessages: bool = True
    showOnlineStatus: bool = False
    shareDataForAnalytics: bool = True

class Preferences(BaseModel):
    language: str = "en"
    currency: str = "GBP"
    timezone: Optional[str] = None
    notifications: Optional[bool] = True
    privacy: Optional[PrivacySettings] = Field(default_factory=PrivacySettings)

class UserBase(BaseModel):
    email: EmailStr
    displayName: str
    photoURL: Optional[str] = None
    phoneNumber: Optional[str] = None
    roles: List[UserRole] = Field(default_factory=list)
    hasMentorProfile: bool = False
    hasStudentProfile: bool = False
    hasParentProfile: bool = False
    location: Optional[Location] = None
    preferences: Optional[Preferences] = Field(default_factory=Preferences)
    accountStatus: AccountStatus = AccountStatus.ACTIVE
    verificationLevel: VerificationLevel = VerificationLevel.UNVERIFIED
    title: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    pronouns: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None  # YYYY-MM-DD format

class UserCreate(UserBase):
    uid: Optional[str] = None  # Can be provided or generated

class UserUpdate(BaseModel):
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    phoneNumber: Optional[str] = None
    roles: Optional[List[UserRole]] = None
    hasMentorProfile: Optional[bool] = None
    hasStudentProfile: Optional[bool] = None
    hasParentProfile: Optional[bool] = None
    location: Optional[Location] = None
    preferences: Optional[Preferences] = None
    accountStatus: Optional[AccountStatus] = None
    verificationLevel: Optional[VerificationLevel] = None
    title: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    pronouns: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None

class User(UserBase):
    uid: str
    createdAt: datetime
    updatedAt: datetime
    lastLoginAt: Optional[datetime] = None
    lastActiveAt: Optional[datetime] = None

# Student Profile Models
class LearningStyle(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    MIXED = "mixed"
    UNKNOWN = ""  # Handle empty strings in existing data

class CommunicationPreference(str, Enum):
    EMAIL = "email"
    APP_NOTIFICATION = "app_notification"
    SMS = "sms"
    UNKNOWN = ""  # Handle empty strings in existing data

# Booking-related models for student profile
class NextSession(BaseModel):
    bookingId: str = ""
    classId: str = ""
    classTitle: str = ""
    mentorName: str = ""
    sessionDate: str = ""
    format: str = ""

class ActiveBookingsSummary(BaseModel):
    count: int = 0
    nextSession: NextSession = Field(default_factory=NextSession)

class UpcomingSession(BaseModel):
    bookingId: str
    classId: str
    classTitle: str
    mentorName: str
    sessionDate: str
    sessionTime: str
    format: str
    status: str

class UpcomingSessions(BaseModel):
    items: List[UpcomingSession] = Field(default_factory=list)

class StudentProfile(BaseModel):
    uid: str
    bio: Optional[str] = None
    learningGoals: Optional[str] = None
    interests: Optional[List[str]] = Field(default_factory=list)
    isYoungLearner: bool = False
    learningStyle: Optional[LearningStyle] = None
    preferredCommunication: Optional[CommunicationPreference] = None
    activeBookingsSummary: Optional[ActiveBookingsSummary] = Field(default_factory=ActiveBookingsSummary)
    upcomingSessions: Optional[UpcomingSessions] = Field(default_factory=UpcomingSessions)
    createdAt: datetime
    updatedAt: datetime

class StudentProfileCreate(BaseModel):
    bio: Optional[str] = None
    learningGoals: Optional[str] = None
    interests: Optional[List[str]] = Field(default_factory=list)
    isYoungLearner: bool = False
    learningStyle: Optional[LearningStyle] = None
    preferredCommunication: Optional[CommunicationPreference] = None

class StudentProfileUpdate(BaseModel):
    bio: Optional[str] = None
    learningGoals: Optional[str] = None
    interests: Optional[List[str]] = None
    isYoungLearner: Optional[bool] = None
    learningStyle: Optional[LearningStyle] = None
    preferredCommunication: Optional[CommunicationPreference] = None

# Parent Profile Models
class ContactMethod(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PHONE = "phone"
    APP_NOTIFICATION = "app_notification"

class EmergencyContact(BaseModel):
    name: str
    phone: str

class ParentProfile(BaseModel):
    uid: str
    phoneVerified: bool = False
    emergencyContact: Optional[EmergencyContact] = None
    preferredContactMethod: Optional[ContactMethod] = None
    communicationConsent: bool = False
    languagePreference: Optional[str] = None
    timezone: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

class ParentProfileCreate(BaseModel):
    phoneVerified: bool = False
    emergencyContact: Optional[EmergencyContact] = None
    preferredContactMethod: Optional[ContactMethod] = None
    communicationConsent: bool = False
    languagePreference: Optional[str] = None
    timezone: Optional[str] = None

class ParentProfileUpdate(BaseModel):
    phoneVerified: Optional[bool] = None
    emergencyContact: Optional[EmergencyContact] = None
    preferredContactMethod: Optional[ContactMethod] = None
    communicationConsent: Optional[bool] = None
    languagePreference: Optional[str] = None
    timezone: Optional[str] = None

# Response Models
class UserResponse(BaseModel):
    user: User

class StudentProfileResponse(BaseModel):
    profile: StudentProfile

class ParentProfileResponse(BaseModel):
    profile: ParentProfile

# Admin-only Response Models (for user management)
class AdminUserListResponse(BaseModel):
    users: List[User]
    total: int
    page: int
    pageSize: int
    totalPages: int