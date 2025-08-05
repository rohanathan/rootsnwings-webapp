"""
User onboarding APIs - simple endpoints for profile completion
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.services.firestore import db

router = APIRouter(
    prefix="/user-onboarding",
    tags=["User Onboarding"]
)

# Request Models
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
    # Teaching modes & languages
    teachingModes: List[str]  # "atHome", "travel", "online"
    languages: List[str]
    # Safety & pricing
    dbsCheck: bool
    photo: str  # Required Firebase Storage URL
    pricing: Dict[str, Any]  # {oneOnOne: float, group: float}
    firstsessionfree: Optional[bool] = False

# Endpoints
@router.post("/")
def complete_onboarding(data: CompleteOnboarding):
    """Complete entire user onboarding in one request"""
    try:
        # Validate required fields based on roles
        if "learner" in data.roles and (not data.learningGoals or not data.interests):
            raise HTTPException(status_code=400, detail="Learning goals and interests are required for learners")
        
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
        
        # Create student profile if learner role selected
        if "learner" in data.roles:
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
                "student": "learner" in data.roles,
                "parent": "parent" in data.roles
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete onboarding: {str(e)}")

@router.post("/mentor")
def complete_mentor_onboarding(data: MentorOnboarding):
    """Complete mentor onboarding - extends basic user onboarding"""
    try:
        # Get user data to reuse location and basic info
        user_doc = db.collection('users').document(data.userId).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found. Complete basic onboarding first.")
        
        user_data = user_doc.to_dict()
        
        # Validate user has mentor role
        if "mentor" not in user_data.get("roles", []):
            raise HTTPException(status_code=400, detail="User must have mentor role. Complete basic onboarding first.")
        
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
            # Reuse location from user profile
            "city": user_data.get("location", {}).get("city"),
            "region": user_data.get("location", {}).get("region"),
            "country": user_data.get("location", {}).get("country"),
            "postcode": user_data.get("location", {}).get("postcode"),
            "pricing": {
                "oneOnOneRate": float(data.pricing.get("oneOnOne", 0)),
                "groupRate": float(data.pricing.get("group", 0)),
                "currency": "GBP",
                "firstSessionFree": data.firstsessionfree or False
            },
            "photoURL": data.photo,
            "backgroundChecked": data.dbsCheck,
            "acceptingNewStudents": accepting_new_students,
            "status": "pending_approval",
            "isVerified": False,
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
        
        # Update user profile
        db.collection('users').document(data.userId).update({
            "userType": "mentor",
            "mentorStatus": "pending_approval",
            "updatedAt": datetime.utcnow().isoformat()
        })
        
        return {
            "message": "Mentor onboarding completed successfully",
            "status": "pending_approval",
            "mentorId": data.userId,
            "acceptingNewStudents": accepting_new_students
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete mentor onboarding: {str(e)}")