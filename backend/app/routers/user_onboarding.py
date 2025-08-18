"""
User onboarding APIs - simple endpoints for profile completion
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.services.firestore import db

router = APIRouter(
    prefix="/user-onboarding",
    tags=["User Onboarding"]
)

# Request Models
class MentorPricing(BaseModel):
    """
    Flexible pricing model that accepts various frontend formats
    Priority: oneOnOneRate/groupRate > oneOnOne/group > defaults
    """
    # Preferred format (schema-compliant)
    oneOnOneRate: Optional[float] = None
    groupRate: Optional[float] = None
    currency: Optional[str] = "GBP"
    firstSessionFree: Optional[bool] = None
    
    # Alternative formats (frontend compatibility)
    oneOnOne: Optional[float] = None
    group: Optional[float] = None
    firstsessionfree: Optional[bool] = None
    
    # Allow any additional properties
    class Config:
        extra = "allow"

class CompleteOnboarding(BaseModel):
    userId: str
    # Basic profile
    phone: str
    city: str
    region: str  # county/state/province
    country: str
    postcode: Optional[str] = None
    # Roles
    roles: List[str]  # ["learner", "parent"]
    # Student profile (optional - only if "learner" in roles)
    learningGoals: Optional[str] = None
    interests: Optional[List[str]] = None
    learningStyle: Optional[str] = None
    # Parent profile (optional - only if "parent" in roles)
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    preferredContactMethod: Optional[str] = None

class MentorOnboarding(BaseModel):
    userId: str
    # Teaching preferences
    teachingRole: str  # "individual", "workshop", "both"
    subjects: List[str]
    levels: List[str]  # "beginner", "intermediate", "advanced"
    ageGroups: List[str]  # "children", "teens", "adults"
    # Bio & content
    title: str  # Maps to headline in schema
    aboutYou: str  # Maps to bio in schema
    # Location data (now included in mentor onboarding)
    city: str
    region: str
    country: str
    postalCode: Optional[str] = None
    phone: str
    # Teaching modes & languages
    teachingModes: List[str]  # "atHome", "travel", "online"
    languages: List[str]
    # Safety & pricing
    dbsCheck: bool
    photo: str  # Required Firebase Storage URL
    pricing: MentorPricing
    firstsessionfree: Optional[bool] = False

# Endpoints
@router.post("")
def complete_onboarding(data: CompleteOnboarding):
    """Complete entire user onboarding in one request"""
    try:
        # Validate required fields based on roles (support both "student" and "learner")
        has_student_role = "student" in data.roles or "learner" in data.roles
        if has_student_role and (not data.learningGoals or not data.interests):
            raise HTTPException(status_code=400, detail="Learning goals and interests are required for students")
        
        if "parent" in data.roles and (not data.emergencyContactName or not data.emergencyContactPhone or not data.preferredContactMethod):
            raise HTTPException(status_code=400, detail="Emergency contact details are required for parents")
        
        # Build location object
        location = {
            "city": data.city,
            "region": data.region,
            "country": data.country
        }
        if data.postcode:
            location["postcode"] = data.postcode
        
        # Update user profile
        db.collection('users').document(data.userId).update({
            "phoneNumber": data.phone,  # Map phone -> phoneNumber
            "location": location,
            "roles": data.roles,
            "profileComplete": True,
            "updatedAt": datetime.utcnow().isoformat()
        })
        
        # Create student profile if student/learner role selected
        if has_student_role:
            student_profile = {
                "uid": data.userId,
                "learningGoals": data.learningGoals,
                "interests": data.interests or [],
                "learningStyle": data.learningStyle,
                "isYoungLearner": False,
                "activeBookingsSummary": {
                    "count": 0,
                    "nextSession": {
                        "bookingId": None,
                        "classId": None,
                        "classTitle": None,
                        "mentorName": None,
                        "sessionDate": None,
                        "format": None
                    }
                },
                "upcomingSessions": {
                    "items": []
                },
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
            db.collection('student_profiles').document(data.userId).set(student_profile, merge=True)
        
        # Create parent profile if parent role selected
        if "parent" in data.roles:
            parent_profile = {
                "uid": data.userId,
                "emergencyContact": {
                    "name": data.emergencyContactName,
                    "phone": data.emergencyContactPhone
                },
                "preferredContactMethod": data.preferredContactMethod,
                "createdAt": datetime.utcnow().isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
            db.collection('parent_profiles').document(data.userId).set(parent_profile, merge=True)
        
        return {
            "message": "Onboarding completed successfully",
            "roles": data.roles,
            "profilesCreated": {
                "student": has_student_role,
                "parent": "parent" in data.roles
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete onboarding: {str(e)}")

@router.post("/mentor")
def complete_mentor_onboarding(data: MentorOnboarding):
    """Complete mentor onboarding - handles both user location updates and mentor profile creation"""
    try:
        # Get user data 
        user_doc = db.collection('users').document(data.userId).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found.")
        
        user_data = user_doc.to_dict()
        
        # Build location object from mentor onboarding data
        location = {
            "city": data.city,
            "region": data.region,
            "country": data.country
        }
        if data.postalCode:
            location["postcode"] = data.postalCode
        
        # Update user profile with location data and mentor role
        user_roles = user_data.get("roles", [])
        if "mentor" not in user_roles:
            user_roles.append("mentor")
        
        db.collection('users').document(data.userId).update({
            "phoneNumber": data.phone,
            "location": location,
            "roles": user_roles,
            "userType": "mentor",
            # "mentorStatus": "pending_approval",  # COMMENTED OUT - Auto-approve for testing
            "mentorStatus": "active",  # AUTO-APPROVE for testing
            "profileComplete": True,
            "updatedAt": datetime.utcnow().isoformat()
        })
        
        # Map teachingRole to acceptingNewStudents
        accepting_mapping = {
            "individual": {"oneOnOne": True, "group": False},
            "workshop": {"oneOnOne": False, "group": True}, 
            "both": {"oneOnOne": True, "group": True}
        }
        accepting_new_students = accepting_mapping.get(data.teachingRole, {"oneOnOne": True, "group": True})
        
        # Map teachingModes 
        teaching_modes_mapping = {
            "atHome": "in-person",
            "travel": "in-person", 
            "online": "online"
        }
        mapped_teaching_modes = []
        for mode in data.teachingModes:
            mapped_mode = teaching_modes_mapping.get(mode, mode)
            if mapped_mode not in mapped_teaching_modes:
                mapped_teaching_modes.append(mapped_mode)
        
        # Get displayName from user data
        first_name = user_data.get("firstName", "User")
        last_name = user_data.get("lastName", "")
        last_initial = last_name[0].upper() if last_name else ""
        display_name = f"{first_name} {last_initial}" if last_initial else first_name
        
        # Create mentor profile using schema structure
        mentor_profile = {
            "uid": data.userId,
            "displayName": display_name,
            "headline": data.title,  # Frontend title → schema headline
            "bio": data.aboutYou,    # Frontend aboutYou → schema bio
            "category": data.subjects[0] if data.subjects else "other",
            "subjects": data.subjects,
            "teachingLevels": data.levels,
            "ageGroups": data.ageGroups,
            "teachingModes": mapped_teaching_modes,
            "languages": data.languages,
            # Use location from mentor onboarding data
            "city": data.city,
            "region": data.region,
            "country": data.country,
            "postcode": data.postalCode,
            "pricing": {
                "oneOnOneRate": float(
                    data.pricing.oneOnOneRate or 
                    data.pricing.oneOnOne or 
                    0
                ),
                "groupRate": float(
                    data.pricing.groupRate or 
                    data.pricing.group or 
                    0
                ),
                "currency": data.pricing.currency or "GBP",
                "firstSessionFree": (
                    data.firstsessionfree or 
                    data.pricing.firstsessionfree or
                    data.pricing.firstSessionFree or
                    False
                )
            },
            "photoURL": data.photo,
            "backgroundChecked": data.dbsCheck,
            "acceptingNewStudents": accepting_new_students,
            # "status": "pending_approval",  # COMMENTED OUT - Auto-approve for testing
            "status": "active",  # AUTO-APPROVE for testing
            # "isVerified": False,  # COMMENTED OUT - Auto-approve for testing
            "isVerified": True,  # AUTO-VERIFY for testing
            "stats": {
                "avgRating": 0,
                "totalReviews": 0,
                "totalStudents": 0,
                "totalSessions": 0,
                "responseTimeMinutes": 999,
                "repeatStudentRate": 0
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        # Save mentor profile
        db.collection('mentors').document(data.userId).set(mentor_profile)
        
        return {
            "message": "Mentor onboarding completed successfully",
            # "status": "pending_approval",  # COMMENTED OUT - Auto-approve for testing
            "status": "active",  # AUTO-APPROVE for testing
            "mentorId": data.userId,
            "acceptingNewStudents": accepting_new_students,
            "userUpdated": True,
            "locationSaved": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete mentor onboarding: {str(e)}")