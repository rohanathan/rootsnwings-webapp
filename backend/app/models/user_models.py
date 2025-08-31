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
    """
    User privacy controls used in profile management and system behavior.
    
    USAGE: Privacy settings page allows users to control visibility and data sharing.
    These settings affect mentor directory visibility, messaging, and data usage.
    """
    showEmail: bool = Field(False, description="PROFILE PRIVACY - whether email is visible to other users in profiles and directories")
    showPhone: bool = Field(False, description="PROFILE PRIVACY - whether phone number is visible to mentors and other users")
    showLocation: bool = Field(True, description="DIRECTORY VISIBILITY - whether location appears in mentor directory search results")
    showProfileInSearch: bool = Field(True, description="DIRECTORY VISIBILITY - whether user appears in search results and public directories")
    allowDirectMessages: bool = Field(True, description="MESSAGING CONTROL - whether other users can send direct messages")
    showOnlineStatus: bool = Field(False, description="SOCIAL FEATURES - whether online/offline status is visible to others")

class Preferences(BaseModel):
    language: str = "en"
    currency: str = "GBP"
    timezone: Optional[str] = None
    notifications: Optional[bool] = True
    privacy: Optional[PrivacySettings] = Field(default_factory=PrivacySettings)

# CLEAN USER MODEL - No redundancies
class UserBase(BaseModel):
    """
    Core user model used across profile management, dashboards, and admin interfaces.
    
    FRONTEND USAGE PATTERNS:
    - Profile Management (/user/profile): Uses displayName, photoURL, phoneNumber, location, 
      preferences for core profile editing interface
    - Student Profile (?profile_type=student): Uses role-specific data with savedMentors, 
      interests, learningGoals for student-specific functionality
    - Parent Profile (?profile_type=parent): Uses family management fields with youngLearners 
      for parent account functionality  
    - Admin Dashboard (/admin/users): Uses status, roles, email, location for user management
    - Mentor Directory: Uses student profile for saving favorite mentors functionality
    - Authentication Flow: Uses email, displayName, roles, profileComplete for auth navigation
    """
    
    # === CORE IDENTITY FIELDS (Used by ALL interfaces) ===
    email: EmailStr = Field(..., description="User's email address - displayed in admin interfaces and used for authentication/communication")
    displayName: str = Field(..., description="User's public display name - shown across all interfaces, profile headers, and messaging")
    
    # === VISUAL PROFILE FIELDS (Used by profile management and social interfaces) ===
    photoURL: Optional[str] = Field(None, description="Profile picture URL - displayed on profile pages, messaging interfaces, and social features")
    phoneNumber: Optional[str] = Field(None, description="Contact number - used in profile management and emergency contact information")
    
    # === ROLE & PERMISSION FIELDS (Used by auth flow and admin management) ===
    roles: List[UserRole] = Field(default_factory=list, description="User roles array - used for authentication navigation, admin filtering, and permission control")
    status: AccountStatus = Field(AccountStatus.ACTIVE, description="ADMIN INTERFACE - account status with colored badges for user management workflow")
    profileComplete: bool = Field(False, description="AUTH FLOW - completion flag used for onboarding navigation and profile setup guidance")
    
    # === LOCATION FIELDS (Used by profile management and geographic features) ===
    location: Optional[Location] = Field(None, description="Geographic info - used in profile display and location-based matching/search features")
    
    # === SETTINGS & PREFERENCES (Used by profile management and privacy control) ===
    preferences: Optional[Preferences] = Field(default_factory=Preferences, description="User settings - controls privacy, notifications, language, and app behavior preferences")
    
    # === PERSONAL INFORMATION FIELDS (Used by profile management and personalization) ===
    firstName: Optional[str] = Field(None, description="PROFILE MANAGEMENT - personal name field for formal identification and personalized communication")
    lastName: Optional[str] = Field(None, description="PROFILE MANAGEMENT - family name field for formal identification and contact purposes")
    pronouns: Optional[str] = Field(None, description="PROFILE MANAGEMENT - preferred pronouns for inclusive communication and respect")
    gender: Optional[str] = Field(None, description="PROFILE MANAGEMENT - optional gender identity for personalization and demographic insights")
    dob: Optional[str] = Field(None, description="PROFILE MANAGEMENT - birth date (YYYY-MM-DD) for age-appropriate content and legal compliance")

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
    savedMentors: List[str] = Field(default_factory=list)  # List of mentor UIDs
    
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
    savedMentors: Optional[List[str]] = None

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

# YOUNG LEARNER PROFILE MODEL - Separate collection
class YoungLearnerProfile(BaseModel):
    fullName: str
    dateOfBirth: str  # YYYY-MM-DD format
    parentUid: str
    gender: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    learningGoals: str = ""
    learningStyle: Optional[str] = None
    specialNeeds: Optional[str] = ""
    createdAt: datetime
    updatedAt: datetime

class YoungLearnerProfileCreate(BaseModel):
    fullName: str
    dateOfBirth: str
    parentUid: str
    gender: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    learningGoals: str = ""
    learningStyle: Optional[str] = None
    specialNeeds: Optional[str] = ""

class YoungLearnerProfileUpdate(BaseModel):
    fullName: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    interests: Optional[List[str]] = None
    learningGoals: Optional[str] = None
    learningStyle: Optional[str] = None
    specialNeeds: Optional[str] = None

class YoungLearnerProfileResponse(BaseModel):
    success: bool = True
    profile: YoungLearnerProfile

class YoungLearnerListResponse(BaseModel):
    success: bool = True
    profiles: List[YoungLearnerProfile]