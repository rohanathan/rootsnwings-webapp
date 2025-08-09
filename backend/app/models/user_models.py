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

# CLEAN USER MODEL - No redundancies
class UserBase(BaseModel):
    email: EmailStr
    displayName: str
    photoURL: Optional[str] = None
    phoneNumber: Optional[str] = None
    roles: List[UserRole] = Field(default_factory=list)  # ✅ Single source of truth for roles
    location: Optional[Location] = None
    preferences: Optional[Preferences] = Field(default_factory=Preferences)
    status: AccountStatus = AccountStatus.ACTIVE  # ✅ Renamed from accountStatus for simplicity
    profileComplete: bool = False  # ✅ Frontend-controlled completion flag
    passwordHash: Optional[str] = None  # ✅ Required for authentication
    # Optional personal info
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    pronouns: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None  # YYYY-MM-DD format

class UserCreate(UserBase):
    uid: Optional[str] = None  # Can be provided or generated

class UserUpdate(BaseModel):
    """Flexible update model - all fields optional for MongoDB-style updates"""
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    phoneNumber: Optional[str] = None
    roles: Optional[List[UserRole]] = None
    location: Optional[Location] = None
    preferences: Optional[Preferences] = None
    status: Optional[AccountStatus] = None
    profileComplete: Optional[bool] = None
    passwordHash: Optional[str] = None  # ✅ For password changes
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    pronouns: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None

class User(UserBase):
    uid: str
    createdAt: datetime
    updatedAt: datetime
    lastLogin: Optional[datetime] = None  # ✅ Simplified from lastLoginAt

class UserResponse(BaseModel):
    success: bool = True
    user: User

class AdminUserListResponse(BaseModel):
    success: bool = True
    users: List[User]
    pagination: dict

# REMOVED REDUNDANT FIELDS:
# ❌ userType (use roles instead)
# ❌ hasStudentProfile, hasParentProfile, hasMentorProfile (derive from roles)
# ❌ verificationLevel (use profileComplete or separate system)
# ❌ accountStatus (renamed to status)
# ❌ lastLoginAt, lastActiveAt (simplified to lastLogin)
# ❌ title (not needed for MVP)

# HELPER FUNCTIONS FOR ROLE CHECKING
def has_role(user_data: dict, role: UserRole) -> bool:
    """Check if user has specific role"""
    return role.value in user_data.get('roles', [])

def has_student_profile(user_data: dict) -> bool:
    """Derive from roles instead of storing separately"""
    return has_role(user_data, UserRole.STUDENT)

def has_parent_profile(user_data: dict) -> bool:
    """Derive from roles instead of storing separately"""
    return has_role(user_data, UserRole.PARENT)

def has_mentor_profile(user_data: dict) -> bool:
    """Derive from roles instead of storing separately"""
    return has_role(user_data, UserRole.MENTOR)

def is_profile_complete(user_data: dict) -> bool:
    """Check if user has completed profile setup"""
    return user_data.get('profileComplete', False)

# STUDENT PROFILE MODEL - Separate collection
class StudentProfile(BaseModel):
    userId: str
    interests: List[str] = Field(default_factory=list)
    learningGoals: str = ""
    learningStyle: Optional[str] = None
    preferredLanguages: List[str] = Field(default_factory=list)
    ageGroup: str = "adult"  # adult, teen, child
    step: int = 1
    location: Optional[Location] = None
    
class StudentProfileCreate(BaseModel):
    interests: List[str] = Field(default_factory=list)
    learningGoals: str = ""
    learningStyle: Optional[str] = None
    preferredLanguages: List[str] = Field(default_factory=list)
    ageGroup: str = "adult"

class StudentProfileUpdate(BaseModel):
    interests: Optional[List[str]] = None
    learningGoals: Optional[str] = None
    learningStyle: Optional[str] = None
    preferredLanguages: Optional[List[str]] = None
    ageGroup: Optional[str] = None
    step: Optional[int] = None

class StudentProfileResponse(BaseModel):
    success: bool = True
    profile: StudentProfile

# PARENT PROFILE MODEL - Separate collection  
class ParentProfile(BaseModel):
    userId: str
    youngLearners: List[dict] = Field(default_factory=list)
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    preferredContactMethod: Optional[str] = None
    parentingStyle: Optional[str] = None

class ParentProfileCreate(BaseModel):
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    preferredContactMethod: Optional[str] = None

class ParentProfileUpdate(BaseModel):
    youngLearners: Optional[List[dict]] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    preferredContactMethod: Optional[str] = None
    parentingStyle: Optional[str] = None

class ParentProfileResponse(BaseModel):
    success: bool = True
    profile: ParentProfile